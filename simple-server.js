import express from 'express';
import { createClient } from '@supabase/supabase-js';
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
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
    console.error('Database error:', error);
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
    console.error('Database error:', error);
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
    console.error('Database error:', error);
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
    console.error('Database error:', error);
    res.status(500).json(createErrorResponse('Database error', 500, error));
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json(createErrorResponse('Internal server error', 500, err));
});

// 404 handler - fix the route pattern
app.use('/*', (req, res) => {
  res.status(404).json(createErrorResponse('Not found', 404));
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${isAPI === 1 ? 'API' : 'SSE'}`);
  console.log(`Global Access: ${GLOBAL_ACCESS === 1 ? 'Enabled' : 'Disabled'}`);
  console.log('CORS enabled for localhost origins');
});
