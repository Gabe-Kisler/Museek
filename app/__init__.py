from flask import Flask, send_from_directory
from flask_cors import CORS
from .routes import routes
import os


def create_app():
    app = Flask(__name__, static_folder=os.path.join("frontend", "dist"), static_url_path="")
    app.secret_key = 'secretKey'

    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5000", "https://museek-jye2.onrender.com"], supports_credentials=True)

    app.register_blueprint(routes)

    print(f"Flask static folder is: {app.static_folder}")
    print(f"Static folder absolute path: {os.path.abspath(app.static_folder)}")
    print(f"Static folder exists: {os.path.exists(app.static_folder)}")

    @app.route('/')
    @app.route('/<path:path>')
    def serve_react(path=""):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

    return app
    