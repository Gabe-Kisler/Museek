import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.svg';
import backButton from '../assets/back-button.svg';
import DisplaySongs from '../components/DisplaySongs';
import Header from '../components/Header';
import '../css/song-detail.css';

import { useRecommendationAlgorithm } from './hooks/useRecommendationAlgorithm';


function SongDetail() {
  const location = useLocation();
  const track = location.state?.track;

  const [previewUrl, setPreviewUrl] = useState(null);
  const [moreSongs, setMoreSongs] = useState([]);
  const [loadingMoreSongs, setLoadingMoreSongs] = useState(false);
  const [errorMoreSongs, setErrorMoreSongs] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();

  const { tracks: recommendedTracks, loading: recommendedLoading, error: recommendedError } = useRecommendationAlgorithm(user?.uid);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return <p>Checking authentication...</p>;
  if (!user) return <p>Please log in to see your recommendations.</p>;


  useEffect(() => {
    if (!track?.name) return;

    const query = encodeURIComponent(`${track.name} ${track.artist}`);
    fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)
      .then(res => res.json())
      .then(data => {
        const result = data.results[0];
        if (result?.previewUrl) {
          setPreviewUrl(result.previewUrl);
        }
      })
      .catch(err => console.error("Error fetching preview:", err));
  }, [track]);

  useEffect(() => {
    if (!track?.artist) return;

    setLoadingMoreSongs(true);
    setErrorMoreSongs(null);

    fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'search-type': 'artist',
        'query': track.artist
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch more songs');
        return res.json();
      })
      .then(data => {
        // filter out the current track if needed
        const filtered = data.tracks.filter(t => t.name !== track.name);
        setMoreSongs(filtered);
        setLoadingMoreSongs(false);
      })
      .catch(err => {
        setErrorMoreSongs(err.message);
        setLoadingMoreSongs(false);
      });
  }, [track]);

  const handleClick = () => {
    navigate('/app');
  };

  return (
    <div className="page-body">
      <img src={backgroundImage} className="background-image" />
      <Header />
      <div className="song-detail-body">
        <img src={backButton} className="back-button" onClick={handleClick} />
        <div className="track-container">
          <img src={track.album_cover} className="track-cover" />
          <div className="track-content">
            <div className="track-info">
              <h2 className="track-name-test">{track.name}</h2>
              <h3>by {track.artist}</h3>
            </div>
            <div className="audio-controls">
              {previewUrl ? (
                <audio className="audio-player" controls src={previewUrl}></audio>
              ) : (
                <p>Preview not available</p>
              )}
            </div>
          </div>
        </div>


      </div>

    </div>
  );
}

export default SongDetail;