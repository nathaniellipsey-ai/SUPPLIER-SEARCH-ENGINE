#!/usr/bin/env python3
import socket
import json
import os
import math
from pathlib import Path

# Configuration
PORT = 3002
HOST = '127.0.0.1'
FRONTEND_DIR = Path(__file__).parent / 'frontend'

print('[APP] Starting Walmart Supplier Server...')
print(f'[APP] Frontend dir: {FRONTEND_DIR}')
print(f'[APP] Index.html exists: {(FRONTEND_DIR / "index.html").exists()}')

# Seeded random
def seeded_random(seed):
    x = math.sin(seed) * 10000
    return x - math.floor(x)

# Generate suppliers ONCE at startup
print('[APP] Generating 5000 suppliers...')
suppliers = []
for i in range(5000):
    seed = 1962 + i
    suppliers.append({
        'id': i + 1,
        'name': f'Supplier #{i + 1}',
        'category': 'Materials & Supplies',
        'rating': round(3.5 + seeded_random(seed) * 1.5, 1),
        'aiScore': int(70 + seeded_random(seed + 300) * 30),
        'location': 'New York',
        'region': 'Northeast',
        'yearsInBusiness': int(5 + seeded_random(seed + 600) * 40),
        'employees': int(10 + seeded_random(seed + 700) * 500),
        'walmartVerified': seeded_random(seed + 850) > 0.3
    })
print(f'[APP] Generated {len(suppliers)} suppliers')

def handle_request(client_socket, addr):
    """Handle a single HTTP request"""
    try:
        # Read request
        request = client_socket.recv(4096).decode('utf-8', errors='ignore')
        lines = request.split('\r\n')
        
        if not lines:
            return
        
        request_line = lines[0]
        method, path, protocol = request_line.split()
        
        print(f'[APP] {method} {path}')
        
        # Handle requests
        if path == '/' or path == '/index.html':
            # Serve HTML file
            html_file = FRONTEND_DIR / 'index.html'
            if html_file.exists():
                content = html_file.read_bytes()
                response = f"""HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: {len(content)}
Access-Control-Allow-Origin: *
Cache-Control: no-cache
\r\n""".encode() + content
            else:
                response = b'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found'
        
        elif path.startswith('/api/'):
            # Handle API requests
            if path == '/api/dashboard/stats':
                categories = 1
                avg_rating = sum(s['rating'] for s in suppliers) / len(suppliers)
                verified = sum(1 for s in suppliers if s['walmartVerified'])
                data = {
                    'success': True,
                    'totalSuppliers': len(suppliers),
                    'totalCategories': categories,
                    'avgRating': round(avg_rating, 1),
                    'verifiedCount': verified
                }
            elif path.startswith('/api/dashboard/suppliers'):
                data = {'success': True, 'suppliers': suppliers[:100], 'total': len(suppliers)}
            else:
                data = {'success': False, 'error': 'Unknown API endpoint'}
            
            json_response = json.dumps(data)
            response = f"""HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: {len(json_response)}
Access-Control-Allow-Origin: *
\r\n""".encode() + json_response.encode()
        
        else:
            response = b'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404'
        
        client_socket.sendall(response)
    
    except Exception as e:
        print(f'[APP] Error handling request: {e}')
    
    finally:
        client_socket.close()

def start_server():
    """Start the HTTP server"""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind((HOST, PORT))
        server_socket.listen(1)
        print(f'[APP] ================================')
        print(f'[APP] Server listening on http://{HOST}:{PORT}')
        print(f'[APP] Access at: http://localhost:{PORT}')
        print(f'[APP] ================================')
        print(f'[APP] Press Ctrl+C to stop\n')
        
        while True:
            client_socket, addr = server_socket.accept()
            handle_request(client_socket, addr)
    
    except KeyboardInterrupt:
        print(f'\n[APP] Shutting down...')
    except Exception as e:
        print(f'[APP] Server error: {e}')
    finally:
        server_socket.close()
        print(f'[APP] Server stopped')

if __name__ == '__main__':
    start_server()
