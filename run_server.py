#!/usr/bin/env python3
"""
Complete Server - Combines everything into ONE working server
Listens on port 3002 only
"""

import http.server
import json
import math
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Configuration
PORT = 3002
FRONTEND_DIR = Path(__file__).parent / 'frontend'

# Seeded random
def seeded_random(seed):
    x = math.sin(seed) * 10000
    return x - math.floor(x)

# Generate suppliers
def generate_suppliers(count=5000):
    names = [
        'Global Supplies Inc', 'Prime Manufacturing', 'Quality Materials Co',
        'BuildRight Industries', 'EcoTech Solutions', 'FastTrack Logistics',
        'Premium Parts Ltd', 'Industrial Dynamics', 'CoreFlow Systems',
        'VisionPoint Supplies', 'NextGen Manufacturing', 'Apex Solutions Inc'
    ]
    categories = [
        'Concrete & Cement', 'Steel & Metal', 'Lumber & Wood',
        'Roofing Materials', 'Insulation', 'Drywall & Gypsum',
        'Electrical', 'Plumbing', 'HVAC', 'Flooring',
        'Windows & Doors', 'Materials & Supplies', 'Manufacturing', 'Logistics'
    ]
    regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
    cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Denver', 'Atlanta', 'Seattle']
    
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
            'projectsCompleted': int(100 + seeded_random(seed + 800) * 1000),
            'responseTime': f"{int(1 + seeded_random(seed + 900) * 24)}h",
            'address': f"{int(seeded_random(seed + 950) * 9000)} Main St",
            'city': cities[int(seeded_random(seed + 400) * len(cities))],
            'walmartVerified': seeded_random(seed + 850) > 0.3,
            'size': ['Small (1-50)', 'Medium (51-500)', 'Large (500+)'][int(seeded_random(seed + 700) * 3)],
            'priceRange': ['Budget ($)', 'Standard ($$)', 'Premium ($$$)', 'Enterprise ($$$$)'][int(seeded_random(seed + 750) * 4)],
            'minOrder': f"${int(100 + seeded_random(seed + 800) * 10000)}",
            'paymentTerms': ['Net 30', 'Net 60', 'Net 90', 'COD'][int(seeded_random(seed + 600) * 4)],
            'description': f'Leading {categories[int(seeded_random(seed + 100) * len(categories))].lower()} provider.'
        })
    return suppliers

print('[SERVER] Generating 5000 suppliers...')
suppliers_cache = generate_suppliers(5000)
user_data = {}
print(f'[SERVER] Ready with {len(suppliers_cache)} suppliers')

class UnifiedHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parse_qs(parsed_path.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        
        try:
            # API endpoints
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
                q = query.get('q', [''])[0].lower()
                results = [s for s in suppliers_cache if q in s['name'].lower() or q in s['category'].lower()]
                response = {'success': True, 'results': results}
            
            # Serve HTML file for root path
            elif path == '/' or path == '/index.html':
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                # Serve dashboard_with_api.html instead of index.html
                html_file = Path(__file__).parent / 'dashboard_with_api.html'
                if html_file.exists():
                    self.wfile.write(html_file.read_bytes())
                else:
                    self.wfile.write(b'<h1>dashboard_with_api.html not found</h1>')
                return
            
            else:
                response = {'success': False, 'error': 'Not found'}
        
        except Exception as e:
            response = {'success': False, 'error': str(e)}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            data = json.loads(body.decode()) if body else {}
            user_id = data.get('user_id', 'anonymous')
            
            if user_id not in user_data:
                user_data[user_id] = {'favorites': [], 'notes': {}, 'inbox': []}
            
            if self.path == '/api/user/favorites/add':
                supplier_id = data.get('supplier_id')
                if supplier_id not in user_data[user_id]['favorites']:
                    user_data[user_id]['favorites'].append(supplier_id)
                response = {'success': True}
            
            elif self.path == '/api/user/favorites/remove':
                supplier_id = data.get('supplier_id')
                user_data[user_id]['favorites'] = [s for s in user_data[user_id]['favorites'] if s != supplier_id]
                response = {'success': True}
            
            elif self.path == '/api/user/notes/save':
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
        print(f'[SERVER] {format % args}')

if __name__ == '__main__':
    try:
        server = http.server.HTTPServer(('', PORT), UnifiedHandler)
        print(f'\n[SERVER] ==========================================')
        print(f'[SERVER] Server running on http://localhost:{PORT}')
        print(f'[SERVER] Open in browser: http://localhost:{PORT}')
        print(f'[SERVER] ==========================================')
        print(f'[SERVER] Press Ctrl+C to stop\n')
        import sys
        sys.stdout.flush()
        server.serve_forever()
    except Exception as e:
        print(f'[SERVER] FATAL ERROR: {e}')
        import traceback
        traceback.print_exc()
