from flask import Flask, send_from_directory, request
from flask import jsonify
from flask_cors import CORS
from .routes import routes
import os


def create_app():
    static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
    app = Flask(__name__, static_folder=static_folder, static_url_path="/static")
    app.secret_key = 'secretKey'

    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5000", "https://museek-f10m.onrender.com"], supports_credentials=True)

    app.register_blueprint(routes, url_prefix='/api')

    print(f"Flask static folder is: {app.static_folder}")
    print(f"Static folder absolute path: {os.path.abspath(app.static_folder)}")
    print(f"Static folder exists: {os.path.exists(app.static_folder)}")

    @app.route('/debug-routes')
    def debug_routes():
        routes_list = []
        for rule in app.url_map.iter_rules():
            routes_list.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': str(rule.rule)
            })
        return jsonify(routes_list)
    
    # Fixed catch-all route
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path=''):
        print(f"=== SERVE_REACT CALLED ===")
        print(f"Requested path: '{path}'")
        print(f"Full request URL: {request.url}")
        print(f"Request method: {request.method}")
        
        # Don't handle API routes here
        if path.startswith('api/'):
            print(f"API route requested but not found: {path}")
            return {"error": "API endpoint not found"}, 404
    
        # Check if it's a static file
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            print(f"Found static file for path: {path}")
            return send_from_directory(app.static_folder, path)
        
        # Serve index.html for all other routes
        index_path = os.path.join(app.static_folder, "index.html")
        print(f"Serving index.html from: {index_path}")
        return send_from_directory(app.static_folder, "index.html")

    return app