import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = await cookies();
  const clientIdCookie = cookieStore.get('instagram_connect_client_id')?.value;

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
    // 1. Get short-lived token
    const tokenResponse = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?client_id=${instagramAppId}&redirect_uri=${redirectUri}&client_secret=${instagramAppSecret}&code=${code}`);
    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Meta OAuth error:', tokens.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=meta_oauth_error`);
    }

    const shortLivedToken = tokens.access_token;

    // 2. Exchange for long-lived token
    const longLivedResponse = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${instagramAppId}&client_secret=${instagramAppSecret}&fb_exchange_token=${shortLivedToken}`);
    const longLivedTokens = await longLivedResponse.json();

    if (longLivedTokens.error) {
      console.error('Meta Long Lived Token error:', longLivedTokens.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=meta_exchange_error`);
    }

    const longLivedToken = longLivedTokens.access_token;
    const expiresInSeconds = longLivedTokens.expires_in || (60 * 24 * 60 * 60);

    // 3. Get User Accounts (Pages) and their connected Instagram Business Accounts
    const accountsResponse = await fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=id,name,instagram_business_account&access_token=${longLivedToken}`);
    const accountsData = await accountsResponse.json();

    if (accountsData.error || !accountsData.data || accountsData.data.length === 0) {
      console.error('Meta accounts error or no pages found:', accountsData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_facebook_pages`);
    }

    // Find the first page with an instagram_business_account
    const pageWithIg = accountsData.data.find((page: any) => page.instagram_business_account);

    if (!pageWithIg) {
      console.error('No Instagram Business Account connected to any Facebook Page');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_instagram_account`);
    }

    const pageAccessToken = pageWithIg.access_token; // Wait, me/accounts doesn't always return access_token if fields are specified? 
    // Actually, when specifying ?fields=id,name,instagram_business_account, it might drop access_token unless explicitly requested!
    // I should fetch fields=id,name,access_token,instagram_business_account
    
    // So let me fetch with access_token included in fields
    const accountsResponseWithToken = await fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longLivedToken}`);
    const accountsDataWithToken = await accountsResponseWithToken.json();

    const pageWithIgWithToken = accountsDataWithToken.data.find((page: any) => page.instagram_business_account);

    if (!pageWithIgWithToken) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_instagram_account`);
    }

    const igUserId = pageWithIgWithToken.instagram_business_account.id;
    const finalPageAccessToken = pageWithIgWithToken.access_token;

    // Optional: Get IG username using the igUserId
    const igInfoResponse = await fetch(`https://graph.facebook.com/v22.0/${igUserId}?fields=username,name&access_token=${finalPageAccessToken}`);
    const igInfo = await igInfoResponse.json();
    const igUsername = igInfo.username || pageWithIgWithToken.name;
    const igName = igInfo.name || igUsername;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const payload = {
      user_id: user.id,
      platform: 'instagram',
      client_id: clientIdCookie,
      platform_user_id: igUserId,
      username: igUsername,
      page_name: igName,
      access_token: finalPageAccessToken,
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

    const cookieStoreDelete = await cookies();
    cookieStoreDelete.delete('instagram_connect_client_id');

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?success=instagram_connected`);
  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=internal_server_error`);
  }
}
