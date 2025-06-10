// Google OAuth configuration
const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = env.FRONTEND_URL;

// Supabase configuration
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

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

// Supabase helper functions
async function createSession(sessionData) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(sessionData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create session: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

async function getSession(sessionId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get session: ${response.statusText} - ${errorText}`);
  }

  const sessions = await response.json();
  return sessions[0];
}

async function deleteSession(sessionId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete session: ${response.statusText} - ${errorText}`);
  }

  return response.json();
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
      console.log('Received callback with code:', code);
      console.log('Frontend URL:', FRONTEND_URL);
      console.log('Full URL:', url.toString());
      console.log('All search params:', Object.fromEntries(url.searchParams));
      
      if (!code) {
        console.log('No code received, redirecting to error');
        return Response.redirect(`${FRONTEND_URL}?error=no_code`);
      }

      try {
        // Exchange code for tokens
        const tokenRequestBody = new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        });

        console.log('Token request body:', tokenRequestBody.toString());
        console.log('Redirect URI being used:', GOOGLE_REDIRECT_URI);

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenRequestBody,
        });

        const responseText = await tokenResponse.text();
        console.log('Token response status:', tokenResponse.status);
        console.log('Token response text:', responseText);

        if (!tokenResponse.ok) {
          let error;
          try {
            error = JSON.parse(responseText);
          } catch (e) {
            error = { error: 'unknown', error_description: responseText };
          }
          console.error('Token exchange error:', error);
          return Response.redirect(`${FRONTEND_URL}?error=token_exchange_failed&details=${encodeURIComponent(error.error_description || error.error)}`);
        }

        const tokens = JSON.parse(responseText);
        console.log('Successfully exchanged code for tokens');

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
        console.log('Successfully got user info:', userInfo.email);

        // Create session data
        const sessionId = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

        const sessionData = {
          id: sessionId,
          user_id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          created_at: now.toISOString().replace('Z', '+00:00'),
          expires_at: expiresAt.toISOString().replace('Z', '+00:00')
        };

        try {
          // Store session in Supabase
          await createSession(sessionData);
          console.log('Stored session:', sessionId);

          // Ensure FRONTEND_URL includes www and has a trailing slash
          const frontendUrl = (FRONTEND_URL.includes('www.') ? FRONTEND_URL : FRONTEND_URL.replace('requestlab.cc', 'www.requestlab.cc')).replace(/\/?$/, '/');
          console.log('Using frontend URL:', frontendUrl);

          // Create a simple HTML page that will redirect after a short delay
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Redirecting...</title>
                <meta http-equiv="refresh" content="0;url=${frontendUrl}?session=${sessionId}">
                <script>
                  // Backup redirect in case meta refresh doesn't work
                  window.location.href = "${frontendUrl}?session=${sessionId}";
                </script>
              </head>
              <body>
                <p>Redirecting to RequestLab...</p>
              </body>
            </html>
          `;

          return new Response(html, {
            headers: {
              'Content-Type': 'text/html',
            },
          });
        } catch (error) {
          console.error('Failed to store session:', error);
          return Response.redirect(`${FRONTEND_URL}?error=session_storage_failed`);
        }
      } catch (error) {
        console.error('Auth error:', error);
        return Response.redirect(`${FRONTEND_URL}?error=auth_failed&details=${encodeURIComponent(error.message)}`);
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

      try {
        const session = await getSession(sessionId);
        if (!session) {
          return addCorsHeaders(new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
          await deleteSession(sessionId);
          return addCorsHeaders(new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        return addCorsHeaders(new Response(JSON.stringify({
          authenticated: true,
          user: {
            id: session.user_id,
            email: session.email,
            name: session.name,
            picture: session.picture
          }
        }), {
          headers: { 'Content-Type': 'application/json' },
        }));
      } catch (error) {
        console.error('Session validation error:', error);
        return addCorsHeaders(new Response(JSON.stringify({ authenticated: false }), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }
    }

    // Logout endpoint
    if (path === '/auth/logout') {
      const sessionId = request.headers.get('Authorization')?.split(' ')[1];
      if (sessionId) {
        try {
          await deleteSession(sessionId);
        } catch (error) {
          console.error('Failed to delete session:', error);
        }
      }

      return addCorsHeaders(new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    return addCorsHeaders(new Response('Not found', { status: 404 }));
  },
}; 