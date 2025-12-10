import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import { generateSupplierData } from './data-generator.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.DATA_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static data generation (seeded for consistency)
let suppliersCache = generateSupplierData();
let lastUpdateTime = Date.now();

// REST Endpoints
app.get('/api/suppliers', (req, res) => {
  res.json({
    success: true,
    data: suppliersCache,
    timestamp: lastUpdateTime,
    count: suppliersCache.length
  });
});

app.get('/api/suppliers/:id', (req, res) => {
  const supplier = suppliersCache.find(s => s.id === req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, error: 'Supplier not found' });
  }
  res.json({ success: true, data: supplier });
});

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

app.get('/api/stats', (req, res) => {
  const stats = {
    totalSuppliers: suppliersCache.length,
    averageRating: (suppliersCache.reduce((sum, s) => sum + s.rating, 0) / suppliersCache.length).toFixed(2),
    categories: [...new Set(suppliersCache.map(s => s.category))],
    lastUpdated: lastUpdateTime,
    uptime: process.uptime()
  };
  res.json({ success: true, data: stats });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'data-server', port: PORT });
});

// WebSocket for live updates
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

// Simulate live data updates every 10 seconds (just update stock levels)
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

server.listen(PORT, () => {
  console.log(`🚀 Data Server running on http://localhost:${PORT}`);
  console.log(`📊 Try: http://localhost:${PORT}/api/suppliers`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\n📴 Data Server shutting down...');
  server.close();
  process.exit(0);
});
