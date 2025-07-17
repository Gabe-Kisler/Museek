import { useEffect, useState } from 'react';
import { getCachedSongs, setCachedSongs } from '../cache/songCache';

function useSongs(searchType, query) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = getCachedSongs(searchType, query);

    if (cached) {
      setTracks(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('http://127.0.0.1:5000/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'search-type': searchType,
        query: query,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(data);
        setCachedSongs(searchType, query, data.tracks);
        setTracks(data.tracks);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchType, query]);  
  return { tracks, loading, error };
}

export default useSongs;