export async function refreshMetaToken(
  accessToken: string,
  appId: string,
  appSecret: string
): Promise<{ access_token: string; expires_at: string }> {
  const url = new URL('https://graph.facebook.com/v22.0/oauth/access_token');
  url.searchParams.append('grant_type', 'fb_exchange_token');
  url.searchParams.append('client_id', appId);
  url.searchParams.append('client_secret', appSecret);
  url.searchParams.append('fb_exchange_token', accessToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  if (!data.access_token) {
    throw new Error('Meta no devolvió un access token durante la renovación');
  }

  const expiresInSeconds = data.expires_in || 5184000; // default 60 días si no viene
  const newExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  return { access_token: data.access_token, expires_at: newExpiresAt };
}
