#!/usr/bin/env python3
"""
Data Server - Port 3001
Provides supplier data via REST API
"""

import http.server
import json
import math
from urllib.parse import urlparse, parse_qs

PORT = 3001

# Seeded random generator
def seeded_random(seed):
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def generate_suppliers(count=5000):
    """Generate supplier data with seeded random"""
    names = [
        'Global Supplies Inc', 'Prime Manufacturing', 'Quality Materials Co',
        'BuildRight Industries', 'EcoTech Solutions', 'FastTrack Logistics',
        'Premium Parts Ltd', 'Industrial Dynamics', 'CoreFlow Systems',
        'VisionPoint Supplies', 'NextGen Manufacturing', 'Apex Solutions Inc',
        'Pinnacle Resources', 'Elite Distribution', 'Quantum Components',
        'Stellar Manufacturing', 'Nexus Industries', 'Titan Solutions'
    ]
    
    categories = [
        'Concrete & Cement', 'Steel & Metal', 'Lumber & Wood',
        'Roofing Materials', 'Insulation', 'Drywall & Gypsum',
        'Electrical', 'Plumbing', 'HVAC', 'Flooring',
        'Windows & Doors', 'Materials & Supplies', 'Manufacturing',
        'Logistics', 'Technology', 'Engineering'
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
            'description': f'Leading {categories[int(seeded_random(seed + 100) * len(categories))].lower()} provider with {int(5 + seeded_random(seed + 600) * 40)} years of experience.',
            'products': [categories[int(seeded_random(seed + 100 + j) * len(categories))] for j in range(3)]
        })
    
    return suppliers

# Cache suppliers
suppliers_cache = generate_suppliers(5000)

class DataServerHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parse_qs(parsed_path.query)
        
        # Enable CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        
        try:
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
        print(f'[DATA SERVER] {format % args}')

if __name__ == '__main__':
    server = http.server.HTTPServer(('localhost', PORT), DataServerHandler)
    print(f'[DATA SERVER] Running on http://localhost:{PORT}')
    print(f'[DATA SERVER] Generated {len(suppliers_cache)} suppliers')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('[DATA SERVER] Shutting down...')
        server.server_close()
