import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;
const DATA_SERVER_URL = process.env.DATA_SERVER_URL || 'http://localhost:3001';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for user data (in production, use a real database)
const userStore = new Map();

// Authentication middleware (simplified)
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// Initialize user data
function initializeUser(userId) {
  if (!userStore.has(userId)) {
    userStore.set(userId, {
      favorites: [],
      notes: {},
      inbox: [],
      preferences: {
        theme: 'light',
        sortBy: 'rating',
        defaultCategory: null
      }
    });
  }
  return userStore.get(userId);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend', port: PORT });
});

// Proxy to data server
app.get('/api/suppliers', async (req, res) => {
  try {
    const response = await fetch(`${DATA_SERVER_URL}/api/suppliers`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch suppliers' });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const response = await fetch(`${DATA_SERVER_URL}/api/suppliers/${req.params.id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch supplier' });
  }
});

app.post('/api/suppliers/search', async (req, res) => {
  try {
    const response = await fetch(`${DATA_SERVER_URL}/api/suppliers/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const response = await fetch(`${DATA_SERVER_URL}/api/stats`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// User-specific endpoints
app.post('/api/user/favorites/add', authenticate, (req, res) => {
  const { supplierId } = req.body;
  const user = initializeUser(req.userId);
  
  if (!user.favorites.includes(supplierId)) {
    user.favorites.push(supplierId);
  }
  
  res.json({ success: true, favorites: user.favorites });
});

app.post('/api/user/favorites/remove', authenticate, (req, res) => {
  const { supplierId } = req.body;
  const user = initializeUser(req.userId);
  user.favorites = user.favorites.filter(id => id !== supplierId);
  res.json({ success: true, favorites: user.favorites });
});

app.get('/api/user/favorites', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, favorites: user.favorites });
});

app.post('/api/user/notes/save', authenticate, (req, res) => {
  const { supplierId, content } = req.body;
  const user = initializeUser(req.userId);
  
  if (content.trim()) {
    user.notes[supplierId] = {
      content,
      updatedAt: new Date().toISOString()
    };
  } else {
    delete user.notes[supplierId];
  }
  
  res.json({ success: true, notes: user.notes });
});

app.get('/api/user/notes/:supplierId', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  const note = user.notes[req.params.supplierId] || null;
  res.json({ success: true, note });
});

app.get('/api/user/notes', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, notes: user.notes });
});

app.post('/api/user/inbox/add', authenticate, (req, res) => {
  const { title, message, supplierId } = req.body;
  const user = initializeUser(req.userId);
  
  user.inbox.push({
    id: Date.now().toString(),
    title,
    message,
    supplierId,
    timestamp: new Date().toISOString(),
    read: false
  });
  
  res.json({ success: true, inbox: user.inbox });
});

app.get('/api/user/inbox', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, inbox: user.inbox });
});

app.post('/api/user/inbox/mark-read', authenticate, (req, res) => {
  const { messageId } = req.body;
  const user = initializeUser(req.userId);
  const message = user.inbox.find(m => m.id === messageId);
  
  if (message) {
    message.read = true;
  }
  
  res.json({ success: true, inbox: user.inbox });
});

app.post('/api/user/preferences', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  user.preferences = { ...user.preferences, ...req.body };
  res.json({ success: true, preferences: user.preferences });
});

app.get('/api/user/preferences', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, preferences: user.preferences });
});

app.get('/api/user/profile', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({
    success: true,
    user: {
      id: req.userId,
      role: 'procurement_officer',
      department: 'Supplier Relations',
      ...user
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
  console.log(`📡 Connected to Data Server at ${DATA_SERVER_URL}`);
  console.log(`📚 Try: curl -H "X-User-ID: user1" http://localhost:${PORT}/api/user/profile`);
});

process.on('SIGINT', () => {
  console.log('\n📴 Backend Server shutting down...');
  process.exit(0);
});
