import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    console.log('--- YOUTUBE ROUTE START ---');
    const { searchParams } = new URL(request.url);
    const clientIdParam = searchParams.get('clientId');

    console.log('clientId:', clientIdParam);

    if (!clientIdParam) {
      console.log('No clientId, redirecting to error');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
    }

    // Guardar clientId en cookie
    console.log('Setting cookie with clientId:', clientIdParam);
    const cookieStore = await cookies();
    cookieStore.set('youtube_connect_client_id', clientIdParam, {
      maxAge: 60 * 10, // 10 minutos
      httpOnly: true,
      path: '/',
    });
    console.log('Cookie set successfully');

    console.log('Building Google auth URL');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`;
    
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    console.log('Google auth URL:', authUrl);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error in YouTube auth route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientIdParam = searchParams.get('clientId');

    if (!clientIdParam) {
      return NextResponse.json({ error: 'Falta clientId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('social_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('client_id', clientIdParam)
      .eq('platform', 'youtube');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting YouTube:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
