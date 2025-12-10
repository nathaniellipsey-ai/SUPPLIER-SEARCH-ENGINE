#!/usr/bin/env node

/**
 * 🐛 Test Setup Script
 * 
 * This script validates that all project files are in place
 * and displays a summary of the system architecture.
 * 
 * Usage: node test-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_FILES = [
  'package.json',
  'server.js',
  'README.md',
  'QUICKSTART.md',
  '.gitignore',
  '.env.example',
  'backend/server.js',
  'data-server/server.js',
  'data-server/data-generator.js',
  'frontend/server.js',
  'frontend/index.html'
];

const PORTS = {
  'Frontend': 3002,
  'Backend API': 3000,
  'Data Server': 3001
};

console.log('\n' + '='.repeat(60));
console.log('🚀 Walmart Supplier Portal - Setup Validation');
console.log('='.repeat(60) + '\n');

// Check Node.js version
console.log('💾 Checking Node.js...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 16) {
  console.log(`  ✅ Node.js ${nodeVersion} (OK)\n`);
} else {
  console.log(`  ❌ Node.js ${nodeVersion} (Need v16+)\n`);
  process.exit(1);
}

// Check required files
console.log('📄 Checking project files...');
let filesOK = true;

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) filesOK = false;
});

if (!filesOK) {
  console.log('\n❌ Some files are missing!');
  process.exit(1);
}

console.log('\n  ✅ All required files present!\n');

// Check package.json
console.log('📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const requiredDeps = ['express', 'cors', 'body-parser', 'ws'];
let allDepsPresent = true;

requiredDeps.forEach(dep => {
  const present = packageJson.dependencies && packageJson.dependencies[dep];
  const status = present ? '✅' : '❌';
  console.log(`  ${status} ${dep}`);
  if (!present) allDepsPresent = false;
});

if (!allDepsPresent) {
  console.log('\n❌ Missing dependencies! Run: npm install\n');
  process.exit(1);
}

console.log('\n  ✅ All dependencies declared!\n');

// Check if node_modules exists
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📕 Dependencies installed: ✅ YES\n');
} else {
  console.log('📕 Dependencies installed: ❌ NO');
  console.log('  ⚠️  Run: npm install\n');
}

// Architecture Summary
console.log('='.repeat(60));
console.log('🏗️ Architecture Summary');
console.log('='.repeat(60) + '\n');

console.log('📊 Services:\n');

Object.entries(PORTS).forEach(([name, port]) => {
  console.log(`  ${name}`);
  console.log(`    Port: ${port}`);
  console.log(`    URL: http://localhost:${port}`);
  console.log();
});

console.log('\n📚 File Structure:\n');

const structure = `
  Supplier/
  ├── package.json                 # Dependencies
  ├── server.js                    # Master launcher
  ├── README.md                    # Full documentation
  ├── QUICKSTART.md                # Setup guide
  ├── test-setup.js               # This file
  ├── .env.example                 # Config template
  ├── .gitignore                   # Git ignore rules
  ├── node_modules/               # Dependencies (after npm install)
  ├──
  ├── backend/
  │   └── server.js                # Backend API (3000)
  ├──
  ├── data-server/
  │   ├── server.js                # Data Server (3001)
  │   └── data-generator.js        # Supplier data generator
  ├──
  ├── frontend/
  │   ├── server.js                # Frontend server (3002)
  │   └── index.html               # Dashboard UI
  ├──
  └── [Original HTML files]       # Legacy files
`;

console.log(structure + '\n');

// API endpoints
console.log('='.repeat(60));
console.log('📊 API Endpoints');
console.log('='.repeat(60) + '\n');

console.log('Data Server (3001):\n');
console.log('  GET  /api/suppliers              List all suppliers');
console.log('  GET  /api/suppliers/:id          Get single supplier');
console.log('  POST /api/suppliers/search       Search with filters');
console.log('  GET  /api/stats                  Get statistics');
console.log('  WS   /                           WebSocket live updates\n');

console.log('Backend API (3000):\n');
console.log('  POST /api/user/favorites/add     Add to favorites');
console.log('  POST /api/user/favorites/remove  Remove from favorites');
console.log('  GET  /api/user/favorites         Get all favorites');
console.log('  POST /api/user/notes/save        Save supplier note');
console.log('  GET  /api/user/notes             Get all notes');
console.log('  GET  /api/user/profile           Get user profile\n');

console.log('Frontend (3002):\n');
console.log('  GET  /                           Dashboard SPA\n');

// Next steps
console.log('='.repeat(60));
console.log('🚀 Next Steps');
console.log('='.repeat(60) + '\n');

if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('1. Install dependencies:');
  console.log('   npm install\n');
  console.log('2. Start the system:');
  console.log('   npm start\n');
  console.log('3. Open in browser:');
  console.log('   http://localhost:3002\n');
} else {
  console.log('1. Start the system:');
  console.log('   npm start\n');
  console.log('2. Open in browser:');
  console.log('   http://localhost:3002\n');
  console.log('3. Read the guide:');
  console.log('   QUICKSTART.md or README.md\n');
}

console.log('='.repeat(60));
console.log('✅ Setup validation complete!');
console.log('='.repeat(60) + '\n');

console.log('📆 Documentation:');
console.log('  • README.md      - Full system documentation');
console.log('  • QUICKSTART.md  - Quick setup and usage guide');
console.log('  • package.json   - Dependencies and scripts\n');

console.log('🐛 Created with ❤️ by Code Puppy\n');
