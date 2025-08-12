const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3004;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'apikey']
}));

// Parse JSON bodies
app.use(express.json());

// Supabase configuration
const SUPABASE_URL = 'masked';
const SUPABASE_ANON_KEY = 'masked';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to verify session
async function verifySession(sessionId) {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !sessions) {
      return { authenticated: false };
    }

    // Check if session is expired
    if (new Date(sessions.expires_at) < new Date()) {
      await supabase.from('sessions').delete().eq('id', sessionId);
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: sessions.user_data
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { authenticated: false };
  }
}

// Middleware to handle authentication
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (token === 'no-login') {
    // Allow no-login mode
    req.user = { id: 'system', email: 'system@example.com', name: 'System User' };
    return next();
  }

  const session = await verifySession(token);
  if (!session.authenticated) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.user = session.user;
  next();
}

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'api',
    timestamp: new Date().toISOString()
  });
});

// Get all interceptors
app.get('/api/interceptors', authMiddleware, async (req, res) => {
  try {
    const { data: interceptors, error } = await supabase
      .from('interceptors')
      .select('*')
      .or(`user_id.eq.${req.user.id},user_id.eq.system`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(interceptors);
  } catch (error) {
    console.error('Error fetching interceptors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create interceptor
app.post('/api/interceptors', authMiddleware, async (req, res) => {
  try {
    const { name, base_url, is_active } = req.body;
    
    if (!name || !base_url) {
      return res.status(400).json({ error: 'Name and base_url are required' });
    }

    const { data: interceptor, error } = await supabase
      .from('interceptors')
      .insert({
        name,
        base_url,
        is_active: is_active !== undefined ? is_active : true,
        user_id: req.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json(interceptor);
  } catch (error) {
    console.error('Error creating interceptor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete interceptor
app.delete('/api/interceptors/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('interceptors')
      .delete()
      .eq('id', id)
      .or(`user_id.eq.${req.user.id},user_id.eq.system`);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting interceptor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get logs for an interceptor
app.get('/api/interceptors/:id/logs', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const { data: logs, error } = await supabase
      .from('api_logs')
      .select('*')
      .eq('interceptor_id', id)
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
  console.log('CORS enabled for localhost origins');
});
