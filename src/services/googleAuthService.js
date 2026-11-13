/**
 * Google OAuth 2.0 Authentication Service for SurgReady AI
 * Handles "Continue with Google" authentication using the configured Google OAuth 2.0 credentials.
 * Supports:
 * 1. Google Identity Services (GIS) token client popup flow (modern, smooth SPA UX).
 * 2. Full OAuth 2.0 authorization redirect flow (with code exchange using client_id & client_secret).
 * 3. User normalization to SurgReady AI clinical / administrative personas.
 */

const FALLBACK_CLIENT_ID = [
  '102487345752-0ubj6s854r30s7h35r501hcuo556a027',
  'apps',
  'googleusercontent',
  'com'
].join('.');

export const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
  FALLBACK_CLIENT_ID;

export const GOOGLE_CLIENT_SECRET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_SECRET) ||
  '';

/**
 * Returns the exact authorized redirect URI registered with Google Cloud Console
 */
export const getGoogleRedirectUri = () => {
  if (typeof window === 'undefined') return 'https://surgready-ai1.vercel.app/';
  const origin = window.location.origin;
  if (origin.includes('surgready-ai1.vercel.app')) {
    return 'https://surgready-ai1.vercel.app/';
  }
  return `${origin}/`;
};

/**
 * Ensures Google Identity Services (GIS) script is loaded into the document head
 */
export const loadGoogleScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.google?.accounts?.oauth2) return resolve(true);

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      if (window.google?.accounts?.oauth2) return resolve(true);
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

/**
 * Triggers Google OAuth via Google Identity Services (GIS) popup token client
 * Returns Google user info (email, name, picture, sub)
 */
export const requestGoogleTokenViaPopup = async () => {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services SDK could not be initialized in this browser.'));
    }

    let isSettled = false;

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (isSettled) return;
          isSettled = true;

          if (tokenResponse.error) {
            reject(
              new Error(tokenResponse.error_description || tokenResponse.error || 'Google authentication was not completed.')
            );
            return;
          }

          if (!tokenResponse.access_token) {
            reject(new Error('No access token received from Google.'));
            return;
          }

          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`
              }
            });

            if (!userInfoRes.ok) {
              throw new Error(`Google userinfo request failed [HTTP ${userInfoRes.status}].`);
            }

            const userInfo = await userInfoRes.json();
            resolve({
              ...userInfo,
              accessToken: tokenResponse.access_token
            });
          } catch (fetchErr) {
            reject(fetchErr);
          }
        },
        error_callback: (err) => {
          if (isSettled) return;
          isSettled = true;
          reject(new Error(err?.message || 'Google OAuth dialog error.'));
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (initErr) {
      reject(initErr);
    }
  });
};

/**
 * Redirects the entire browser to Google's OAuth 2.0 Authorization Endpoint
 * Used as fallback if popups are disabled or blocked
 */
export const redirectToGoogleOAuth = (portalRole = 'doctor') => {
  const redirectUri = getGoogleRedirectUri();
  const statePayload = JSON.stringify({ role: portalRole, timestamp: Date.now() });

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', encodeURIComponent(statePayload));

  window.location.href = authUrl.toString();
};

/**
 * Exchanges Google authorization code for token and retrieves user info
 * Uses client_id and client_secret
 */
export const exchangeGoogleCode = async (code, redirectUri) => {
  const uri = redirectUri || getGoogleRedirectUri();

  // 1. Try local dev server / Vercel serverless exchange endpoint first
  try {
    const exchangeRes = await fetch('/api/auth/google/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirect_uri: uri,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET
      })
    });

    if (exchangeRes.ok) {
      const data = await exchangeRes.json();
      if (data.user) {
        return data.user;
      }
    }
  } catch (err) {
    console.warn('[Google Auth] Exchange proxy notice:', err);
  }

  // 2. Direct token exchange fallback
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: uri,
      grant_type: 'authorization_code'
    })
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }

  // If id_token returned, decode JWT payload
  if (tokenData.id_token) {
    try {
      const payloadBase64 = tokenData.id_token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      return {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub
      };
    } catch (_) {}
  }

  // If access_token returned, fetch userinfo
  if (tokenData.access_token) {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    if (userRes.ok) {
      return await userRes.json();
    }
  }

  throw new Error('Unable to extract Google user credentials from OAuth exchange response.');
};

/**
 * Normalizes a Google user into a full SurgReady AI portal persona
 */
export const buildHospitalUserFromGoogle = (googleUser, role = 'doctor') => {
  const cleanRole = (role || 'doctor').toLowerCase();
  const cleanEmail = (googleUser.email || '').trim().toLowerCase();
  const rawName = googleUser.name || cleanEmail.split('@')[0] || 'Hospital Staff';

  let formattedName = rawName;
  if (cleanRole === 'doctor' && !rawName.toLowerCase().startsWith('dr.')) {
    formattedName = `Dr. ${rawName}, MD`;
  }

  const roleDepartmentMap = {
    doctor: 'Orthopedic Surgery',
    nurse: 'Surgical Services & Checklist Care',
    management: 'Hospital Administration & Inventory Management',
    patient: 'Patient Recovery & Pre-Op Services'
  };

  const roleDesignationMap = {
    doctor: 'Lead Attending Surgeon',
    nurse: 'Charge Nurse & OR Coordinator',
    management: 'Hospital Operations Director',
    patient: 'Surgical Candidate'
  };

  return {
    id: 'usr_g_' + (googleUser.sub || Date.now()),
    auth_user_id: 'usr_g_' + (googleUser.sub || Date.now()),
    name: formattedName,
    email: cleanEmail,
    role: cleanRole,
    hospital: 'St. Jude Medical Center',
    department: roleDepartmentMap[cleanRole] || 'Hospital Services',
    designation: roleDesignationMap[cleanRole] || 'Hospital Staff',
    phone: '+1 (555) 789-1000',
    avatar: googleUser.picture || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
    status: 'active',
    approval_status: 'approved',
    provider: 'google'
  };
};
