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

    console.log('[threads/callback] 📦 Respuesta de token:', JSON.stringify(tokens, null, 2));
    console.log('[threads/callback] 🔑 Token obtenido:', tokens.access_token ? 'SÍ' : 'NO');

    if (tokens.error_type || tokens.error_message || !tokens.access_token) {
      console.error('[threads/callback] ❌ Error en token:', tokens);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=threads_token_error`);
    }

    // 2. Intercambiar por token de larga duración (60 días) via graph.threads.net
    console.log('[threads/callback] 🔑 Refresh token recibido:', tokens.refresh_token ? 'SÍ' : 'NO');
    
    let longLivedToken = tokens.access_token;
    let expiresInSeconds = 60 * 24 * 60 * 60; // fallback 60 días

    if (tokens.refresh_token) {
      console.log('[threads/callback] 🔄 Obteniendo token de larga duración...');
      const refreshResponse = await fetch('https://graph.threads.net/refresh_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'ig_refresh_token',
          refresh_token: tokens.refresh_token,
          client_secret: threadsAppSecret,
        }),
      });

      const refreshData = await refreshResponse.json();
      console.log('[threads/callback] 🔄 Refresh token response:', JSON.stringify(refreshData, null, 2));

      if (refreshData.error) {
        console.error('[threads/callback] ❌ Error en token largo:', refreshData.error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=threads_exchange_error`);
      }

      longLivedToken = refreshData.access_token;
      expiresInSeconds = refreshData.expires_in || expiresInSeconds;
    }

    console.log('[threads/callback] 🔄 Token largo obtenido:', longLivedToken ? 'SÍ' : 'NO');
    console.log('[threads/callback] ✅ Token obtenido');

    // 3. Obtener info del usuario de Threads
    console.log('[threads/callback] 👤 Obteniendo info del usuario Threads...');
    console.log('[threads/callback] 🔑 Token usado para me:', longLivedToken ? 'PRESENTE' : 'FALTA');
    console.log('[threads/callback] 🔑 Token (primeros 20 chars):', longLivedToken?.substring(0, 20));

    const meResponse = await fetch('https://graph.threads.net/me?fields=id,username', {
      headers: {
        Authorization: `Bearer ${longLivedToken}`,
        'User-Agent': 'PostyApp/1.0'
      }
    });
    const meData = await meResponse.json();
    console.log('[threads/callback] 📡 Status de meResponse:', meResponse.status);
    console.log('[threads/callback] 👤 Datos de me:', JSON.stringify(meData, null, 2));

    if (!meData.id) {
      console.error('[threads/callback] ❌ No se obtuvo perfil de Threads:', meData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_threads_account`
      );
    }

    const finalThreadsUserId = meData.id;
    const threadsUsername = meData.username || `user_${finalThreadsUserId}`;

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
