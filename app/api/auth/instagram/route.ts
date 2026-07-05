import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientIdParam = searchParams.get('clientId');

    console.log('[instagram/route] 🚀 Iniciando flujo OAuth de Instagram');
    console.log('[instagram/route] 🔑 App ID usado:', process.env.INSTAGRAM_APP_ID);

    if (!clientIdParam) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
    }

    // Save clientId in cookie
    const cookieStore = await cookies();
    cookieStore.set('instagram_connect_client_id', clientIdParam, {
      maxAge: 60 * 10, // 10 minutes
      httpOnly: true,
      path: '/',
    });

    const instagramAppId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

    // Scope para Instagram OAuth (solo permisos de IG, no de Facebook Pages)
    const scope = encodeURIComponent('instagram_business_basic instagram_business_content_publish');

    // Instagram OAuth dialog URL (instagram.com, NO facebook.com)
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    console.log('[instagram/route] 🔗 URL de autorización:', authUrl);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error in Instagram auth route:', error);
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
      .eq('platform', 'instagram');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Instagram:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
