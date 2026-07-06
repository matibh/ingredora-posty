import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientIdParam = searchParams.get('clientId');

    console.log('[threads/route] 🚀 Iniciando flujo OAuth de Threads');
    console.log('[threads/route] 🔑 App ID usado:', process.env.THREADS_APP_ID);

    if (!clientIdParam) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
    }

    // Save clientId in cookie
    const cookieStore = await cookies();
    cookieStore.set('threads_connect_client_id', clientIdParam, {
      maxAge: 60 * 10, // 10 minutes
      httpOnly: true,
      path: '/',
    });

    const threadsAppId = process.env.THREADS_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/threads/callback`;
    const scope = encodeURIComponent('threads_basic threads_content_publish');
    
    const authUrl = `https://threads.net/oauth/authorize?client_id=${threadsAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    console.log('[threads/route] 🔗 URL de autorización:', authUrl);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error in Threads auth route:', error);
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
      .eq('platform', 'threads');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Threads:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
