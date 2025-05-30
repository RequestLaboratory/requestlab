interface Env {
  INTERCEPTORS: KVNamespace;
  REQUESTS: KVNamespace;
  WEBSOCKET_MANAGER: DurableObjectNamespace;
}

interface Interceptor {
  id: string;
  name: string;
  originalBaseUrl: string;
  proxyBaseUrl: string;
  pathMappings?: Record<string, string>;
  createdAt: string;
  isActive: boolean;
}

interface RequestLog {
  id: string;
  interceptorId: string;
  originalUrl: string;
  proxyUrl: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
  timestamp: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const proxyBaseUrl = url.hostname;

    // Get interceptor from KV
    const interceptorJson = await env.INTERCEPTORS.get(proxyBaseUrl);
    if (!interceptorJson) {
      return new Response('No interceptor found', { status: 404 });
    }

    const interceptor: Interceptor = JSON.parse(interceptorJson);
    if (!interceptor.isActive) {
      return new Response('Interceptor is inactive', { status: 403 });
    }

    // Reconstruct original URL
    const originalUrl = new URL(request.url);
    originalUrl.hostname = interceptor.originalBaseUrl;

    // Apply path mappings if they exist
    if (interceptor.pathMappings) {
      const path = originalUrl.pathname;
      for (const [proxyPath, originalPath] of Object.entries(interceptor.pathMappings)) {
        if (path.startsWith(proxyPath)) {
          originalUrl.pathname = path.replace(proxyPath, originalPath);
          break;
        }
      }
    }

    try {
      // Clone the request for logging
      const requestClone = request.clone();
      const requestBody = await requestClone.text();

      // Forward request
      const response = await fetch(originalUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: requestBody || undefined,
      });

      // Clone the response for logging
      const responseClone = response.clone();
      const responseBody = await responseClone.text();

      // Create request log
      const requestLog: RequestLog = {
        id: crypto.randomUUID(),
        interceptorId: interceptor.id,
        originalUrl: originalUrl.toString(),
        proxyUrl: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers),
        body: requestBody,
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: responseBody,
        },
        timestamp: new Date().toISOString(),
      };

      // Store request log in KV
      ctx.waitUntil(
        env.REQUESTS.put(
          `${interceptor.id}:${requestLog.id}`,
          JSON.stringify(requestLog),
          { expirationTtl: 86400 } // 24 hours
        )
      );

      // Stream to web UI via WebSocket
      ctx.waitUntil(
        streamToWebUI(env, interceptor.id, {
          type: 'request',
          data: requestLog,
        })
      );

      // Return response to client
      return new Response(responseBody, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

async function streamToWebUI(env: Env, interceptorId: string, data: any): Promise<void> {
  try {
    const id = env.WEBSOCKET_MANAGER.idFromName(interceptorId);
    const wsManager = env.WEBSOCKET_MANAGER.get(id);
    await wsManager.fetch('http://internal/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error streaming to WebSocket:', error);
  }
}

// WebSocket Manager Durable Object
export class WebSocketManager {
  private connections: Map<string, WebSocket>;
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.connections = new Map();
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
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

  async handleWebSocket(ws: WebSocket): Promise<void> {
    ws.accept();
    
    ws.addEventListener('message', async (msg) => {
      try {
        const data = JSON.parse(msg.data as string);
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

  async broadcast(data: any): Promise<void> {
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