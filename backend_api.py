#!/usr/bin/env python3
"""
Backend API Server - Port 3000
Handles user data, favorites, notes, inbox
"""

import http.server
import json
from urllib.parse import urlparse, parse_qs
import urllib.request

PORT = 3000
DATA_SERVER_URL = 'http://localhost:3001'

# In-memory storage
user_data = {}

class BackendAPIHandler(http.server.BaseHTTPRequestHandler):
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
            user_id = query.get('user_id', ['anonymous'])[0]
            
            if path == '/api/user/profile':
                profile = user_data.get(user_id, {
                    'favorites': [],
                    'notes': {},
                    'inbox': [],
                    'preferences': {'theme': 'light'}
                })
                response = {'success': True, 'user': profile}
            
            elif path == '/api/user/favorites':
                favorites = user_data.get(user_id, {}).get('favorites', [])
                response = {'success': True, 'favorites': favorites}
            
            elif path == '/api/user/notes':
                notes = user_data.get(user_id, {}).get('notes', {})
                response = {'success': True, 'notes': notes}
            
            elif path == '/api/user/inbox':
                inbox = user_data.get(user_id, {}).get('inbox', [])
                response = {'success': True, 'inbox': inbox}
            
            else:
                # Proxy to data server
                try:
                    url = f"{DATA_SERVER_URL}{self.path}"
                    with urllib.request.urlopen(url, timeout=5) as resp:
                        response = json.loads(resp.read().decode())
                except:
                    response = {'success': False, 'error': 'Data server unavailable'}
        
        except Exception as e:
            response = {'success': False, 'error': str(e)}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
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
            
            if path == '/api/user/favorites/add':
                supplier_id = data.get('supplier_id')
                if supplier_id not in user_data[user_id]['favorites']:
                    user_data[user_id]['favorites'].append(supplier_id)
                response = {'success': True, 'message': 'Added to favorites'}
            
            elif path == '/api/user/favorites/remove':
                supplier_id = data.get('supplier_id')
                user_data[user_id]['favorites'] = [s for s in user_data[user_id]['favorites'] if s != supplier_id]
                response = {'success': True, 'message': 'Removed from favorites'}
            
            elif path == '/api/user/notes/save':
                supplier_id = data.get('supplier_id')
                note_text = data.get('note_text', '')
                user_data[user_id]['notes'][supplier_id] = note_text
                response = {'success': True, 'message': 'Note saved'}
            
            elif path == '/api/user/inbox/add':
                message = data.get('message')
                user_data[user_id]['inbox'].append({
                    'id': len(user_data[user_id]['inbox']) + 1,
                    'message': message,
                    'timestamp': 'just now',
                    'read': False
                })
                response = {'success': True, 'message': 'Message added'}
            
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
        print(f'[BACKEND API] {format % args}')

if __name__ == '__main__':
    server = http.server.HTTPServer(('localhost', PORT), BackendAPIHandler)
    print(f'[BACKEND API] Running on http://localhost:{PORT}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('[BACKEND API] Shutting down...')
        server.server_close()
