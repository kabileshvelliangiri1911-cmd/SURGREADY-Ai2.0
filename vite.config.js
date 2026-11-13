import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Lightweight dev server plugin to handle Google OAuth 2.0 authorization code exchange
const googleOAuthPlugin = (env) => ({
  name: 'google-oauth-exchange-handler',
  configureServer(server) {
    server.middlewares.use('/api/auth/google/exchange', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const code = parsed.code;
          const redirectUri = parsed.redirect_uri || 'http://localhost:5173/auth/callback';
          const clientId = parsed.client_id || env.VITE_GOOGLE_CLIENT_ID;
          const clientSecret = parsed.client_secret || env.VITE_GOOGLE_CLIENT_SECRET;

          const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          });

          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          });

          const tokenData = await tokenRes.json();
          if (tokenData.error) {
            res.statusCode = tokenRes.status || 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(tokenData));
            return;
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

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ tokens: tokenData, user: userInfo }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), googleOAuthPlugin(env)],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})
