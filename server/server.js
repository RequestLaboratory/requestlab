import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://opgwkalkqxudvkqxvfsc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3drYWxrcXh1ZHZrcXh2ZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI3MjYsImV4cCI6MjA2NTE1ODcyNn0.JQEhK0Iub0e9ZAhO6H0BgzQXWa4S4MUml0fXkwyYN3E';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sanitize headers
function sanitizeHeaders(headers) {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'cf-connecting-ip'];
  const sanitized = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Helper function to store log
async function storeLog(log) {
  try {
    await supabase.from('logs').insert(log);
  } catch (error) {
    console.error('Failed to store log:', error);
  }
}

// Helper function to capture request body
function captureRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body) {
      resolve(JSON.stringify(req.body));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

// Helper function to capture response body
function captureResponseBody(res) {
  return new Promise((resolve) => {
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    const originalWrite = res.write;

    let responseBody = '';
    let responseSent = false;

    res.send = function(data) {
      if (!responseSent) {
        responseBody = typeof data === 'string' ? data : JSON.stringify(data);
        responseSent = true;
      }
      return originalSend.apply(res, arguments);
    };

    res.json = function(data) {
      if (!responseSent) {
        responseBody = JSON.stringify(data);
        responseSent = true;
      }
      return originalJson.apply(res, arguments);
    };

    res.write = function(chunk, ...args) {
      if (!responseSent && chunk) {
        responseBody += chunk.toString();
      }
      return originalWrite.apply(res, [chunk, ...args]);
    };

    res.end = function(chunk, ...args) {
      if (!responseSent && chunk) {
        responseBody += chunk.toString();
        responseSent = true;
      }
      resolve(responseBody);
      return originalEnd.apply(res, [chunk, ...args]);
    };
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ngrok-skip-browser-warning',
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

// Body parsing middleware - handle all content types
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));
app.use(bodyParser.text({ type: 'text/plain', limit: '50mb' }));

// API Routes - must come before proxy middleware
app.get('/status', (req, res) => {
  res.json({
    mode: 'api',
    globalAccess: true,
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get interceptors
app.get('/api/interceptors', async (req, res) => {
  console.log('GET /api/interceptors called');
  try {
    const { data, error } = await supabase.from('interceptors').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Create interceptor
app.post('/api/interceptors', async (req, res) => {
  try {
    const uniqueCode = Math.random().toString(36).substring(2, 8);
    const interceptor = {
      id: uniqueCode,
      name: req.body.name,
      base_url: req.body.base_url || req.body.baseUrl,
      created_at: new Date().toISOString(),
      is_active: true,
      user_id: 'system'
    };
    const { data, error } = await supabase.from('interceptors').insert(interceptor).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Delete interceptor
app.delete('/api/interceptors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('interceptors').delete().eq('id', id);
    if (error) throw error;
    res.status(204).end();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Get logs
app.get('/api/interceptors/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const { data, error } = await supabase.from('logs').select('*').eq('interceptor_id', id).order('timestamp', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Dynamic proxy middleware - handle all other requests
app.use(async (req, res, next) => {
  // Extract interceptor ID from path
  const pathParts = req.path.split('/').filter(Boolean);
  if (pathParts.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const interceptorId = pathParts[0];
  console.log(`Proxy request: ${req.method} ${req.path} -> interceptor: ${interceptorId}`);
  
  try {
    // Get interceptor from database
    const { data: interceptor, error } = await supabase
      .from('interceptors')
      .select('*')
      .eq('id', interceptorId)
      .eq('is_active', true)
      .single();
    
    if (error || !interceptor) {
      console.log(`Interceptor not found: ${interceptorId}`);
      return res.status(404).json({ error: 'Interceptor not found' });
    }
    
    // Build target path
    const targetPath = req.path.replace(`/${interceptorId}`, '') || '/';
    const targetUrl = interceptor.base_url.replace(/\/$/, '') + targetPath;
    console.log(`Proxying to: ${targetUrl}`);
    
    // Capture request details for logging
    const startTime = Date.now();
    const requestHeaders = JSON.stringify(sanitizeHeaders(req.headers));
    
    // Capture request body
    const requestBody = await captureRequestBody(req);
    
    // Create proxy middleware for this specific request
    const proxyMiddleware = createProxyMiddleware({
      target: interceptor.base_url,
      changeOrigin: true,
      ws: false, // Disable WebSocket proxying
      secure: true,
      timeout: 30000,
      proxyTimeout: 30000,
      onProxyReq: (proxyReq, req, res) => {
        // Remove problematic headers
        proxyReq.removeHeader('host');
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-forwarded-proto');
        proxyReq.removeHeader('x-forwarded-host');
        
        // Set target host
        const targetHost = new URL(interceptor.base_url).host;
        proxyReq.setHeader('host', targetHost);
        
        // Log proxy request
        console.log(`Proxying ${req.method} to ${targetUrl}`);
      },
      onProxyRes: async (proxyRes, req, res) => {
        // Capture response details
        const duration = Date.now() - startTime;
        const responseStatus = proxyRes.statusCode;
        const responseHeaders = JSON.stringify(sanitizeHeaders(proxyRes.headers));
        
        // Capture response body
        const responseBody = await captureResponseBody(res);
        
        // Store log
        const log = {
          id: crypto.randomUUID(),
          interceptor_id: interceptor.id,
          original_url: targetUrl,
          proxy_url: req.originalUrl,
          method: req.method,
          headers: requestHeaders,
          body: requestBody,
          response_status: responseStatus,
          response_headers: responseHeaders,
          response_body: responseBody,
          timestamp: new Date().toISOString(),
          duration: duration
        };
        
        await storeLog(log);
        console.log(`Log stored for ${req.method} ${req.path} (${responseStatus})`);
      },
      onError: async (err, req, res) => {
        console.error('Proxy error:', err);
        
        // Log the error
        const duration = Date.now() - startTime;
        const log = {
          id: crypto.randomUUID(),
          interceptor_id: interceptor.id,
          original_url: targetUrl,
          proxy_url: req.originalUrl,
          method: req.method,
          headers: requestHeaders,
          body: requestBody,
          response_status: 500,
          response_headers: '{}',
          response_body: JSON.stringify({ error: 'Proxy error', message: err.message }),
          timestamp: new Date().toISOString(),
          duration: duration
        };
        
        await storeLog(log);
        console.log(`Log stored for ${req.method} ${req.path} (500 - Proxy Error)`);
        
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy error', message: err.message });
        }
      }
    });
    
    // Apply the proxy middleware
    proxyMiddleware(req, res, next);
    
  } catch (error) {
    console.error('Proxy setup error:', error);
    res.status(500).json({ error: 'Proxy setup error', message: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Interceptor Proxy Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for localhost origins`);
  console.log(`🔄 Proxy functionality enabled`);
  console.log(`📝 Logging functionality enabled`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`⚡ Compression enabled`);
  console.log(`📊 Request logging enabled`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Status: http://localhost:${PORT}/status`);
}); 
