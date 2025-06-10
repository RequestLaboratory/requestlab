// Google OAuth configuration
const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = env.FRONTEND_URL;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper to handle CORS preflight
function handleCors(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
}

// Helper to add CORS headers to any response
function addCorsHeaders(response) {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // Google OAuth login endpoint
    if (path === '/auth/google') {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'email profile');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      return Response.redirect(authUrl.toString());
    }

    // Google OAuth callback endpoint
    if (path === '/auth/google/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return Response.redirect(`${FRONTEND_URL}?error=no_code`);
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          console.error('Token exchange error:', error);
          return Response.redirect(`${FRONTEND_URL}?error=token_exchange_failed`);
        }

        const tokens = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        if (!userResponse.ok) {
          const error = await userResponse.json();
          console.error('User info error:', error);
          return Response.redirect(`${FRONTEND_URL}?error=user_info_failed`);
        }

        const userInfo = await userResponse.json();

        // Create session
        const sessionId = crypto.randomUUID();
        const session = {
          id: sessionId,
          user: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };

        // Store session in KV
        await env.SESSIONS.put(sessionId, JSON.stringify(session), {
          expirationTtl: 86400, // 24 hours
        });

        // Redirect to frontend with session cookie
        return Response.redirect(`${FRONTEND_URL}?session=${sessionId}`);
      } catch (error) {
        console.error('Auth error:', error);
        return Response.redirect(`${FRONTEND_URL}?error=auth_failed`);
      }
    }

    // Session validation endpoint
    if (path === '/auth/session') {
      const sessionId = request.headers.get('Authorization')?.split(' ')[1];
      if (!sessionId) {
        return addCorsHeaders(new Response(JSON.stringify({ authenticated: false }), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      const session = await env.SESSIONS.get(sessionId);
      if (!session) {
        return addCorsHeaders(new Response(JSON.stringify({ authenticated: false }), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      return addCorsHeaders(new Response(session, {
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    // Logout endpoint
    if (path === '/auth/logout') {
      const sessionId = request.headers.get('Authorization')?.split(' ')[1];
      if (sessionId) {
        await env.SESSIONS.delete(sessionId);
      }

      return addCorsHeaders(new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    return addCorsHeaders(new Response('Not found', { status: 404 }));
  },
}; 