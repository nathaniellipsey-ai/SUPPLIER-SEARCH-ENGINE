#!/usr/bin/env python3
"""
Simple HTTP Server for Walmart Supplier Portal Frontend
Serves the dashboard on http://localhost:3002
No external dependencies needed!
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 3002
DIR = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIR), **kwargs)
    
    def end_headers(self):
        # Add cache control headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), MyHTTPRequestHandler) as httpd:
        print("")
        print(f"[FRONTEND] Server running on http://localhost:{PORT}")
        print(f"[FRONTEND] Open in browser: http://localhost:{PORT}")
        print(f"[FRONTEND] Serving files from: {DIR}")
        print("")
        print("Press Ctrl+C to stop the server")
        print("")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("")
            print("[FRONTEND] Frontend Server shutting down...")
            httpd.server_close()
