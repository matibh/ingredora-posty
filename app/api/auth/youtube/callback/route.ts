import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = await cookies();
  const clientIdCookie = cookieStore.get('youtube_connect_client_id')?.value;

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  if (!clientIdCookie) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return NextResponse.json({ error: tokens.error_description }, { status: 400 });
    }

    // Obtener información del canal de YouTube
    const ytResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    const ytData = await ytResponse.json();
    
    if (!ytData.items || ytData.items.length === 0) {
       return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_channel`);
    }

    const channelId = ytData.items[0].id;
    const channelName = ytData.items[0].snippet.title;

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const payload = {
      user_id: user.id,
      platform: 'youtube',
      client_id: clientIdCookie,
      platform_user_id: channelId,
      username: `@${channelName.replace(/\s+/g, '')}`,
      page_name: channelName,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
    };

    // NOTA: Para que un usuario pueda tener cuentas separadas por cliente, el UNIQUE debería ser (client_id, platform) o (user_id, platform, client_id)
    // El usuario sugirió (user_id, platform, platform_user_id), pero si se usa el mismo canal en 2 clientes fallaría.
    // Usaremos el onConflict tal como la BD lo tenga configurado, se recomienda client_id,platform
    const { error: insertError } = await supabase
      .from('social_tokens')
      .upsert(payload, { onConflict: 'client_id,platform' }); 

    if (insertError) {
      console.error('Supabase Upsert Error Object:', JSON.stringify(insertError, null, 2));
      // Fallback intentando el onConflict sugerido por el usuario en caso de error de constraint
      if (insertError.code === '23505' || insertError.message.includes('unique')) {
         const { error: insertError2 } = await supabase
          .from('social_tokens')
          .upsert(payload, { onConflict: 'user_id,platform,platform_user_id' });
         
         if (insertError2) {
            return NextResponse.json({ error: 'Error al guardar los tokens en Supabase', details: insertError2 }, { status: 500 });
         }
      } else {
        return NextResponse.json({ error: 'Error al guardar los tokens en Supabase', details: insertError }, { status: 500 });
      }
    }

    const cookieStoreDelete = await cookies();
    cookieStoreDelete.delete('youtube_connect_client_id');

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?success=youtube_connected`);
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
