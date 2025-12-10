/**
 * 🚀 Walmart Supplier Portal - Production Server
 * Runs on Render, Heroku, or any Node.js hosting
 * Combines all three services into a single process
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSupplierData } from './data-server/data-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Generate supplier data (seeded for consistency)
let suppliersCache = generateSupplierData();
let lastUpdateTime = Date.now();

// In-memory user store
const userStore = new Map();

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

// Authentication middleware
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// ==================== DATA SERVER ENDPOINTS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'walmart-supplier-portal',
    environment: NODE_ENV,
    port: PORT,
    uptime: process.uptime()
  });
});

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
  res.json({
    success: true,
    data: suppliersCache,
    timestamp: lastUpdateTime,
    count: suppliersCache.length
  });
});

// Get single supplier
app.get('/api/suppliers/:id', (req, res) => {
  const supplier = suppliersCache.find(s => s.id === req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, error: 'Supplier not found' });
  }
  res.json({ success: true, data: supplier });
});

// Search suppliers
app.post('/api/suppliers/search', (req, res) => {
  const { query, filters } = req.body;
  let results = suppliersCache;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  }

  if (filters) {
    if (filters.minRating) {
      results = results.filter(s => s.rating >= filters.minRating);
    }
    if (filters.category) {
      results = results.filter(s => s.category === filters.category);
    }
    if (filters.inStock !== undefined) {
      results = results.filter(s => s.inStock === filters.inStock);
    }
  }

  res.json({
    success: true,
    data: results,
    count: results.length
  });
});

// Get suppliers by category
app.get('/api/suppliers/category/:category', (req, res) => {
  const filtered = suppliersCache.filter(s => 
    s.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json({
    success: true,
    data: filtered,
    count: filtered.length
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    totalSuppliers: suppliersCache.length,
    inStock: suppliersCache.filter(s => s.inStock).length,
    verified: suppliersCache.filter(s => s.verified).length,
    averageRating: (suppliersCache.reduce((sum, s) => sum + s.rating, 0) / suppliersCache.length).toFixed(2),
    categories: [...new Set(suppliersCache.map(s => s.category))],
    lastUpdated: lastUpdateTime,
    uptime: process.uptime()
  };
  res.json({ success: true, data: stats });
});

// ==================== BACKEND API ENDPOINTS ====================

// User favorites - Add
app.post('/api/user/favorites/add', authenticate, (req, res) => {
  const { supplierId } = req.body;
  const user = initializeUser(req.userId);
  
  if (!user.favorites.includes(supplierId)) {
    user.favorites.push(supplierId);
  }
  
  res.json({ success: true, favorites: user.favorites });
});

// User favorites - Remove
app.post('/api/user/favorites/remove', authenticate, (req, res) => {
  const { supplierId } = req.body;
  const user = initializeUser(req.userId);
  user.favorites = user.favorites.filter(id => id !== supplierId);
  res.json({ success: true, favorites: user.favorites });
});

// User favorites - Get all
app.get('/api/user/favorites', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, favorites: user.favorites });
});

// User notes - Save
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

// User notes - Get single
app.get('/api/user/notes/:supplierId', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  const note = user.notes[req.params.supplierId] || null;
  res.json({ success: true, note });
});

// User notes - Get all
app.get('/api/user/notes', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, notes: user.notes });
});

// User inbox - Add
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

// User inbox - Get all
app.get('/api/user/inbox', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, inbox: user.inbox });
});

// User inbox - Mark read
app.post('/api/user/inbox/mark-read', authenticate, (req, res) => {
  const { messageId } = req.body;
  const user = initializeUser(req.userId);
  const message = user.inbox.find(m => m.id === messageId);
  
  if (message) {
    message.read = true;
  }
  
  res.json({ success: true, inbox: user.inbox });
});

// User preferences
app.post('/api/user/preferences', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  user.preferences = { ...user.preferences, ...req.body };
  res.json({ success: true, preferences: user.preferences });
});

app.get('/api/user/preferences', authenticate, (req, res) => {
  const user = initializeUser(req.userId);
  res.json({ success: true, preferences: user.preferences });
});

// User profile
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

// ==================== FRONTEND SERVER ENDPOINTS ====================

// Serve frontend dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Serve legacy HTML files
app.use(express.static(__dirname));

// ==================== WEBSOCKET FOR LIVE UPDATES ====================

wss.on('connection', (ws) => {
  console.log('✅ Client connected to data stream');
  
  // Send initial data
  ws.send(JSON.stringify({
    type: 'initial',
    data: suppliersCache,
    timestamp: lastUpdateTime
  }));

  ws.on('close', () => {
    console.log('❌ Client disconnected from data stream');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});

// Simulate live data updates every 10 seconds
setInterval(() => {
  suppliersCache = suppliersCache.map(supplier => ({
    ...supplier,
    inStock: Math.random() > 0.3,
    stockLevel: Math.floor(Math.random() * 10000),
    lastStockCheck: Date.now()
  }));
  
  lastUpdateTime = Date.now();
  
  // Broadcast to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'update',
        data: suppliersCache,
        timestamp: lastUpdateTime
      }));
    }
  });
}, 10000);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ==================== SERVER STARTUP ====================

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 WALMART SUPPLIER PORTAL - PRODUCTION SERVER');
  console.log('═'.repeat(60));
  console.log(`\n📌 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('\n📊 Service URLs:');
  console.log(`  📌 Main URL:        http://localhost:${PORT}`);
  console.log(`  📊 API:             http://localhost:${PORT}/api/suppliers`);
  console.log(`  📈 Stats:           http://localhost:${PORT}/api/stats`);
  console.log(`  🔌 Health:          http://localhost:${PORT}/health`);
  console.log(`  🔗 WebSocket:       ws://localhost:${PORT}`);
  console.log('\n✅ All endpoints integrated into single service!');
  console.log('═'.repeat(60) + '\n');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  server.close();
  process.exit(0);
});
