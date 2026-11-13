/**
 * Vercel Serverless Function: Google OAuth 2.0 Code Exchange
 * Securely exchanges authorization code for tokens server-side using Vercel environment variables
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { code, redirect_uri, client_id, client_secret } = body;

    const fallbackClientId = [
      '102487345752-0ubj6s854r30s7h35r501hcuo556a027',
      'apps',
      'googleusercontent',
      'com'
    ].join('.');

    const effectiveClientId =
      client_id ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      fallbackClientId;

    const effectiveClientSecret =
      client_secret ||
      process.env.VITE_GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET;

    const effectiveRedirectUri = redirect_uri || 'https://surgready-ai1.vercel.app/';

    if (!code) {
      return res.status(400).json({ error: 'Missing required authorization code.' });
    }

    if (!effectiveClientSecret) {
      return res.status(500).json({
        error: 'VITE_GOOGLE_CLIENT_SECRET is not configured in Vercel Environment Variables.'
      });
    }

    const params = new URLSearchParams({
      code,
      client_id: effectiveClientId,
      client_secret: effectiveClientSecret,
      redirect_uri: effectiveRedirectUri,
      grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.status(tokenRes.status || 400).json(tokenData);
    }

    let userInfo = {};
    if (tokenData.access_token) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (userRes.ok) {
        userInfo = await userRes.json();
      }
    }

    return res.status(200).json({ tokens: tokenData, user: userInfo });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'OAuth exchange failed.' });
  }
}
