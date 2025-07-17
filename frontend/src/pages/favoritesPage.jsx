import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Header from '../components/Header';
import backgroundImage from '../assets/background.svg';
import FavoriteSongsSection from '../components/FavoriteSongsSection';
import FavoritesSection from '../components/FavoritesSection';
import { useFavorites } from '../hooks/useFavorites';
import GenrePicker from '../components/GenrePicker';
import TagPicker from '../components/TagPicker';
import FavoriteArtistSection from '../components/FavoriteArtistsSection';

import '../css/favorites.css';

function FavoritesPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [searchFilter, setSearchFilter] = useState(null);
  const searchRef = useRef(null);


  const handleAddSearchClick = (filterType = null) => {
    setSearchFilter(filterType);
    searchRef.current.focus();
  };

  const { 
    favorites, 
    loading: favoritesLoading, 
    addFavorite, 
    deleteFavorite, 
    getSongs,
    getGenres,
    getArtists,
    getAlbums,
    getTags
  } = useFavorites(user);

  const genreOptions = [
    'Rock', 'Jazz', 'Hip Hop', 'Pop', 'Classical',
    'Electronic', 'Indie', 'Soul', 'Funk', 'R&B', 'Alternative Rock', 'Folk', 'House', 'Country',
    'Ambient', 'Experimental', 'Latin', 'Gospel', 'Metal', 'Punk', 'Reggae'
  ];

  const tagOptions = [
    'Chill', 'Workout', 'Study', 'Relaxing', 'Energetic', 'Psychadelic', 'Upbeat', 'Party', 'Sad', 'Focus',
    'Happy', 'Euphoric', 'Driving', '90s', '80s', 'Fast', 'Slow', '2000s', 'New Releases', 'Underground', 'Indie',
    'Throwback', 'Guitar driven', 'Acoustic', 'Electronic', '2010s', 'Classic'
  ]

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToFavorites = async (type, data) => {
    await addFavorite(type, data);
  };

  const handleDeleteFromFavorites = async (favoriteId) => {
    await deleteFavorite(favoriteId);
  };

  const isLoading = authLoading || favoritesLoading;

  return (
    <div className="favorites-page">
      <img src={backgroundImage} className="background-image" />
      <Header ref={searchRef}/>
      <div className="header-test"></div>
      <main className="favorites-main">
      <div className="favorites-container">

        {isLoading ? (
          <p>Loading your favorites...</p>
        ) : !user ? (
          <p>Please log in to see your favorites.</p>
        ) : (
          <>
            <FavoriteSongsSection 
              favorites={getSongs()} 
              onDelete={handleDeleteFromFavorites}
              onAddClick={() => handleAddSearchClick('songs')}
              type="Songs"
            />

            <FavoritesSection
              title="Favorite Genres"
              items={getGenres()}
              onDelete={handleDeleteFromFavorites}
              emptyMessage="No genres selected yet."
              headerContent={(
                <button
                  className="add-favorite"
                  onClick={() => setShowGenrePicker(prev => !prev)}
                >
                  Add Genre
                </button>
              )}
            >
              <GenrePicker
                selectedGenres={getGenres()}
                genreOptions={genreOptions}
                onAddGenre={(genre) => handleAddToFavorites('genre', { name: genre })}
                show={showGenrePicker}
                close={() => setShowGenrePicker(false)} // optional
              />
            </FavoritesSection>

            <FavoriteArtistSection 
              artists={getArtists()} 
              onDelete={handleDeleteFromFavorites}
              onAddClick={() => handleAddSearchClick('artists')}
            />

            <FavoriteSongsSection
              favorites={getAlbums()} 
              onDelete={handleDeleteFromFavorites}
              onAddClick={() => handleAddSearchClick('albums')}
              type="Albums"
            />

            <FavoritesSection
              title="Your Tags"
              items={getTags()}
              onDelete={handleDeleteFromFavorites}
              emptyMessage="No vibe tags yet."
              headerContent={(
                <button
                  className="add-favorite"
                  onClick={() => setShowTagPicker(prev => !prev)}
                >
                  Add Tags
                </button>
              )}
            >
            <TagPicker
              selectedTags={getTags()}
              tagOptions={tagOptions}
              onAddTag={(tag) => handleAddToFavorites('tag', { name: tag })}
              show={showTagPicker}
              close={() => setShowTagPicker(false)} 
            />
            </FavoritesSection>
          </>
        )}
      </div>
      </main>
    </div>
  );
}

export default FavoritesPage;