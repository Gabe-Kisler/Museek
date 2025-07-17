import os
import json
import firebase_admin
from firebase_admin import auth, credentials, firestore

def firebase_init():
    if not firebase_admin._apps:
        service_key_json = os.getenv("FIREBASE_SERVICE_KEY_JSON")
        if service_key_json:
            # Load credentials from JSON string in env var
            service_account_info = json.loads(service_key_json)
            cred = credentials.Certificate(service_account_info)

        firebase_admin.initialize_app(cred)