import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";

function useRecommendationAlgorithm(musicType) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError("User not logged in");
          setLoading(false);
          return;
        }
        
        const idToken = await user.getIdToken();

        const res = await fetch('/get-recommended', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ type: musicType, song: songName }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch recommendations');
        }

        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [musicType]);

  return { tracks, loading, error };
}

export default useRecommendationAlgorithm