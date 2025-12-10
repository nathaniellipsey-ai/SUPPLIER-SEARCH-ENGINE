import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.FRONTEND_PORT || 3002;

// Serve static files
app.use(express.static(__dirname));

// Route index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend Server running on http://localhost:${PORT}`);
  console.log(`💳 Open in browser: http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\n📴 Frontend Server shutting down...');
  process.exit(0);
});
