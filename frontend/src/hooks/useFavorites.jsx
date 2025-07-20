import { useState, useEffect } from 'react';

export function useFavorites(user) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user) {
      fetchFavorites(user);
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchFavorites(currentUser) {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/get-favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}), 
      });
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  }

  const addFavorite = async (type, data) => {
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_URL}/store-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          type: type,
          data: data
        }),
      });
      
      if (res.ok) {
        fetchFavorites(user);
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  const deleteFavorite = async (favoriteId) => {
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_URL}/delete-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          id: favoriteId
        }),
      });

      console.log ('attempting to delete', favoriteId);
      
      if (res.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      }
    } catch (error) {
      console.error('Failed to delete favorite:', error);
    }
  };

  const getFavoritesByType = (type) => {
    return favorites.filter(fav => fav.type === type);
  };

  const getSongs = () => getFavoritesByType('song');
  const getGenres = () => getFavoritesByType('genre');
  const getArtists = () => getFavoritesByType('artist');
  const getAlbums = () => getFavoritesByType('album');
  const getTags = () => getFavoritesByType('tag');

  return { 
    favorites, 
    loading, 
    addFavorite, 
    deleteFavorite, 
    getFavoritesByType,
    getSongs,
    getGenres,
    getArtists,
    getAlbums,
    getTags
  };
}

