from flask import Blueprint, render_template, request, jsonify, session
from .spotify_utils import get_combined_similar_tracks, search_spotify_tracks, get_user_favorites, getSearchResults, getArtistByGenre, getSongsByGenre, getSongsByArtist, getSongsByDecade
from firebase_admin import auth, firestore
from .firebase_init import firebase_init
import random

firebase_init()
routes = Blueprint('routes', __name__)


@routes.route('/session_login', methods=['POST'])
def session_login():
    id_token = request.json.get('idToken')
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        session['user_id'] = uid
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401

@routes.route('/store-favorite', methods=['POST'])
def store_favorite():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")

    try:
        decoded_token = auth.verify_id_token(token)
        user = decoded_token['uid']
    except Exception as e:
        print("Token verification failed:", e)
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    print('data to store as favorite:', data)
    
    type = data.get('type')
    item_data = data.get('data')

    import uuid
    favorite_id = str(uuid.uuid4())
    
    db = firestore.client()

    favorite_doc = {
        'id': favorite_id,
        'type': type,
        'data': item_data,
        'created_at': firestore.SERVER_TIMESTAMP
    }
    
    db.collection('users').document(user).collection('favorites').document(favorite_id).set(favorite_doc)
    
    return jsonify({"status": "success", "id": favorite_id}), 200

@routes.route('/get-favorites', methods=['POST'])
def get_favorites():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        decoded_token = auth.verify_id_token(token)
        user = decoded_token['uid']
    except Exception as e:
        print("Token verification failed:", e)
        return jsonify({"error": "Unauthorized"}), 401

    favorites = get_user_favorites(user)
    return jsonify({"favorites": favorites}), 200

@routes.route('/delete-favorite', methods=['POST'])
def delete_favorite():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        decoded_token = auth.verify_id_token(token)
        user = decoded_token['uid']
    except Exception as e:
        print("Token verification failed:", e)
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    favorite_id = data.get('id')  # Changed from 'track_id' to 'id'
    print('deleting', favorite_id)
    db = firestore.client()

    try:
        db.collection('users').document(user).collection('favorites').document(favorite_id).delete()
        return jsonify({"message": "Favorite deleted"}), 200
    except Exception as e:
        print("Error deleting favorite:", e)
        return jsonify({"error": "Failed to delete favorite"}), 500


@routes.route('/search', methods=['POST', 'GET'])
def search():
    data = request.get_json()
    search_type = data.get('search-type')
    query = data.get('query')

    if search_type == 'genre-songs':
        tracks = getSongsByGenre(query)
    elif search_type == 'artist':
        tracks = getSongsByArtist(query)
    elif search_type == 'decade':
        tracks = getSongsByDecade(query)
    elif search_type == 'artists-by-genre':
        artists = getArtistByGenre(query)
        return jsonify({'tracks': artists})
    else:
        return jsonify({'error': 'Invalid search type'}), 400

    return jsonify({'tracks': tracks})


@routes.route('/search-bar', methods=['POST', 'GET'])
def search_bar():
    data = request.get_json();
    search_filter = data.get('filter')
    search_input = data.get('query')

    print ('attempting to get search results with filter, ', search_filter, search_input)

    if search_filter:
        searchResults = getSearchResults(search_input, search_filter)
    else:
        searchResults = getSearchResults(search_input)

    return jsonify(searchResults)

@routes.route('/get-recommended', methods=['POST', 'GET'])
def get_recommended():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        decoded_token = auth.verify_id_token(token)
        user = decoded_token['uid']
    except Exception as e:
        print("Token verification failed:", e)
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    music_type = data.get('type')
    song_name = data.get('songName')

    if song_name:
        seed_song = [song_name]
        similar_tracks = get_combined_similar_tracks(seed_song, max_total=20)
        recommended_tracks = search_spotify_tracks(similar_tracks)

        return jsonify({"tracks": recommended_tracks})

    user_favorites = get_user_favorites(user)

    favorite_tracks = [
        {"name": fav['data']['name'], "artist": fav['data']['artist']}
        for fav in user_favorites
        if fav['type'] == 'song' and 'name' in fav['data'] and 'artist' in fav['data']
    ]

    if not favorite_tracks:
        return jsonify({"tracks": []})

    similar_tracks = get_combined_similar_tracks(favorite_tracks, max_total=20)

    recommended_tracks = search_spotify_tracks(similar_tracks)

    return jsonify({"tracks": recommended_tracks})