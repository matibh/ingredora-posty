import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = await cookies();
  const clientIdCookie = cookieStore.get('facebook_connect_client_id')?.value;

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  if (!clientIdCookie) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_client`);
  }

  const metaAppId = process.env.META_APP_ID!;
  const metaAppSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;

  try {
    // 1. Get short-lived token
    const tokenResponse = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?client_id=${metaAppId}&redirect_uri=${redirectUri}&client_secret=${metaAppSecret}&code=${code}`);
    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Meta OAuth error:', tokens.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=meta_oauth_error`);
    }

    const shortLivedToken = tokens.access_token;

    // 2. Exchange for long-lived token
    const longLivedResponse = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${shortLivedToken}`);
    const longLivedTokens = await longLivedResponse.json();

    if (longLivedTokens.error) {
      console.error('Meta Long Lived Token error:', longLivedTokens.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=meta_exchange_error`);
    }

    const longLivedToken = longLivedTokens.access_token;
    const expiresInSeconds = longLivedTokens.expires_in || (60 * 24 * 60 * 60); // approx 60 days if missing

    // 3. Get User Accounts (Pages)
    const accountsResponse = await fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token&access_token=${longLivedToken}`);
    const accountsData = await accountsResponse.json();

    if (accountsData.error || !accountsData.data || accountsData.data.length === 0) {
      console.error('Meta accounts error or no pages found:', accountsData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_facebook_pages`);
    }

    // Use the first page for now (or store all of them, but per instructions we store the first one)
    const page = accountsData.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;
    const pageName = page.name;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const payload = {
      user_id: user.id,
      platform: 'facebook',
      client_id: clientIdCookie,
      platform_user_id: pageId,
      username: pageName,
      page_name: pageName,
      access_token: pageAccessToken,
      refresh_token: null,
      expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };

    const { error: insertError } = await supabase
      .from('social_tokens')
      .upsert(payload, { onConflict: 'user_id,platform,platform_user_id' }); 

    if (insertError) {
      console.error('Supabase Upsert Error:', insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=database_error`);
    }

    cookieStore.delete('facebook_connect_client_id');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?success=facebook_connected`);
  } catch (error) {
    console.error('Facebook callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=internal_server_error`);
  }
}
