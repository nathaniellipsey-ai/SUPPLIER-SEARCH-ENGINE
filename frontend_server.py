#!/usr/bin/env python3
"""
Frontend Server - Port 3002
Serves the dashboard HTML and static files
"""

import http.server
import os
import sys
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
    try:
        # Try to bind to localhost
        server = http.server.HTTPServer(('127.0.0.1', PORT), FrontendHandler)
        server.allow_reuse_address = True
        print(f'[FRONTEND] SUCCESS: Running on http://127.0.0.1:{PORT}')
        print(f'[FRONTEND] Access at: http://localhost:{PORT}')
        print(f'[FRONTEND] Serving from: {FRONTEND_DIR}')
        print(f'[FRONTEND] Press Ctrl+C to stop')
        sys.stdout.flush()
        server.serve_forever()
    except OSError as e:
        print(f'[FRONTEND] OSError: {e}')
        print(f'[FRONTEND] Trying alternative bind...')
        try:
            server = http.server.HTTPServer(('', PORT), FrontendHandler)
            server.allow_reuse_address = True
            print(f'[FRONTEND] Running on port {PORT}')
            server.serve_forever()
        except Exception as e2:
            print(f'[FRONTEND] FATAL: Could not bind to port {PORT}: {e2}')
    except KeyboardInterrupt:
        print('[FRONTEND] Shutting down...')
        server.server_close()
