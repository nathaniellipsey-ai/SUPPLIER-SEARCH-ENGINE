#!/usr/bin/env python3
"""
Frontend Server - Port 3002
Serves the dashboard HTML and static files
"""

import http.server
import os
from pathlib import Path

PORT = 3002
FRONTEND_DIR = Path(__file__).parent / 'frontend'

class FrontendHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        print(f'[FRONTEND] {format % args}')

if __name__ == '__main__':
    os.chdir(str(FRONTEND_DIR))
    server = http.server.HTTPServer(('localhost', PORT), FrontendHandler)
    print(f'[FRONTEND] Running on http://localhost:{PORT}')
    print(f'[FRONTEND] Serving from: {FRONTEND_DIR}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('[FRONTEND] Shutting down...')
        server.server_close()
