// Supabase configuration
const SUPABASE_URL = 'ADD-YOUR-SUPABASE-URL-HERE';
const SUPABASE_ANON_KEY = 'ADD-YOUR-SUPABASE-ANON-KEY-HERE';
const DB_CONNECTION_STRING = 'ADD-YOUR-DB-CONNECTION-STRING-HERE';

// Debug flag for global access (1 = bypass auth, 0 = require auth)
const GLOBAL_ACCESS = 1;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Upgrade, Connection',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

// Helper to handle CORS preflight
function handleCors(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Upgrade, Connection',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, CONNECT',
      },
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

// Generate a short unique code
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Database helper
async function dbQuery(query, params = []) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/interceptors`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: params[0],
      name: params[1],
      base_url: params[2],
      created_at: params[3],
      is_active: params[4],
      user_id: params[5]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Database query failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Database helper for SELECT queries
async function dbSelect(query, params = []) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/interceptors?${query}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Database query failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Database helper for DELETE queries
async function dbDelete(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/interceptors?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Database query failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// WebSocket Manager Durable Object
export class WebSocketManager {
  constructor(state) {
    this.connections = new Map();
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/broadcast') {
      const data = await request.json();
      await this.broadcast(data);
      return new Response('OK');
    }

    if (url.pathname === '/connect') {
      const { webSocket } = await request.json();
      await this.handleWebSocket(webSocket);
      return new Response('OK');
    }

    return new Response('Not found', { status: 404 });
  }

  async handleWebSocket(ws) {
    ws.accept();
    
    ws.addEventListener('message', async (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.addEventListener('close', () => {
      this.connections.delete(ws.toString());
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      this.connections.delete(ws.toString());
    });

    this.connections.set(ws.toString(), ws);
  }

  async broadcast(data) {
    const message = JSON.stringify(data);
    for (const ws of this.connections.values()) {
      try {
        ws.send(message);
      } catch (error) {
        console.error('Error broadcasting to WebSocket:', error);
        this.connections.delete(ws.toString());
      }
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // Handle SSE connection
    if (path === '/events') {
      // Initialize controllers set if it doesn't exist
      if (!env.EVENT_CONTROLLERS) {
        env.EVENT_CONTROLLERS = new Set();
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send initial connection message with a retry field
          controller.enqueue(encoder.encode('retry: 1000\n'));
          controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));
          
          // Store the controller
          env.EVENT_CONTROLLERS.add(controller);
          
          // Set up heartbeat interval
          const heartbeatInterval = setInterval(() => {
            try {
              controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'));
            } catch (error) {
              console.error('Error sending heartbeat:', error);
              clearInterval(heartbeatInterval);
              env.EVENT_CONTROLLERS.delete(controller);
            }
          }, 30000); // Send heartbeat every 30 seconds
          
          // Remove controller when connection closes
          request.signal.addEventListener('abort', () => {
            clearInterval(heartbeatInterval);
            env.EVENT_CONTROLLERS.delete(controller);
          });
        },
        cancel() {
          // Clean up when the stream is cancelled
          env.EVENT_CONTROLLERS.delete(controller);
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Accel-Buffering': 'no', // Disable proxy buffering
          'Transfer-Encoding': 'chunked'
        }
      });
    }

    // API endpoints
    if (path.startsWith('/api/interceptors')) {
      try {
        if (request.method === 'GET' && path === '/api/interceptors') {
          // If global access is enabled, return all interceptors without auth
          if (GLOBAL_ACCESS === 1) {
            console.log('Global access enabled, bypassing auth');
            const interceptors = await dbSelect('order=created_at.desc');
            return addCorsHeaders(new Response(JSON.stringify(interceptors), {
              headers: { 'Content-Type': 'application/json' },
            }));
          }

          // Otherwise, proceed with normal auth flow
          const authHeader = request.headers.get('Authorization');
          console.log('Auth header:', authHeader);
          if (!authHeader) {
            console.log('No auth header found');
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          const sessionId = authHeader.replace('Bearer ', '');
          console.log('Session ID:', sessionId);
          
          // Verify session and get user ID
          console.log('Verifying session with auth worker...');
          const sessionResponse = await fetch('https://googleauth.yadev64.workers.dev/auth/session', {
            headers: {
              Authorization: `Bearer ${sessionId}`,
            },
          });
          
          console.log('Session response status:', sessionResponse.status);
          if (!sessionResponse.ok) {
            console.log('Session response not OK:', await sessionResponse.text());
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          const sessionData = await sessionResponse.json();
          console.log('Session data:', sessionData);
          if (!sessionData.authenticated) {
            console.log('Session not authenticated');
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          // List interceptors for the user
          console.log('Fetching interceptors for user:', sessionData.user.id);
          const interceptors = await dbSelect(`user_id=eq.${sessionData.user.id}&order=created_at.desc`);
          console.log('Found interceptors:', interceptors);
          return addCorsHeaders(new Response(JSON.stringify(interceptors), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        if (request.method === 'POST' && path === '/api/interceptors') {
          // If global access is enabled, allow creation without auth
          if (GLOBAL_ACCESS === 1) {
            console.log('Global access enabled, bypassing auth for creation');
            const data = await request.json();
            const uniqueCode = generateUniqueCode();
            const interceptor = {
              id: uniqueCode,
              name: data.name,
              base_url: data.baseUrl,
              created_at: new Date().toISOString(),
              is_active: true,
              user_id: 'system' // Use a default user ID for global access
            };

            const result = await dbQuery('', [
              interceptor.id,
              interceptor.name,
              interceptor.base_url,
              interceptor.created_at,
              interceptor.is_active,
              interceptor.user_id
            ]);

            return addCorsHeaders(new Response(JSON.stringify(result[0]), {
              headers: { 'Content-Type': 'application/json' },
            }));
          }

          // Otherwise, proceed with normal auth flow
          const authHeader = request.headers.get('Authorization');
          if (!authHeader) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          const sessionId = authHeader.replace('Bearer ', '');
          
          // Verify session and get user ID
          const sessionResponse = await fetch('https://googleauth.yadev64.workers.dev/auth/session', {
            headers: {
              Authorization: `Bearer ${sessionId}`,
            },
          });
          
          if (!sessionResponse.ok) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          const sessionData = await sessionResponse.json();
          if (!sessionData.authenticated) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          // Create new interceptor
          const data = await request.json();
          const uniqueCode = generateUniqueCode();
          const interceptor = {
            id: uniqueCode,
            name: data.name,
            base_url: data.baseUrl,
            created_at: new Date().toISOString(),
            is_active: true,
            user_id: sessionData.user.id
          };

          const result = await dbQuery('', [
            interceptor.id,
            interceptor.name,
            interceptor.base_url,
            interceptor.created_at,
            interceptor.is_active,
            interceptor.user_id
          ]);

          return addCorsHeaders(new Response(JSON.stringify(result[0]), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        if (request.method === 'DELETE' && path.startsWith('/api/interceptors/')) {
          // If global access is enabled, allow deletion without auth
          if (GLOBAL_ACCESS === 1) {
            console.log('Global access enabled, bypassing auth for deletion');
            const id = path.split('/')[3];
            await dbDelete(id);
            return addCorsHeaders(new Response(null, { status: 204 }));
          }

          // Otherwise, proceed with normal auth flow
          const authHeader = request.headers.get('Authorization');
          if (!authHeader) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          const sessionId = authHeader.replace('Bearer ', '');
          
          // Verify session and get user ID
          const sessionResponse = await fetch('https://googleauth.yadev64.workers.dev/auth/session', {
            headers: {
              Authorization: `Bearer ${sessionId}`,
            },
          });
          
          if (!sessionResponse.ok) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          const sessionData = await sessionResponse.json();
          if (!sessionData.authenticated) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          // Delete interceptor
          const id = path.split('/')[3];
          
          // Verify the interceptor belongs to the user
          const interceptors = await dbSelect(`id=eq.${id}&user_id=eq.${sessionData.user.id}`);
          if (interceptors.length === 0) {
            return addCorsHeaders(new Response('Not found', { status: 404 }));
          }
          
          await dbDelete(id);
          return addCorsHeaders(new Response(null, { status: 204 }));
        }
      } catch (error) {
        return addCorsHeaders(new Response('Error: ' + error.message, { status: 500 }));
      }
    }

    // Handle proxy requests
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const uniqueCode = pathParts[0];
      try {
        const interceptors = await dbSelect(`id=eq.${uniqueCode}&is_active=eq.true`);
        const interceptor = interceptors[0];

        if (interceptor) {
          try {
            // Reconstruct the path without the unique code
            const targetPath = '/' + pathParts.slice(1).join('/') + url.search;
            const originalUrl = new URL(targetPath, interceptor.base_url);
            
            const startTime = Date.now();
            const response = await fetch(originalUrl.toString(), {
              method: request.method,
              headers: request.headers,
              body: request.body,
            });
            const duration = Date.now() - startTime;

            // Clone the response for logging
            const responseClone = response.clone();
            const responseBody = await responseClone.text();

            // Create log object
            const log = {
              id: crypto.randomUUID(),
              interceptor_id: interceptor.id,
              original_url: originalUrl.toString(),
              proxy_url: url.toString(),
              method: request.method,
              headers: JSON.stringify(Object.fromEntries(request.headers)),
              body: request.body ? await request.text() : null,
              response_status: response.status,
              response_headers: JSON.stringify(Object.fromEntries(response.headers)),
              response_body: responseBody,
              timestamp: new Date().toISOString(),
              duration: duration
            };

            // Broadcast log to all connected clients using SSE
            if (env.EVENT_CONTROLLERS && env.EVENT_CONTROLLERS.size > 0) {
              const encoder = new TextEncoder();
              const message = `data: ${JSON.stringify({
                type: 'log',
                data: log
              })}\n\n`;
              
              const deadControllers = new Set();
              for (const controller of env.EVENT_CONTROLLERS) {
                try {
                  controller.enqueue(encoder.encode(message));
                } catch (error) {
                  console.error('Error sending SSE message:', error);
                  deadControllers.add(controller);
                }
              }
              
              // Clean up dead controllers
              for (const controller of deadControllers) {
                env.EVENT_CONTROLLERS.delete(controller);
              }
            }

            // Return the original response
            return addCorsHeaders(new Response(responseBody, {
              status: response.status,
              headers: response.headers,
            }));
          } catch (error) {
            return addCorsHeaders(new Response('Error forwarding request: ' + error.message, { status: 500 }));
          }
        }
      } catch (error) {
        return addCorsHeaders(new Response('Error: ' + error.message, { status: 500 }));
      }
    }

    return addCorsHeaders(new Response('Not found', { status: 404 }));
  },
}; 