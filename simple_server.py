#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000
DIR = 'C:\\Users\\n0l08i7\\Desktop\\RENDER REPOSITORY\\SUPPLIER-SEARCH-ENGINE\\frontend'

os.chdir(DIR)

Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(('127.0.0.1', PORT), Handler) as httpd:
        print(f'Server running at http://127.0.0.1:{PORT}')
        print(f'Serving from: {DIR}')
        print('Press Ctrl+C to stop')
        httpd.serve_forever()
except Exception as e:
    print(f'ERROR: {e}')
