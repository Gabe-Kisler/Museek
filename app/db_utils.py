from firebase_admin import firestore

def get_database():
    return firestore.client()

def get_user_favorite_songs(user, db):
    return db.collection('users').document(user).collection('favorite-songs').stream()
