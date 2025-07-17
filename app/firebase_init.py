import firebase_admin
from firebase_admin import auth, credentials, firestore

def firebase_init():
    if not firebase_admin._apps:
        cred = credentials.Certificate('app/credentials/serviceKey.json')
        firebase_admin.initialize_app(cred)


