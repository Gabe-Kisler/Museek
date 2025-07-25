import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.svg';
import backButton from '../assets/back-button.svg';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Header';
import '../css/song-detail.css';

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

  // Move all useEffect hooks to the top, before any conditional returns
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!track?.name || !track?.artist) return;

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
  }, [track?.name, track?.artist]); // Add proper dependencies

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
        // Filter out the current track if needed
        const filtered = data.tracks?.filter(t => t.name !== track.name) || [];
        setMoreSongs(filtered);
        setLoadingMoreSongs(false);
      })
      .catch(err => {
        setErrorMoreSongs(err.message);
        setLoadingMoreSongs(false);
      });
  }, [track?.artist, track?.name]); // Add proper dependencies

  const handleClick = () => {
    navigate('/app');
  };

  // Now handle conditional returns after all hooks
  if (authLoading) return <p>Checking authentication...</p>;
  if (!user) return <p>Please log in to see your recommendations.</p>;

  if (!track) {
    return (
      <div className="page-body">
        <img src={backgroundImage} className="background-image" />
        <Header />
        <div className="song-detail-body">
          <p>No track data available. Please go back and select a song.</p>
          <button onClick={() => navigate('/app')}>Go Back</button>
        </div>
      </div>
    );
  }

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