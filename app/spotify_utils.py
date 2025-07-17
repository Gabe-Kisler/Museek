from flask import session
import random, requests
from .db_utils import get_database, get_user_favorite_songs
from .spotify_client import sp
import spotipy
import time
from firebase_admin import firestore
import os
from dotenv import load_dotenv


load_dotenv()

LASTFM_API_KEY = os.getenv('LASTFM_API_KEY')
LASTFM_API_ROOT = "http://ws.audioscrobbler.com/2.0/"

genre_cache = {}
artist_cache = {}
decade_cache = {}
artist_genre_cache = {}

def getRecommendedSongs():
    user = session.get('user_id')
    
    db = get_database()
    favorites_stream = get_user_favorite_songs(user, db)
    favorite_songs = [doc.to_dict() for doc in favorites_stream]

    track_ids = [song['value'] for song in favorite_songs if 'value' in song]

    if not track_ids:
        return []

    print(sp.me())  
    print('Track IDs:', track_ids)
    track_ids = ['3tFed7YsjGnIfxeLEQwx3R', '6jgkEbmQ2F2onEqsEhiliL', '3eh51r6rFWAlGQRlHx9QnQ']

    seed_tracks = random.sample(track_ids, min(5, len(track_ids)))

    print('Seed Tracks:', track_ids)

def getSongsByGenre(genre):
    if genre in genre_cache:
        return random.sample(genre_cache[genre], 20)
    
    print ('getting songs from genre using genre:', genre)
    results = safe_spotify_call(sp.search, q=f'genre:"{genre}"', limit=50, type="track")

    items = results['tracks']['items']

    if not items:
        print(f"No tracks found for genre: {genre}")
        return []

    tracks = [build_track_info(track) for track in items]
    genre_cache[genre] = tracks
    return random.sample(tracks, 20)

def getSongsByDecade(decade):
    if decade in decade_cache:
        return random.sample(decade_cache[decade], 20)
    
    decade_end = decade + 9
    query = f'year:{decade}-{decade_end}'
    results =safe_spotify_call(sp.search, q=query, limit=50, type="track")
    items = results['tracks']['items']

    tracks = [build_track_info(track) for track in items]
    decade_cache[decade] = tracks

    return random.sample(tracks, 20)

def getSongsByArtist(artist):
    if artist in artist_cache:
        return random.sample(artist_cache[artist], 20)
    
    results = safe_spotify_call(sp.search, q=f'artist:"{artist}"', limit=50, type="track")
    items = results['tracks']['items']

    tracks = [build_track_info(track) for track in items]
    artist_cache[artist] = tracks

    return random.sample(tracks, 20)

def getArtistByGenre(genre):
    print ('getting artists by genre using :', genre)
    if genre in artist_genre_cache:
        return random.sample(artist_genre_cache[genre], 20)
    
    results = safe_spotify_call(sp.search, q=f'genre:"{genre}"', limit=50, type="artist")
    items = results['artists']['items']

    artists = [build_artist_info(artist) for artist in items]
    artist_genre_cache[genre] = artists
    return random.sample(artists, 20)

def get_lastfm_similar_tracks(artist, track, limit=5):
    if not artist or not track:
        print(f"Skipping due to missing artist or track: artist='{artist}', track='{track}'")
        return []
    
    cleaned_track = clean_track_name(track)
    
    params = {
        'method': 'track.getsimilar',
        'artist': artist,
        'track': cleaned_track,
        'limit': limit,
        'api_key': LASTFM_API_KEY,
        'format': 'json'
    }
    response = requests.get(LASTFM_API_ROOT, params=params)
    data = response.json()
    similar_tracks = data.get('similartracks', {}).get('track', [])
    
    similar_track_names = [track['name'] for track in similar_tracks]
    print('for track', cleaned_track, 'recommended tracks:', similar_track_names)
    
    return similar_tracks
    
def search_spotify_tracks(tracks):
    found = []
    for track in tracks:
        query = f"{track['name']} {track['artist']}"
        try:
            results = sp.search(q=query, type='track', limit=1)
            items = results.get('tracks', {}).get('items', [])
            if items:
                found.append(build_track_info(items[0]))
        except Exception as e:
            print(f"Search failed for {query}: {e}")
    return found

def get_combined_similar_tracks(track_list, max_total=20):
    seen_tracks = set()
    combined = []
    same_artist_recommendation_count = {}

    # Determine initial limit per track dynamically, capped and with fallback default
    if len(track_list) > 20:
        limit_per_track = 1
    elif len(track_list) > 10:
        limit_per_track = 2
    elif len(track_list) > 5:
        limit_per_track = 3
    elif len(track_list) > 2:
        limit_per_track = 10
    else:
        limit_per_track = 15  # More recommendations for very small lists

    import random
    randomized_tracks = track_list[:]
    random.shuffle(randomized_tracks)

    # To avoid infinite loops, track if we add any new tracks in each pass
    added_new_tracks = True

    while len(combined) < max_total and added_new_tracks:
        added_new_tracks = False

        for track_info in randomized_tracks:
            source_artist = track_info['artist']
            source_artist_lower = source_artist.lower()
            source_track = track_info['name']

            if source_artist_lower not in same_artist_recommendation_count:
                same_artist_recommendation_count[source_artist_lower] = 0

            try:
                similar_tracks = get_lastfm_similar_tracks(source_artist, source_track, limit=limit_per_track)
                for sim in similar_tracks:
                    sim_name = sim['name']
                    sim_artist = sim['artist']['name']
                    sim_artist_lower = sim_artist.lower()
                    track_key = (sim_name.lower(), sim_artist_lower)

                    if track_key in seen_tracks:
                        continue

                    # Limit same artist recommendations to 1 per source artist
                    if sim_artist_lower == source_artist_lower:
                        if same_artist_recommendation_count[source_artist_lower] >= 1:
                            continue
                        same_artist_recommendation_count[source_artist_lower] += 1

                    seen_tracks.add(track_key)
                    combined.append({'name': sim_name, 'artist': sim_artist})
                    added_new_tracks = True

                    if len(combined) >= max_total:
                        return combined

            except Exception as e:
                print(f"Error getting similar tracks for {source_track} by {source_artist}: {e}")

        # Optional: increase limit_per_track to try fetching more on the next pass
        # For example, add 1 more per iteration capped at some max (e.g., 20)
        if limit_per_track < 20:
            limit_per_track += 1

    return combined
    
def clean_track_name(name):
    return name.split('(')[0].strip()

def getSearchResults(query, search_filter=""):


    if search_filter == 'songs':
        results = safe_spotify_call(sp.search, q=query, type='track', limit=10)
        return results
    elif search_filter == 'artists':
        results = safe_spotify_call(sp.search, q=query, type='artist', limit=10)
        return results
    elif search_filter == 'albums':
        results = safe_spotify_call(sp.search, q=query, type='album', limit=10)
        return results
        
    results = safe_spotify_call (sp.search, q=query, type='artist,album,track', limit=3)
    artists = [build_artist_info(artist) for artist in results['artists']['items']]
    albums = [build_album_info(album) for album in results['albums']['items']]
    tracks = [build_track_info(track) for track in results['tracks']['items']]

    return {
        'artists': artists,
        'albums': albums,
        'tracks': tracks
    }


def build_artist_info(artist):
    return {
        'artist_id': artist['id'],
        'name': artist['name'],
        'image': artist['images'][0]['url'] if artist['images'] else None,
        'popularity': artist['popularity'],
        'genres': artist['genres']
    }

def build_track_info(track):
    return {
        'track_id': track['id'],
        'name': track['name'],
        'artist': ', '.join(artist['name'] for artist in track['artists']),
        'album_cover': track['album']['images'][0]['url'],
        'preview_url': track.get('preview_url'),
        'release_date': track['album']['release_date'],
        # 'track_genre': get_genre_by_song(track)
    }

def build_album_info(album):
    return {
        'album_id': album['id'],
        'name': album['name'],
        'artist': ', '.join(artist['name'] for artist in album['artists']),
        'album_cover': album['images'][0]['url'],
        'release_date': album['release_date'],
        'type': 'album'
    }

def get_genre_by_song(song):
    artist_id = song['artists'][0]['id']
    artist_info = sp.artist(artist_id)
    genres = artist_info.get('genres', [])
    if genres:
        return genres
    else:
        return []

def safe_spotify_call(func, *args, max_retries=2, max_retry_after=10, **kwargs):
    attempts = 0
    while attempts <= max_retries:
        try:
            return func(*args, **kwargs)
        except spotipy.exceptions.SpotifyException as e:
            if e.http_status == 429:
                retry_after = int(e.headers.get('Retry-After', 1))
                print(f"Rate limited. Retry in {retry_after}s")

                if retry_after > max_retry_after:
                    print(f"Retry-after too long ({retry_after}s). Aborting.")
                    return {"tracks": {"items": []}}  

                time.sleep(retry_after)
                attempts += 1
            else:
                raise
    print("Max retries exceeded.")
    return {"tracks": {"items": []}}  

def get_user_favorites(user_id):
    db = firestore.client()
    docs = db.collection('users').document(user_id).collection('favorites').stream()
    favorites = [doc.to_dict() for doc in docs]
    return favorites
