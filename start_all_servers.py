#!/usr/bin/env python3
"""
Master script to start all three servers
Data Server (3001) -> Backend API (3000) -> Frontend (3002)
"""

import subprocess
import time
import sys
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

def start_server(name, script, port):
    """Start a server in a new process"""
    print(f'\n[LAUNCHER] Starting {name}...')
    try:
        process = subprocess.Popen(
            [sys.executable, str(BASE_DIR / script)],
            cwd=str(BASE_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        print(f'[LAUNCHER] {name} started (PID: {process.pid})')
        return process
    except Exception as e:
        print(f'[LAUNCHER] ERROR starting {name}: {e}')
        return None

if __name__ == '__main__':
    print('[LAUNCHER] Walmart Supplier Portal - Starting All Servers')
    print('[LAUNCHER] =================================================')
    
    # Start servers in order: Data -> Backend -> Frontend
    servers = []
    
    # Data Server
    server = start_server('Data Server (3001)', 'data_server.py', 3001)
    if server:
        servers.append(server)
        time.sleep(1)
    
    # Backend API
    server = start_server('Backend API (3000)', 'backend_api.py', 3000)
    if server:
        servers.append(server)
        time.sleep(1)
    
    # Frontend Server
    server = start_server('Frontend Server (3002)', 'frontend_server.py', 3002)
    if server:
        servers.append(server)
        time.sleep(1)
    
    print('\n[LAUNCHER] =================================================')
    print('[LAUNCHER] All servers started!')
    print('[LAUNCHER] Open in browser: http://localhost:3002')
    print('[LAUNCHER] Press Ctrl+C to stop all servers')
    print('[LAUNCHER] =================================================')
    
    try:
        for server in servers:
            server.wait()
    except KeyboardInterrupt:
        print('\n[LAUNCHER] Shutting down all servers...')
        for server in servers:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
        print('[LAUNCHER] All servers stopped')
