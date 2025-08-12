import express from 'express';
import httpProxy from 'http-proxy';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet';
import morgan from 'morgan';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://opgwkalkqxudvkqxvfsc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3drYWxrcXh1ZHZrcXh2ZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI3MjYsImV4cCI6MjA2NTE1ODcyNn0.JQEhK0Iub0e9ZAhO6H0BgzQXWa4S4MUml0fXkwyYN3E';
const supabase = createClient(supabaseUrl, supabaseKey);

// Constants
const LOGGABLE_CONTENT_TYPES = [
  'application/json',
  'application/xml',
  'text/',
  'application/x-www-form-urlencoded'
];
const SENSITIVE_HEADERS = [
  'authorization', 'cookie', 'x-api-key', 'x-auth-token', 'cf-connecting-ip'
];
const ALLOWED_FORWARD_HEADERS = [
  'content-type', 'authorization', 'user-agent', 'accept', 'accept-language',
  'cache-control', 'x-requested-with', 'x-api-key', 'x-auth-token'
];

const GLOBAL_ACCESS = 1;
const isAPI = process.env.API_MODE === '0' ? 0 : 1;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://localhost:4173',
    'https://jsoncompare.vercel.app',
    'https://jsoncompare-git-main-yadev64.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ngrok-skip-browser-warning',
    'apikey',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
    'Cache-Control',
    'X-API-Key',
    'X-Auth-Token'
  ],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

function sanitizeHeaders(headers) {
  const sanitized = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!SENSITIVE_HEADERS.includes(key.toLowerCase())) sanitized[key] = value;
  }
  return sanitized;
}

function createForwardHeaders(requestHeaders) {
  // Forward all headers without restriction
  return { ...requestHeaders };
}

function shouldLogBody(contentType) {
  // Log all content types
  return true;
}

function createErrorResponse(message, status = 500, error = null) {
  const errorData = {
    error: status >= 500 ? 'Internal Server Error' : 'Client Error',
    message,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  };
  if (error && status >= 500) errorData.details = error.message;
  return errorData;
}

function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Express middleware
// app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Proxy
const proxy = httpProxy.createProxyServer();
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    mode: isAPI === 1 ? 'api' : 'sse',
    globalAccess: GLOBAL_ACCESS === 1,
    timestamp: new Date().toISOString()
  });
});

// SSE endpoint (stub)
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write('retry: 1000\n');
  res.write('data: {"type":"connected"}\n\n');
  const heartbeat = setInterval(() => res.write('data: {"type":"heartbeat"}\n\n'), 15000);
  req.on('close', () => clearInterval(heartbeat));
});

// API endpoints with CORS headers
app.get('/api/interceptors', async (req, res) => {
  console.log('GET /api/interceptors called');
  try {
    const { data, error } = await supabase.from('interceptors').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json(createErrorResponse('Database error', 500, error));
  }
});

app.post('/api/interceptors', async (req, res) => {
  try {
    const uniqueCode = generateUniqueCode();
    const interceptor = {
      id: uniqueCode,
      name: req.body.name,
      base_url: req.body.base_url || req.body.baseUrl, // Handle both formats
      created_at: new Date().toISOString(),
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      user_id: 'system'
    };
    const { data, error } = await supabase.from('interceptors').insert(interceptor).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json(createErrorResponse('Database error', 500, error));
  }
});

app.delete('/api/interceptors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('interceptors').delete().eq('id', id);
    if (error) throw error;
    res.status(204).end();
  } catch (error) {
    res.status(500).json(createErrorResponse('Database error', 500, error));
  }
});

app.get('/api/interceptors/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const { data, error } = await supabase.from('logs').select('*').eq('interceptor_id', id).order('timestamp', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json(createErrorResponse('Database error', 500, error));
  }
});

// Main proxy route
app.all('/:uniqueCode/*', async (req, res) => {
  const { uniqueCode } = req.params;
  const startTime = Date.now();
  try {
    // Get interceptor
    const { data: interceptor, error } = await supabase.from('interceptors').select('*').eq('id', uniqueCode).eq('is_active', true).single();
    if (error || !interceptor) return res.status(404).json(createErrorResponse('Interceptor not found', 404));
    
    // Build target URL
    const targetPath = req.originalUrl.replace(`/${uniqueCode}`, '');
    const targetUrl = interceptor.base_url.replace(/\/$/, '') + targetPath;
    
    // Prepare headers - forward all headers
    const forwardHeaders = { ...req.headers };
    forwardHeaders.host = new URL(interceptor.base_url).host;
    forwardHeaders['x-forwarded-for'] = req.ip || req.connection.remoteAddress;
    forwardHeaders['x-forwarded-proto'] = req.protocol;
    forwardHeaders['x-forwarded-host'] = req.get('host') || 'unknown';
    
    // Capture response body for logging
    let responseBody = Buffer.alloc(0);
    const originalWrite = res.write;
    const originalEnd = res.end;
    res.write = function(chunk, ...args) {
      if (chunk) responseBody = Buffer.concat([responseBody, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
      return originalWrite.apply(res, [chunk, ...args]);
    };
    res.end = function(chunk, ...args) {
      if (chunk) responseBody = Buffer.concat([responseBody, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
      const duration = Date.now() - startTime;
      const log = {
        id: crypto.randomUUID(),
        interceptor_id: interceptor.id,
        original_url: targetUrl,
        proxy_url: req.originalUrl,
        method: req.method,
        headers: JSON.stringify(sanitizeHeaders(req.headers)),
        body: JSON.stringify(req.body),
        response_status: res.statusCode,
        response_headers: JSON.stringify(sanitizeHeaders(res.getHeaders())),
        response_body: responseBody.toString('utf8'),
        timestamp: new Date().toISOString(),
        duration
      };
      storeLog(log).catch(e => console.error('Error storing log:', e));
      return originalEnd.apply(res, [chunk, ...args]);
    };
    
    // Proxy
    proxy.web(req, res, {
      target: interceptor.base_url,
      changeOrigin: true,
      selfHandleResponse: false,
      headers: forwardHeaders
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('Proxy error', 500, error));
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json(createErrorResponse('Internal server error', 500, err));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(createErrorResponse('Not found', 404));
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${isAPI === 1 ? 'API' : 'SSE'}`);
  console.log(`Global Access: ${GLOBAL_ACCESS === 1 ? 'Enabled' : 'Disabled'}`);
  console.log('CORS enabled for localhost origins');
});

// Store log helper
async function storeLog(log) {
  try {
    await supabase.from('logs').insert(log);
  } catch (e) {
    console.error('Failed to store log:', e);
  }
}
