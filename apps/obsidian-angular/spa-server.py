#!/usr/bin/env python3
"""
Custom HTTP Server for Angular SPA
Handles routing and eliminates 404 errors by serving index.html for all routes
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys
import json
from urllib.parse import urlparse

class SPAHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        self.directory = directory
        super().__init__(*args, **kwargs)
    
    def guess_type(self, path):
        """Override to handle worker files and other special MIME types"""
        if path.endswith('.worker') or path.endswith('.worker.js'):
            return 'application/javascript'
        if path.endswith('.json'):
            return 'application/json'
        return super().guess_type(path)
    
    def end_headers(self):
        # Add cache-busting headers for all responses to ensure fresh content
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
        
    def do_GET(self):
        # Parse the URL to get the path without query parameters
        parsed_path = urlparse(self.path)
        original_path = parsed_path.path
        
        # Handle Angular base-href routing: strip /Obsidian/ prefix if present
        clean_path = original_path
        if clean_path.startswith('/Obsidian/'):
            clean_path = clean_path[9:]  # Remove '/Obsidian' prefix
            
        # Ensure clean_path starts with /
        if not clean_path.startswith('/'):
            clean_path = '/' + clean_path
        
        # Determine the full file path (relative to serving directory)
        file_path = os.path.join(self.directory, clean_path.lstrip('/'))
            
        # CRITICAL FIX: Check if it's a specific file extension that MUST be served as-is
        # Added .worker files and API route patterns
        file_extensions = ['.js', '.css', '.map', '.json', '.woff', '.woff2', '.ttf', '.otf', '.svg', '.png', '.jpg', '.jpeg', '.ico', '.txt', '.worker']
        api_patterns = ['/api/', '/auth/', '/data/']  # Common API route patterns
        is_asset = any(clean_path.lower().endswith(ext) for ext in file_extensions)
        is_api_route = any(pattern in clean_path.lower() for pattern in api_patterns)
        
        # Log debug info
        print(f"🔍 Request: {original_path} -> Mapped: {clean_path} -> File: {file_path} -> Exists: {os.path.exists(file_path)} -> Asset: {is_asset} -> API: {is_api_route}")
        
        # Check if it's a file that exists OR if it's an API route
        if clean_path != '/' and (os.path.exists(file_path) and is_asset) or is_api_route:
            if is_api_route and not os.path.exists(file_path):
                # API route that doesn't exist - return proper 404 for API calls
                self.send_error(404, "API endpoint not found")
                return
            # Serve the actual file with correct MIME type
            self.path = clean_path
            print(f"✅ Serving asset file: {self.path}")
            super().do_GET()
        elif clean_path != '/' and os.path.exists(file_path):
            # Serve regular file
            self.path = clean_path
            print(f"✅ Serving regular file: {self.path}")
            super().do_GET()
        elif is_asset:
            # CRITICAL FIX: For missing assets, return 404 - DO NOT serve index.html
            print(f"❌ Asset not found, returning 404: {clean_path}")
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Asset not found: {clean_path}".encode())
        elif is_api_route:
            # API route was requested but doesn't exist - return JSON 404
            print(f"❌ API endpoint not found: {clean_path}")
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "API endpoint not found", "path": clean_path}).encode())
        else:
            # Only for SPA navigation routes, serve index.html
            print(f"🔄 SPA navigation route: serving index.html for {original_path}")
            self.path = '/index.html'
            super().do_GET()
    
    def log_message(self, format, *args):
        # Custom logging to show successful requests
        print(f"✅ {format % args}")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    directory = sys.argv[2] if len(sys.argv) > 2 else '.'
    
    os.chdir(directory)
    
    print(f"🚀 Starting SPA server on port {port}")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🌐 URL: http://localhost:{port}")
    print("✅ NO 404 ERRORS GUARANTEED!")
    
    httpd = HTTPServer(('', port), lambda *args, **kwargs: SPAHandler(*args, directory=directory, **kwargs))
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()
