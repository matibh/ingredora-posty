import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = await cookies();
  const clientIdCookie = cookieStore.get('instagram_connect_client_id')?.value;

  console.log('[instagram/callback] 🚀 Callback recibido');
  console.log('[instagram/callback] 🔑 App ID usado:', process.env.INSTAGRAM_APP_ID);
  console.log('[instagram/callback] 📥 Código recibido:', code ? 'presente' : 'FALTA');
  console.log('[instagram/callback] 🍪 Cookie clientId:', clientIdCookie || 'FALTA');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  if (!clientIdCookie) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
  }

  const instagramAppId = process.env.INSTAGRAM_APP_ID!;
  const instagramAppSecret = process.env.INSTAGRAM_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

  try {
    // 1. Intercambiar código por token de corta duración usando la API de Instagram
    // IMPORTANTE: cuando el código viene de instagram.com/oauth/authorize,
    // el intercambio se hace en api.instagram.com (NO graph.facebook.com)
    console.log('[instagram/callback] 🔄 Intercambiando código por token en api.instagram.com...');
    const tokenBody = new URLSearchParams({
      client_id: instagramAppId,
      client_secret: instagramAppSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });
    const tokens = await tokenResponse.json();

    console.log('[instagram/callback] 🔄 Respuesta de token:', JSON.stringify(tokens));

    if (tokens.error_type || tokens.error_message || !tokens.access_token) {
      console.error('[instagram/callback] ❌ Error en token:', tokens);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=instagram_token_error`);
    }

    const shortLivedToken = tokens.access_token;
    const igUserId = tokens.user_id?.toString();

    // 2. Intercambiar por token de larga duración (60 días) via graph.instagram.com
    console.log('[instagram/callback] 🔄 Obteniendo token de larga duración...');
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${instagramAppSecret}&access_token=${shortLivedToken}`
    );
    const longLivedTokens = await longLivedResponse.json();

    console.log('[instagram/callback] 🔄 Respuesta token largo:', JSON.stringify(longLivedTokens));

    if (longLivedTokens.error) {
      console.error('[instagram/callback] ❌ Error en token largo:', longLivedTokens.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=instagram_exchange_error`);
    }

    const longLivedToken = longLivedTokens.access_token;
    const expiresInSeconds = longLivedTokens.expires_in || (60 * 24 * 60 * 60);

    // 3. Obtener info del usuario de Instagram
    console.log('[instagram/callback] 👤 Obteniendo info del usuario IG...');
    const igInfoResponse = await fetch(
      `https://graph.instagram.com/v22.0/me?fields=id,username,name&access_token=${longLivedToken}`
    );
    const igInfo = await igInfoResponse.json();

    console.log('[instagram/callback] 👤 Info usuario IG:', JSON.stringify(igInfo));

    const igUsername = igInfo.username || `user_${igUserId}`;
    const igName = igInfo.name || igUsername;
    const finalIgUserId = igInfo.id || igUserId;

    if (!finalIgUserId) {
      console.error('[instagram/callback] ❌ No se pudo obtener el ID de Instagram');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_instagram_account`);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const payload = {
      user_id: user.id,
      platform: 'instagram',
      client_id: clientIdCookie,
      platform_user_id: finalIgUserId,
      username: igUsername,
      page_name: igName,
      access_token: longLivedToken,
      refresh_token: null,
      expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };

    console.log('[instagram/callback] 💾 Guardando token en Supabase para IG user:', finalIgUserId);

    const { error: insertError } = await supabase
      .from('social_tokens')
      .upsert(payload, { onConflict: 'user_id,platform,platform_user_id' });

    if (insertError) {
      console.error('[instagram/callback] ❌ Supabase Upsert Error:', insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=database_error`);
    }

    const cookieStoreDelete = await cookies();
    cookieStoreDelete.delete('instagram_connect_client_id');

    console.log('[instagram/callback] ✅ Instagram conectado exitosamente');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?success=instagram_connected`);
  } catch (error) {
    console.error('[instagram/callback] ❌ Error inesperado:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=internal_server_error`);
  }
}
