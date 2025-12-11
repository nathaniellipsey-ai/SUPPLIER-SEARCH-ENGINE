#!/usr/bin/env python3
"""
Walmart Supplier Portal Server
Binding to all available interfaces to bypass localhost restrictions
"""

import socket
import json
import os
import math
from pathlib import Path

PORT = 3002
FRONTEND_DIR = Path(__file__).parent / 'frontend'

print('[SERVER] Starting Walmart Supplier Portal...')
print(f'[SERVER] Frontend: {FRONTEND_DIR}')
print(f'[SERVER] Index.html: {(FRONTEND_DIR / "index.html").exists()}')

# Seeded random
def seeded_random(seed):
    x = math.sin(seed) * 10000
    return x - math.floor(x)

# Generate suppliers
print('[SERVER] Generating suppliers...')
suppliers = []
for i in range(5000):
    seed = 1962 + i
    suppliers.append({
        'id': i + 1,
        'name': f'Supplier #{i + 1}',
        'category': 'Materials',
        'rating': round(3.5 + seeded_random(seed) * 1.5, 1),
        'aiScore': int(70 + seeded_random(seed + 300) * 30),
        'location': 'USA',
        'region': 'Northeast',
        'yearsInBusiness': int(5 + seeded_random(seed + 600) * 40),
        'employees': int(10 + seeded_random(seed + 700) * 500),
        'walmartVerified': seeded_random(seed + 850) > 0.3
    })
print(f'[SERVER] {len(suppliers)} suppliers ready')

# Read HTML once
html_file = FRONTEND_DIR / 'index.html'
if html_file.exists():
    html_content = html_file.read_bytes()
    print(f'[SERVER] Loaded index.html ({len(html_content)} bytes)')
else:
    print('[SERVER] ERROR: index.html not found!')
    html_content = b'<h1>File not found</h1>'

print('[SERVER] Starting HTTP server...')

try:
    # Create server socket
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    # Bind to all interfaces
    server.bind(('', PORT))
    server.listen(5)
    
    print(f'[SERVER] ================================')
    print(f'[SERVER] Server running on port {PORT}')
    print(f'[SERVER] http://localhost:{PORT}')
    print(f'[SERVER] ================================\n')
    
    while True:
        try:
            client, addr = server.accept()
            data = client.recv(4096).decode('utf-8', errors='ignore')
            
            if not data:
                client.close()
                continue
            
            lines = data.split('\r\n')
            request_line = lines[0]
            
            try:
                method, path, _ = request_line.split()
                print(f'[SERVER] {method} {path}')
            except:
                client.close()
                continue
            
            # Route requests
            if path in ['/', '/index.html']:
                response = b'HTTP/1.1 200 OK\r\n'
                response += b'Content-Type: text/html\r\n'
                response += b'Access-Control-Allow-Origin: *\r\n'
                response += b'Cache-Control: no-cache\r\n'
                response += f'Content-Length: {len(html_content)}\r\n'.encode()
                response += b'Connection: close\r\n\r\n'
                response += html_content
            
            elif path == '/api/dashboard/stats':
                data_dict = {
                    'success': True,
                    'totalSuppliers': len(suppliers),
                    'totalCategories': 1,
                    'avgRating': round(sum(s['rating'] for s in suppliers) / len(suppliers), 1),
                    'verifiedCount': sum(1 for s in suppliers if s['walmartVerified'])
                }
                json_str = json.dumps(data_dict)
                response = b'HTTP/1.1 200 OK\r\n'
                response += b'Content-Type: application/json\r\n'
                response += b'Access-Control-Allow-Origin: *\r\n'
                response += f'Content-Length: {len(json_str)}\r\n'.encode()
                response += b'Connection: close\r\n\r\n'
                response += json_str.encode()
            
            elif path.startswith('/api/dashboard/suppliers'):
                data_dict = {'success': True, 'suppliers': suppliers[:100], 'total': len(suppliers)}
                json_str = json.dumps(data_dict)
                response = b'HTTP/1.1 200 OK\r\n'
                response += b'Content-Type: application/json\r\n'
                response += b'Access-Control-Allow-Origin: *\r\n'
                response += f'Content-Length: {len(json_str)}\r\n'.encode()
                response += b'Connection: close\r\n\r\n'
                response += json_str.encode()
            
            else:
                response = b'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\n404'
            
            client.sendall(response)
            client.close()
        
        except Exception as e:
            print(f'[SERVER] Error: {e}')

except KeyboardInterrupt:
    print('\n[SERVER] Shutting down...')
except Exception as e:
    print(f'[SERVER] FATAL: {e}')
finally:
    server.close()
    print('[SERVER] Stopped')
