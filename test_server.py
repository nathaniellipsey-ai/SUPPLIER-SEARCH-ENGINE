#!/usr/bin/env python3
import sys
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

print("Python version:", sys.version)
print("Starting server...")

try:
    PORT = 8000
    HANDLER = SimpleHTTPRequestHandler
    
    # Test if we can create a socket
    test_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    test_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    test_sock.bind(('', PORT))
    print(f"Socket bind successful on port {PORT}")
    test_sock.close()
    
    # Now start actual server
    server = HTTPServer(('', PORT), HANDLER)
    print(f"Server created on port {PORT}")
    print(f"Serving from: {Path.cwd()}")
    print(f"Access at: http://localhost:{PORT}")
    print(f"Press Ctrl+C to stop")
    sys.stdout.flush()
    server.serve_forever()
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
