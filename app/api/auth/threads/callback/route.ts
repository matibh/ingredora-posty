import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = await cookies();
  const clientIdCookie = cookieStore.get('threads_connect_client_id')?.value;

  console.log('[threads/callback] 🚀 Callback recibido');
  console.log('[threads/callback] 🔑 App ID usado:', process.env.THREADS_APP_ID);
  console.log('[threads/callback] 📥 Código recibido:', code ? 'presente' : 'FALTA');
  console.log('[threads/callback] 🍪 Cookie clientId:', clientIdCookie || 'FALTA');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  if (!clientIdCookie) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
  }

  const threadsAppId = process.env.THREADS_APP_ID!;
  const threadsAppSecret = process.env.THREADS_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/threads/callback`;

  try {
    // 1. Intercambiar código por token de corta duración usando la API de Threads
    console.log('[threads/callback] 🔄 Intercambiando código por token...');
    const tokenBody = new URLSearchParams({
      client_id: threadsAppId,
      client_secret: threadsAppSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    const tokenResponse = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });
    const tokens = await tokenResponse.json();

    console.log('[threads/callback] 🔄 Respuesta de token:', JSON.stringify(tokens));

    if (tokens.error_type || tokens.error_message || !tokens.access_token) {
      console.error('[threads/callback] ❌ Error en token:', tokens);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=threads_token_error`);
    }

    const shortLivedToken = tokens.access_token;

    // 2. Intercambiar por token de larga duración (60 días) via graph.threads.net
    console.log('[threads/callback] 🔄 Obteniendo token de larga duración...');
    const longLivedResponse = await fetch(
      `https://graph.threads.net/access_token?grant_type=ig_exchange_token&client_secret=${threadsAppSecret}&access_token=${shortLivedToken}`
    );
    const longLivedTokens = await longLivedResponse.json();

    console.log('[threads/callback] 🔄 Respuesta token largo:', JSON.stringify(longLivedTokens));

    if (longLivedTokens.error) {
      console.error('[threads/callback] ❌ Error en token largo:', longLivedTokens.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=threads_exchange_error`);
    }

    const longLivedToken = longLivedTokens.access_token;
    const expiresInSeconds = longLivedTokens.expires_in || (60 * 24 * 60 * 60);
    console.log('[threads/callback] ✅ Token obtenido');

    // 3. Obtener info del usuario de Threads
    console.log('[threads/callback] 👤 Obteniendo info del usuario Threads...');
    const threadsInfoResponse = await fetch(
      `https://graph.threads.net/v22.0/me?fields=id,username&access_token=${longLivedToken}`
    );
    const threadsInfo = await threadsInfoResponse.json();

    console.log('[threads/callback] 👤 Info usuario Threads:', JSON.stringify(threadsInfo));

    const finalThreadsUserId = threadsInfo.id;
    const threadsUsername = threadsInfo.username || `user_${finalThreadsUserId}`;

    if (!finalThreadsUserId) {
      console.error('[threads/callback] ❌ No se pudo obtener el ID de Threads');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_threads_account`);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const payload = {
      user_id: user.id,
      platform: 'threads',
      client_id: clientIdCookie,
      platform_user_id: finalThreadsUserId,
      username: threadsUsername,
      page_name: threadsUsername,
      access_token: longLivedToken,
      refresh_token: null,
      expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };

    console.log('[threads/callback] 💾 Guardando token en Supabase para Threads user:', finalThreadsUserId);

    const { error: insertError } = await supabase
      .from('social_tokens')
      .upsert(payload, { onConflict: 'user_id,platform,platform_user_id' });

    if (insertError) {
      console.error('[threads/callback] ❌ Supabase Upsert Error:', insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=database_error`);
    }

    const cookieStoreDelete = await cookies();
    cookieStoreDelete.delete('threads_connect_client_id');

    console.log('[threads/callback] ✅ Threads conectado exitosamente');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?success=threads_connected`);
  } catch (error) {
    console.error('[threads/callback] ❌ Error inesperado:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=internal_server_error`);
  }
}
