// In-memory storage
const interceptors = new Map();
const requestLogs = new Map();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

// Generate a short unique code
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 8);
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // API endpoints
    if (path.startsWith('/api/interceptors')) {
      if (request.method === 'GET' && path === '/api/interceptors') {
        // List all interceptors
        const interceptorsList = Array.from(interceptors.values());
        return addCorsHeaders(new Response(JSON.stringify(interceptorsList), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      if (request.method === 'POST' && path === '/api/interceptors') {
        // Create new interceptor
        const data = await request.json();
        const uniqueCode = generateUniqueCode();
        const interceptor = {
          id: uniqueCode,
          name: data.name,
          baseUrl: data.baseUrl,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        interceptors.set(uniqueCode, interceptor);
        return addCorsHeaders(new Response(JSON.stringify(interceptor), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      if (path.startsWith('/api/interceptors/') && path.endsWith('/logs')) {
        // Get logs for specific interceptor
        const id = path.split('/')[3];
        const logs = requestLogs.get(id) || [];
        return addCorsHeaders(new Response(JSON.stringify(logs), {
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      if (request.method === 'DELETE' && path.startsWith('/api/interceptors/')) {
        // Delete interceptor
        const id = path.split('/')[3];
        interceptors.delete(id);
        requestLogs.delete(id);
        return addCorsHeaders(new Response(null, { status: 204 }));
      }
    }

    // Handle proxy requests
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const uniqueCode = pathParts[0];
      const interceptor = interceptors.get(uniqueCode);

      if (interceptor && interceptor.isActive) {
        try {
          // Reconstruct the path without the unique code
          const targetPath = '/' + pathParts.slice(1).join('/') + url.search;
          const originalUrl = new URL(targetPath, interceptor.baseUrl);
          
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

          // Log the request
          const log = {
            id: crypto.randomUUID(),
            interceptorId: interceptor.id,
            originalUrl: originalUrl.toString(),
            proxyUrl: url.toString(),
            method: request.method,
            headers: Object.fromEntries(request.headers),
            body: request.body ? await request.text() : null,
            response: {
              status: response.status,
              headers: Object.fromEntries(response.headers),
              body: responseBody,
            },
            timestamp: new Date().toISOString(),
            duration: duration
          };

          // Store the log
          const logs = requestLogs.get(interceptor.id) || [];
          logs.unshift(log);
          if (logs.length > 100) logs.pop(); // Keep only last 100 logs
          requestLogs.set(interceptor.id, logs);

          // Return the original response
          return addCorsHeaders(new Response(responseBody, {
            status: response.status,
            headers: response.headers,
          }));
        } catch (error) {
          return addCorsHeaders(new Response('Error forwarding request: ' + error.message, { status: 500 }));
        }
      }
    }

    return addCorsHeaders(new Response('Not found', { status: 404 }));
  },
};

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
      const { 0: client, 1: server } = new WebSocketPair();
      await this.handleWebSocket(server);
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
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