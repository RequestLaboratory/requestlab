// Configuration - Environment-based with fallbacks
const SUPABASE_URL = env?.SUPABASE_URL || 'https://opgwkalkqxudvkqxvfsc.supabase.co';
const SUPABASE_ANON_KEY = env?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3drYWxrcXh1ZHZrcXh2ZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI3MjYsImV4cCI6MjA2NTE1ODcyNn0.JQEhK0Iub0e9ZAhO6H0BgzQXWa4S4MUml0fXkwyYN3E';

// Constants for limits and validation
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RESPONSE_SIZE = 50 * 1024 * 1024; // 50MB
const RATE_LIMIT_REQUESTS = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Allowed content types for logging
const LOGGABLE_CONTENT_TYPES = [
  'application/json',
  'application/xml',
  'text/',
  'application/x-www-form-urlencoded'
];

// Sensitive headers that should not be logged
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'cf-connecting-ip'
];

// Allowed headers for forwarding
const ALLOWED_FORWARD_HEADERS = [
  'content-type',
  'authorization',
  'user-agent',
  'accept',
  'accept-language',
  'cache-control',
  'x-requested-with',
  'x-api-key',
  'x-auth-token'
];

// Debug flag for global access (1 = bypass auth, 0 = require auth)
const GLOBAL_ACCESS = env?.GLOBAL_ACCESS || 0;

// Mode flag for SSE vs API (1 = API mode, 0 = SSE mode)
const isAPI = env?.API_MODE || 1;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Upgrade, Connection, X-Requested-With, Accept, Accept-Language, Cache-Control, X-API-Key, X-Auth-Token, X-CSRF-Token, X-Forwarded-For, X-Forwarded-Proto, X-Real-IP, User-Agent, Origin, Referer',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Helper to handle CORS preflight
function handleCors(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Upgrade, Connection, X-Requested-With, Accept, Accept-Language, Cache-Control, X-API-Key, X-Auth-Token, X-CSRF-Token, X-Forwarded-For, X-Forwarded-Proto, X-Real-IP, User-Agent, Origin, Referer',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, CONNECT',
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

// Helper to create structured error responses
function createErrorResponse(message, status = 500, error = null) {
  const errorData = {
    error: status >= 500 ? 'Internal Server Error' : 'Client Error',
    message: message,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  };
  
  if (error && status >= 500) {
    errorData.details = error.message;
  }
  
  return addCorsHeaders(new Response(JSON.stringify(errorData), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  }));
}

// Generate a short unique code
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Session verification functions
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

async function verifySession(sessionId) {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return { authenticated: false };
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await deleteSession(sessionId);
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        picture: session.picture
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { authenticated: false };
  }
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
  try {
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
  } catch (error) {
    console.error('Database select error:', error);
    throw error;
  }
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

// Database helper for storing logs
async function storeLog(log) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/logs`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(log)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to store log: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Database helper for fetching logs
async function getLogs(interceptorId, limit = 100, offset = 0) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/logs?interceptor_id=eq.${interceptorId}&order=timestamp.desc&limit=${limit}&offset=${offset}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch logs: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// WebSocket Manager for handling real-time connections
export class WebSocketManager {
  constructor(state) {
    this.connections = new Map();
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Handle broadcast messages to all connected clients
    if (url.pathname === '/broadcast') {
      const data = await request.json();
      await this.broadcast(data);
      return new Response('OK');
    }

    // Handle new WebSocket connections
    if (url.pathname === '/connect') {
      const { webSocket } = await request.json();
      await this.handleWebSocket(webSocket);
      return new Response('OK');
    }

    return new Response('Not found', { status: 404 });
  }

  // Handle individual WebSocket connections
  async handleWebSocket(ws) {
    ws.accept();
    
    // Handle incoming messages
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

    // Clean up on connection close
    ws.addEventListener('close', () => {
      this.connections.delete(ws.toString());
    });

    // Handle WebSocket errors
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      this.connections.delete(ws.toString());
    });

    // Store the connection
    this.connections.set(ws.toString(), ws);
  }

  // Broadcast message to all connected clients
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

// Utility functions for validation and security
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function isAllowedContentType(contentType) {
  if (!contentType) return true; // Allow requests without content-type
  return LOGGABLE_CONTENT_TYPES.some(type => contentType.includes(type)) ||
         contentType.includes('multipart/form-data') ||
         contentType.includes('application/octet-stream');
}

function shouldLogBody(contentType) {
  if (!contentType) return false;
  return LOGGABLE_CONTENT_TYPES.some(type => contentType.includes(type));
}

function shouldLogResponse(contentType) {
  if (!contentType) return false;
  return LOGGABLE_CONTENT_TYPES.some(type => contentType.includes(type)) ||
         contentType.includes('application/javascript');
}

function sanitizeHeaders(headers) {
  const sanitized = {};
  for (const [key, value] of headers) {
    if (!SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function createForwardHeaders(requestHeaders) {
  const forwardHeaders = new Headers();
  for (const [key, value] of requestHeaders) {
    if (ALLOWED_FORWARD_HEADERS.includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  }
  return forwardHeaders;
}

function createStructuredLog(data) {
  return {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    ...data
  };
}

// Rate limiting implementation
async function checkRateLimit(env, key) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Initialize rate limit storage if not exists
  if (!env.RATE_LIMITS) {
    env.RATE_LIMITS = new Map();
  }
  
  // Clean up old entries
  for (const [k, v] of env.RATE_LIMITS) {
    if (v.timestamp < windowStart) {
      env.RATE_LIMITS.delete(k);
    }
  }
  
  const current = env.RATE_LIMITS.get(key);
  if (!current) {
    env.RATE_LIMITS.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (current.timestamp < windowStart) {
    env.RATE_LIMITS.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (current.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  current.count++;
  return true;
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    // Move config here:
    const SUPABASE_URL = env && env.SUPABASE_URL ? env.SUPABASE_URL : 'https://opgwkalkqxudvkqxvfsc.supabase.co';
    const SUPABASE_ANON_KEY = env && env.SUPABASE_ANON_KEY ? env.SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3drYWxrcXh1ZHZrcXh2ZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI3MjYsImV4cCI6MjA2NTE1ODcyNn0.JQEhK0Iub0e9ZAhO6H0BgzQXWa4S4MUml0fXkwyYN3E';
    const GLOBAL_ACCESS = env && env.GLOBAL_ACCESS ? env.GLOBAL_ACCESS : 0;
    const isAPI = env && env.API_MODE ? env.API_MODE : 1;

    // Initialize metrics if not exists
    env.METRICS = env.METRICS || {
      requestCount: 0,
      totalDuration: 0,
      errorCount: 0
    };
    
    const startTime = Date.now();
    
    try {
    // Handle CORS preflight requests
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;
      
      // Validate request size
      const contentLength = parseInt(request.headers.get('content-length') || '0');
      if (contentLength > MAX_REQUEST_SIZE) {
        return createErrorResponse('Request too large', 413);
      }
      
      // Validate content type
      const contentType = request.headers.get('content-type');
      if (contentType && !isAllowedContentType(contentType)) {
        return createErrorResponse('Unsupported content type', 415);
      }
      
      // Rate limiting
      const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
      const rateLimitKey = `global:${clientIP}`;
      if (!(await checkRateLimit(env, rateLimitKey))) {
        return createErrorResponse('Rate limit exceeded', 429);
      }

    // Handle status endpoint
    if (path === '/status') {
      return addCorsHeaders(new Response(JSON.stringify({
        mode: isAPI === 1 ? 'api' : 'sse',
        globalAccess: GLOBAL_ACCESS === 1,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    // Handle Server-Sent Events (SSE) connections
    if (path === '/events') {
      // Only allow SSE connections when not in API mode
      if (isAPI === 1) {
        return addCorsHeaders(new Response('SSE not available in API mode', { status: 400 }));
      }

      // Initialize controllers set if it doesn't exist
      if (!env.EVENT_CONTROLLERS) {
        env.EVENT_CONTROLLERS = new Set();
      }

      // Clean up any dead controllers before adding new ones
      const now = Date.now();
      for (const controllerInfo of env.EVENT_CONTROLLERS) {
        if (!controllerInfo.isAlive || now - controllerInfo.lastActivity > 60000) { // 1 minute timeout
          env.EVENT_CONTROLLERS.delete(controllerInfo);
        }
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send initial connection message with a retry field
          controller.enqueue(encoder.encode('retry: 1000\n'));
          controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));
          
          // Store the controller with metadata for connection tracking
          const controllerInfo = {
            controller,
            lastActivity: Date.now(),
            isAlive: true,
            id: crypto.randomUUID() // Add unique ID for better tracking
          };
          env.EVENT_CONTROLLERS.add(controllerInfo);
          
          // Set up heartbeat to keep connection alive and detect dead connections
          const heartbeatInterval = setInterval(() => {
            try {
              if (!controllerInfo.isAlive) {
                clearInterval(heartbeatInterval);
                env.EVENT_CONTROLLERS.delete(controllerInfo);
                return;
              }

              // Check if controller is too old (more than 1 minute without activity)
              if (Date.now() - controllerInfo.lastActivity > 60000) {
                controllerInfo.isAlive = false;
                clearInterval(heartbeatInterval);
                env.EVENT_CONTROLLERS.delete(controllerInfo);
                return;
              }

              controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'));
              controllerInfo.lastActivity = Date.now();
            } catch (error) {
              console.error('Error sending heartbeat:', error);
              clearInterval(heartbeatInterval);
              controllerInfo.isAlive = false;
              env.EVENT_CONTROLLERS.delete(controllerInfo);
            }
          }, 15000); // Send heartbeat every 15 seconds
          
          // Clean up on connection close
          request.signal.addEventListener('abort', () => {
            clearInterval(heartbeatInterval);
            controllerInfo.isAlive = false;
            env.EVENT_CONTROLLERS.delete(controllerInfo);
          });
        },
        cancel() {
          // Clean up when the stream is cancelled
          const controllerInfo = Array.from(env.EVENT_CONTROLLERS)
            .find(info => info.controller === controller);
          if (controllerInfo) {
            controllerInfo.isAlive = false;
            env.EVENT_CONTROLLERS.delete(controllerInfo);
          }
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

    // Handle API endpoints
    if (path.startsWith('/api/interceptors')) {
      try {
        // Get all interceptors
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
          
          // Verify session directly
          console.log('Verifying session...');
          const sessionData = await verifySession(sessionId);
          console.log('Session verification result:', sessionData);
          
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

        // Create new interceptor
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
          
          // Verify session directly
          const sessionData = await verifySession(sessionId);
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

        // Delete interceptor
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
          
          // Verify session directly
          const sessionData = await verifySession(sessionId);
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

        // Get logs for an interceptor
        if (request.method === 'GET' && path.startsWith('/api/interceptors/') && path.endsWith('/logs')) {
          const interceptorId = path.split('/')[3];
          const searchParams = new URLSearchParams(url.search);
          const limit = parseInt(searchParams.get('limit') || '100');
          const offset = parseInt(searchParams.get('offset') || '0');

          // If global access is enabled, return logs without auth
          if (GLOBAL_ACCESS === 1) {
            console.log('Global access enabled, bypassing auth for logs');
            const logs = await getLogs(interceptorId, limit, offset);
            return addCorsHeaders(new Response(JSON.stringify(logs), {
              headers: { 'Content-Type': 'application/json' },
            }));
          }

          // Otherwise, proceed with normal auth flow
          const authHeader = request.headers.get('Authorization');
          if (!authHeader) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          const sessionId = authHeader.replace('Bearer ', '');
          
          // Verify session directly
          const sessionData = await verifySession(sessionId);
          if (!sessionData.authenticated) {
            return addCorsHeaders(new Response('Unauthorized', { status: 401 }));
          }
          
          // Verify the interceptor belongs to the user
          const interceptors = await dbSelect(`id=eq.${interceptorId}&user_id=eq.${sessionData.user.id}`);
          if (interceptors.length === 0) {
            return addCorsHeaders(new Response('Not found', { status: 404 }));
          }

          const logs = await getLogs(interceptorId, limit, offset);
          return addCorsHeaders(new Response(JSON.stringify(logs), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }
      } catch (error) {
        return createErrorResponse('Database error', 500, error);
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
            console.log(`Processing ${request.method} request to ${interceptor.base_url}`);
            
            // Reconstruct the path without the unique code
            const targetPath = '/' + pathParts.slice(1).join('/') + url.search;
            const originalUrl = new URL(targetPath, interceptor.base_url);
            
            console.log(`Target URL: ${originalUrl.toString()}`);
            console.log(`Content-Type: ${request.headers.get('content-type')}`);
            console.log(`Has body: ${request.body ? 'yes' : 'no'}`);
            
            // Validate interceptor configuration
            if (!isValidUrl(interceptor.base_url)) {
              return createErrorResponse('Invalid interceptor configuration', 400);
            }
            
            // Handle request body properly - only log if content type is loggable
            let requestBodyText = null;
            
            if (request.body && shouldLogBody(request.headers.get('content-type'))) {
              const contentType = request.headers.get('content-type') || '';
              
              if (contentType.includes('multipart/form-data')) {
                requestBodyText = '[Multipart form data]';
              } else {
                // Clone the body for logging
                const bodyClone = request.body.clone();
                requestBodyText = await bodyClone.text();
                console.log(`Request body: ${requestBodyText.substring(0, 100)}...`);
              }
            }
            
            // Prepare headers for forwarding using optimized function
            const forwardHeaders = createForwardHeaders(request.headers);
            
            // Set proper host header for target
            forwardHeaders.set('host', new URL(interceptor.base_url).host);
            
            // Add secure proxy identification headers
            const clientIP = request.headers.get('cf-connecting-ip');
            if (clientIP && isValidIP(clientIP)) {
              forwardHeaders.set('x-forwarded-for', clientIP);
            }
            forwardHeaders.set('x-forwarded-proto', 'https');
            forwardHeaders.set('x-forwarded-host', request.headers.get('host') || 'unknown');
            
            const startTime = Date.now();
            console.log(`Making fetch request to: ${originalUrl.toString()}`);
            console.log(`Method: ${request.method}`);
            console.log(`Headers:`, Object.fromEntries(forwardHeaders));
            console.log(`Body available: ${request.body ? 'yes' : 'no'}`);
            
            let response;
            try {
              response = await fetch(originalUrl.toString(), {
              method: request.method,
                headers: forwardHeaders,
              body: request.body,
            });
            } catch (fetchError) {
              console.error('Fetch error:', fetchError);
              return createErrorResponse('Error forwarding request', 500, fetchError);
            }
            
            console.log(`Response status: ${response.status}`);
            console.log(`Response headers:`, Object.fromEntries(response.headers));
            const duration = Date.now() - startTime;

            // Handle response logging - only clone if content type is loggable
            let responseBody = null;
            const responseContentType = response.headers.get('content-type') || '';
            
            if (shouldLogResponse(responseContentType)) {
            const responseClone = response.clone();
              responseBody = await responseClone.text();
            } else {
              responseBody = '[Binary or non-loggable content]';
            }

            // Create log object with sanitized headers
            const log = {
              id: crypto.randomUUID(),
              interceptor_id: interceptor.id,
              original_url: originalUrl.toString(),
              proxy_url: url.toString(),
              method: request.method,
              headers: JSON.stringify(sanitizeHeaders(request.headers)),
              body: requestBodyText,
              response_status: response.status,
              response_headers: JSON.stringify(sanitizeHeaders(response.headers)),
              response_body: responseBody,
              timestamp: new Date().toISOString(),
              duration: duration
            };

            // Store log in Supabase (always store regardless of mode)
            await storeLog(log);

            // Handle real-time updates based on mode
            if (isAPI === 0) {
              // SSE Mode: Broadcast log to all connected clients using SSE
              if (env.EVENT_CONTROLLERS && env.EVENT_CONTROLLERS.size > 0) {
                const encoder = new TextEncoder();
                const message = `data: ${JSON.stringify({
                  type: 'log',
                  data: log
                })}\n\n`;
                
                const now = Date.now();
                const deadControllers = new Set();
                
                for (const controllerInfo of env.EVENT_CONTROLLERS) {
                  try {
                    if (!controllerInfo.isAlive || now - controllerInfo.lastActivity > 60000) {
                      deadControllers.add(controllerInfo);
                      continue;
                    }

                    controllerInfo.controller.enqueue(encoder.encode(message));
                    controllerInfo.lastActivity = now;
                  } catch (error) {
                    console.error('Error sending SSE message:', error);
                    deadControllers.add(controllerInfo);
                  }
                }
                
                // Clean up dead controllers
                for (const controllerInfo of deadControllers) {
                  env.EVENT_CONTROLLERS.delete(controllerInfo);
                }
              }
            }
            // API Mode: No real-time broadcasting, logs are fetched via API polling

            // Return the original response
            return addCorsHeaders(new Response(response.body, {
              status: response.status,
              headers: response.headers,
            }));
          } catch (error) {
            return createErrorResponse('Error forwarding request', 500, error);
          }
        }
      } catch (error) {
        return createErrorResponse('Database error', 500, error);
      }
    }

    return addCorsHeaders(new Response('Not found', { status: 404 }));
    
    } catch (error) {
      // Update error metrics
      env.METRICS.errorCount++;
      
      // Log structured error
      const errorLog = createStructuredLog({
        error: true,
        message: error.message,
        stack: error.stack,
        method: request.method,
        url: request.url
      });
      console.error(JSON.stringify(errorLog));
      
      return createErrorResponse('Internal server error', 500, error);
    } finally {
      // Update metrics
      const duration = Date.now() - startTime;
      env.METRICS.requestCount++;
      env.METRICS.totalDuration += duration;
      
      // Log request metrics
      const metricsLog = createStructuredLog({
        method: request.method,
        url: request.url,
        duration: duration,
        status: 'completed'
      });
      console.log(JSON.stringify(metricsLog));
    }
  },
}; 