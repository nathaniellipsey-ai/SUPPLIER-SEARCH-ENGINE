#!/usr/bin/env python3
"""
Master Server - Combines all three servers into one
Listens on multiple ports:
- Port 3000: Backend API
- Port 3001: Data Server  
- Port 3002: Frontend
"""

import http.server
import socketserver
import threading
import json
import math
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import os

BASE_DIR = Path(__file__).parent
FRONTEND_DIR = BASE_DIR / 'frontend'

# Seeded random generator
def seeded_random(seed):
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def generate_suppliers(count=5000):
    """Generate supplier data"""
    names = [
        'Global Supplies Inc', 'Prime Manufacturing', 'Quality Materials Co',
        'BuildRight Industries', 'EcoTech Solutions', 'FastTrack Logistics',
        'Premium Parts Ltd', 'Industrial Dynamics', 'CoreFlow Systems'
    ]
    
    categories = [
        'Concrete & Cement', 'Steel & Metal', 'Lumber & Wood',
        'Roofing Materials', 'Insulation', 'Drywall & Gypsum',
        'Electrical', 'Plumbing', 'HVAC', 'Flooring',
        'Windows & Doors', 'Materials & Supplies'
    ]
    
    regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
    cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
    
    suppliers = []
    for i in range(count):
        seed = 1962 + i
        suppliers.append({
            'id': i + 1,
            'name': names[int(seeded_random(seed) * len(names))] + f' #{i + 1}',
            'category': categories[int(seeded_random(seed + 100) * len(categories))],
            'rating': round(3.5 + seeded_random(seed + 200) * 1.5, 1),
            'aiScore': int(70 + seeded_random(seed + 300) * 30),
            'location': cities[int(seeded_random(seed + 400) * len(cities))],
            'region': regions[int(seeded_random(seed + 500) * len(regions))],
            'yearsInBusiness': int(5 + seeded_random(seed + 600) * 40),
            'employees': int(10 + seeded_random(seed + 700) * 500),
            'walmartVerified': seeded_random(seed + 850) > 0.3,
        })
    return suppliers

# Generate supplier data once
suppliers_cache = generate_suppliers(5000)
user_data = {}

print(f'Generated {len(suppliers_cache)} suppliers')

class MasterHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parse_qs(parsed_path.query)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            # Data Server endpoints (API)
            if path == '/api/suppliers':
                skip = int(query.get('skip', ['0'])[0])
                limit = int(query.get('limit', ['5000'])[0])
                data = suppliers_cache[skip:skip+limit]
                response = {'success': True, 'data': data, 'total': len(suppliers_cache)}
            
            elif path == '/api/dashboard/suppliers':
                skip = int(query.get('skip', ['0'])[0])
                limit = int(query.get('limit', ['5000'])[0])
                data = suppliers_cache[skip:skip+limit]
                response = {'success': True, 'suppliers': data, 'total': len(suppliers_cache)}
            
            elif path == '/api/dashboard/stats':
                categories = len(set(s['category'] for s in suppliers_cache))
                avg_rating = sum(s['rating'] for s in suppliers_cache) / len(suppliers_cache)
                verified = sum(1 for s in suppliers_cache if s['walmartVerified'])
                response = {
                    'success': True,
                    'totalSuppliers': len(suppliers_cache),
                    'totalCategories': categories,
                    'avgRating': round(avg_rating, 1),
                    'verifiedCount': verified
                }
            
            elif path.startswith('/api/dashboard/suppliers/search'):
                query_str = query.get('q', [''])[0].lower()
                results = [s for s in suppliers_cache if query_str in s['name'].lower() or query_str in s['category'].lower()]
                response = {'success': True, 'results': results}
            
            # Backend API endpoints
            elif path == '/api/user/favorites':
                user_id = query.get('user_id', ['anonymous'])[0]
                favorites = user_data.get(user_id, {}).get('favorites', [])
                response = {'success': True, 'favorites': favorites}
            
            elif path == '/api/user/notes':
                user_id = query.get('user_id', ['anonymous'])[0]
                notes = user_data.get(user_id, {}).get('notes', {})
                response = {'success': True, 'notes': notes}
            
            else:
                response = {'success': False, 'error': 'Not found'}
        
        except Exception as e:
            response = {'success': False, 'error': str(e)}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            data = json.loads(body.decode()) if body else {}
            user_id = data.get('user_id', 'anonymous')
            
            if user_id not in user_data:
                user_data[user_id] = {'favorites': [], 'notes': {}, 'inbox': []}
            
            if path == '/api/user/favorites/add':
                supplier_id = data.get('supplier_id')
                if supplier_id not in user_data[user_id]['favorites']:
                    user_data[user_id]['favorites'].append(supplier_id)
                response = {'success': True}
            
            elif path == '/api/user/favorites/remove':
                supplier_id = data.get('supplier_id')
                user_data[user_id]['favorites'] = [s for s in user_data[user_id]['favorites'] if s != supplier_id]
                response = {'success': True}
            
            elif path == '/api/user/notes/save':
                supplier_id = data.get('supplier_id')
                note_text = data.get('note_text', '')
                user_data[user_id]['notes'][supplier_id] = note_text
                response = {'success': True}
            
            else:
                response = {'success': False, 'error': 'Not found'}
        
        except Exception as e:
            response = {'success': False, 'error': str(e)}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Suppress logs

class FrontendHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        pass  # Suppress logs

def start_api_server():
    """Start API server on port 3000 & 3001"""
    Handler = MasterHandler
    with socketserver.TCPServer(('localhost', 3000), Handler) as httpd:
        print('[API] Server running on http://localhost:3000')
        httpd.serve_forever()

def start_frontend_server():
    """Start frontend server on port 3002"""
    os.chdir(str(FRONTEND_DIR))
    Handler = FrontendHandler
    with socketserver.TCPServer(('localhost', 3002), Handler) as httpd:
        print('[FRONTEND] Server running on http://localhost:3002')
        httpd.serve_forever()

if __name__ == '__main__':
    print('\n==================================================')
    print('Walmart Supplier Portal - Master Server')
    print('==================================================')
    print('[MAIN] Starting servers...')
    
    # Start API server in a thread
    api_thread = threading.Thread(target=start_api_server, daemon=True)
    api_thread.start()
    
    # Start frontend server (blocks)
    try:
        start_frontend_server()
    except KeyboardInterrupt:
        print('\n[MAIN] Shutting down...')
