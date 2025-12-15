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
import { chatbotResponse } from './chatbot-service.js';

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
// Generate 5000+ suppliers with full detail (not just 150!)
let suppliersCache = [];
try {
  suppliersCache = generateSupplierData(5000);
  console.log(`\n📊 Server data generator loaded ${suppliersCache.length} suppliers`);
  if (suppliersCache.length > 0) {
    console.log(`   First supplier: ${suppliersCache[0].name} (${suppliersCache[0].category})`);
  }
} catch (error) {
  console.error('❌ ERROR generating suppliers:', error.message);
  suppliersCache = [];
}
let lastUpdateTime = Date.now();

// Chat history store (optional - for multi-turn conversations)
const chatHistoryStore = new Map();

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

// ==================== AUTHENTICATION ENDPOINTS ====================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, name, walmart_id } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        detail: 'Email and name are required' 
      });
    }
    
    // Create session
    const userId = email; // Use email as user ID
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize user if needed
    initializeUser(userId);
    
    console.log(`✅ User logged in: ${email}`);
    
    res.json({
      success: true,
      session_id: sessionId,
      user_id: userId,
      user_email: email,
      user_name: name,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      detail: 'Login failed: ' + error.message 
    });
  }
});

// Guest login endpoint
app.post('/api/auth/guest', (req, res) => {
  try {
    const guestId = `guest-${Date.now()}`;
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    initializeUser(guestId);
    
    console.log(`✅ Guest user created: ${guestId}`);
    
    res.json({
      success: true,
      session_id: sessionId,
      user_id: guestId,
      user_name: 'Guest User',
      message: 'Guest login successful'
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ 
      success: false, 
      detail: 'Guest login failed' 
    });
  }
});

// ==================== DATA SERVER ENDPOINTS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'walmart-supplier-portal',
    environment: NODE_ENV,
    port: PORT,
    uptime: process.uptime(),
    suppliersLoaded: suppliersCache.length
  });
});

// DEBUG endpoint - test data
app.get('/api/test', (req, res) => {
  console.log('📥 GET /api/test called');
  res.json({
    success: true,
    message: 'Server is running and API is accessible',
    suppliersCount: suppliersCache.length,
    firstSupplier: suppliersCache.length > 0 ? suppliersCache[0].name : 'None',
    timestamp: Date.now()
  });
});

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
  console.log(`📥 GET /api/suppliers - Returning ${suppliersCache.length} suppliers`);
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

// ==================== CHATBOT ENDPOINTS ====================

// Chatbot - Answer questions
app.post('/api/chatbot/ask', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message required' });
    }
    
    // Get response from chatbot service
    const response = await chatbotResponse(message, suppliersCache, false);
    
    // Store in chat history if userId provided
    if (userId) {
      if (!chatHistoryStore.has(userId)) {
        chatHistoryStore.set(userId, []);
      }
      const history = chatHistoryStore.get(userId);
      history.push({
        userMessage: message,
        botResponse: response,
        timestamp: new Date().toISOString()
      });
      // Keep last 50 messages
      if (history.length > 50) {
        history.shift();
      }
    }
    
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process chat message',
      message: 'I encountered an error processing your question. Please try again.'
    });
  }
});

// Chatbot - Get chat history
app.get('/api/chatbot/history/:userId', (req, res) => {
  const history = chatHistoryStore.get(req.params.userId) || [];
  res.json({ success: true, history });
});

// Chatbot - Get suggestions
app.get('/api/chatbot/suggestions', (req, res) => {
  res.json({
    success: true,
    suggestions: [
      'How do I search for suppliers?',
      'Show me electronics suppliers',
      'How do I add favorites?',
      'What suppliers are available?',
      'Tell me about logistics suppliers',
      'How do I navigate the portal?',
      'How do I add notes?'
    ]
  });
});

// ==================== FRONTEND SERVER ENDPOINTS ====================

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve static files from root (legacy support)
app.use(express.static(__dirname));

// Serve frontend dashboard for all routes (SPA fallback)
app.get('/', (req, res) => {
  // Serve dashboard_with_api.html instead of frontend/index.html
  res.sendFile(path.join(__dirname, 'dashboard_with_api.html'));
});

// Catch-all for SPA routing - serve dashboard_with_api.html (before error handlers)
app.get('*', (req, res) => {
  // Only serve dashboard_with_api.html for non-API routes
  // API routes that reach here are 404s and will be handled below
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
    return res.sendFile(path.join(__dirname, 'dashboard_with_api.html'));
  }
  // For API routes that don't exist, let it fall through to error handler
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path
  });
});

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

// Error handler (before 404)
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
