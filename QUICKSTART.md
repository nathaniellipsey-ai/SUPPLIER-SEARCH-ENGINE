# 🚀 Quick Start Guide - Walmart Supplier Portal

## Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Verify Installation

```bash
node --version  # Should be v16+
npm --version   # Should be 7+
```

## Setup (One-time)

### Step 1: Navigate to Project Directory

```bash
cd "C:\Users\n0l08i7\OneDrive - Walmart Inc\Code Puppy\Supplier"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- ✅ **express** - Web framework
- ✅ **cors** - Cross-origin support
- ✅ **body-parser** - JSON parsing
- ✅ **ws** - WebSocket support

## Running the System

### Method 1: Start All Services at Once (Recommended)

```bash
npm start
```

You should see output like:

```
🚀 Walmart Supplier Portal - Multi-Server Launcher
==================================================

🧩 Starting services...

⏳ Starting 📊 Data Server...
⏳ Starting 🔐 Backend API...
⏳ Starting 🎨 Frontend Server...

✅ All services started!
==================================================

🎯 Service URLs:
  📊 Data Server    → http://localhost:3001
  🔐 Backend API    → http://localhost:3000
  🎨 Frontend UI    → http://localhost:3002

🌐 Open in browser: http://localhost:3002
```

### Method 2: Start Services Individually

If you prefer running each service in a separate terminal:

```bash
# Terminal 1: Start Data Server
npm run data-server
# Output: 🚀 Data Server running on http://localhost:3001

# Terminal 2: Start Backend API
npm run backend
# Output: 🚀 Backend API Server running on http://localhost:3000

# Terminal 3: Start Frontend
npm run frontend:dev
# Output: 🚀 Frontend Server running on http://localhost:3002
```

### Method 3: Development Mode with Hot Reload

```bash
npm run dev
```

## Testing the System

### 1. Check if all services are running

```bash
# Open a new terminal/PowerShell and run:

# Check Data Server
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"data-server","port":3001}

# Check Backend API
curl http://localhost:3000/health
# Expected: {"status":"ok","service":"backend","port":3000}
```

### 2. Access the Dashboard

1. **Open your browser** and go to: `http://localhost:3002`
2. You should see the **Supplier Portal Dashboard**
3. Watch the **status indicator** in the top right - it should show **"Connected"** with a green dot
4. The dashboard should populate with **150 suppliers** from the data server

### 3. Test API Endpoints

```bash
# Get all suppliers
curl http://localhost:3001/api/suppliers | more

# Get supplier statistics
curl http://localhost:3001/api/stats

# Search suppliers
curl -X POST http://localhost:3001/api/suppliers/search \
  -H "Content-Type: application/json" \
  -d '{"query":"electronics"}'

# Add to favorites (replace 'user123' with any ID)
curl -X POST http://localhost:3000/api/user/favorites/add \
  -H "X-User-ID: user123" \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"SUP-0001"}'

# Get user favorites
curl http://localhost:3000/api/user/favorites -H "X-User-ID: user123"

# Save a note
curl -X POST http://localhost:3000/api/user/notes/save \
  -H "X-User-ID: user123" \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"SUP-0001","content":"Great supplier!"}'
```

## Dashboard Features

### 📊 Dashboard View
- **Live Statistics**: Total suppliers, in stock count, verified suppliers, average rating
- **Real-time Updates**: All data refreshes every 10 seconds from data server
- **Status Indicator**: Shows connection status (Green = Connected, Red = Disconnected)

### 🏢 Supplier Search
- **Search Bar**: Find suppliers by name, location, or product
- **Category Filters**: Filter by construction materials, electronics, textiles, etc.
- **Rating Filter**: See detailed supplier information
- **Product Tags**: Quick view of what each supplier offers

### ⭐ Favorites
- **Save Favorites**: Click the heart icon on any supplier
- **Quick Access**: View all favorites in the Favorites tab
- **Persistent**: Your favorites are saved in the backend

### 📝 My Notes
- **Add Notes**: Click the Note button to add supplier-specific notes
- **View All**: See all your notes in one place
- **Auto-save**: Notes are saved to the backend automatically

## Troubleshooting

### Problem: "npm: command not found"

**Solution**: Node.js is not installed or not in PATH

```bash
# Check if Node is installed
node --version

# If not installed, download from: https://nodejs.org/
# Then restart your terminal/PowerShell
```

### Problem: "Port 3000/3001/3002 already in use"

**Solution**: Kill the process using the port

```powershell
# Find process on port 3001 (Windows PowerShell)
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Stop-Process -Force

# Or use CMD
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

### Problem: "WebSocket connection failed"

**Solution**: Make sure data server is running

```bash
# Verify data server is running
curl http://localhost:3001/health

# If not, start it separately:
npm run data-server
```

### Problem: "Dashboard won't load"

**Solution**: Check all three services

```bash
# Check all services
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# If any fails, check the terminal output for errors
# Restart all services:
npm start
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  🎨 Frontend (Port 3002)                │
│  • Live Dashboard                       │
│  • Search & Filters                     │
│  • WebSocket for real-time updates      │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴──────────┐
        │                   │
        ▼                   ▼
   ┌─────────┐         ┌──────────┐
   │ Backend │         │   Data   │
   │  API    │         │ Server   │
   │(3000)   │         │ (3001)   │
   └─────────┘         └──────────┘
        │ (Manages)          │ (Provides)
        │ • Favorites        │ • Suppliers
        │ • Notes            │ • Search
        │ • Inbox            │ • Stats
        ▼                    ▼
   ┌──────────────────────────────┐
   │   User Data Store (Memory)   │
   │   Supplier Data Cache        │
   └──────────────────────────────┘
```

## API Reference

### Data Server (Port 3001)

| Method | Endpoint | Purpose |
|--------|----------|----------|
| GET | `/api/suppliers` | Get all suppliers |
| GET | `/api/suppliers/:id` | Get specific supplier |
| POST | `/api/suppliers/search` | Search with filters |
| GET | `/api/suppliers/category/:cat` | Filter by category |
| GET | `/api/stats` | Get statistics |
| GET | `/health` | Health check |

### Backend API (Port 3000)

| Method | Endpoint | Purpose |
|--------|----------|----------|
| POST | `/api/user/favorites/add` | Add to favorites |
| POST | `/api/user/favorites/remove` | Remove from favorites |
| GET | `/api/user/favorites` | Get all favorites |
| POST | `/api/user/notes/save` | Save supplier note |
| GET | `/api/user/notes` | Get all notes |
| POST | `/api/user/inbox/add` | Add message |
| GET | `/api/user/inbox` | Get messages |
| GET | `/api/user/profile` | Get user profile |
| GET | `/health` | Health check |

## Tips & Tricks

### 🛠️ Using cURL for Testing

Add these helper functions to your shell profile:

```bash
alias test-api='curl http://localhost:3000/health'
alias test-data='curl http://localhost:3001/health'
alias test-frontend='curl http://localhost:3002/health'
```

### 📊 Testing WebSocket

Use wscat for WebSocket testing:

```bash
npm install -g wscat
wscat -c ws://localhost:3001
# Type messages to test WebSocket connection
```

### 💻 Browser DevTools

1. Open **http://localhost:3002** in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab to see logs
4. Go to **Network** tab to see API calls
5. Go to **Application** → **WebSocket** to see live updates

## Performance Tips

- ✅ **Data is seeded** - Same data for all users (no database queries)
- ✅ **WebSocket streams** - Real-time updates (not polling)
- ✅ **Search is debounced** - Prevents excessive API calls
- ✅ **Responsive design** - Works on mobile, tablet, desktop

## Next Steps

Once you have the system running:

1. **Explore the API** - Use cURL to test endpoints
2. **Add more suppliers** - Edit `data-server/data-generator.js`
3. **Customize UI** - Modify `frontend/index.html`
4. **Add database** - Replace in-memory store with MongoDB/PostgreSQL
5. **Deploy** - Use Docker or cloud platforms

## Getting Help

- 📖 Check **README.md** for detailed documentation
- 🐛 Check **Troubleshooting** section above
- 💬 Look at API response examples in this guide
- 🏧 Common errors are printed to terminal/console

## Stop the System

```bash
# To stop all services, press Ctrl+C in the terminal
# You should see:
# 🚨 Shutting down all services...
# ✅ All services stopped.
```

---

**You're all set!** 🙋 Your Walmart Supplier Portal is ready to use!

Enjoy exploring the dashboard and managing suppliers! 🚀
