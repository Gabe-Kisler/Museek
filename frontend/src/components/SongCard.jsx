import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";

import plusIcon from '../assets/plus-icon.svg'

import '../css/songs.css'
import '../css/text.css'


function SongCard({ track }) {

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleClick = () => {
    navigate(`/song/${track.track_id}`, { state: { track } });
  } 

const handleFavorite = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log("Not logged in");
    return;
  }

  try {
    const idToken = await user.getIdToken(); 
    const res = await fetch(`${API_URL}/store-favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`, 
      },
      body: JSON.stringify({
        type: 'song',
        data: {
          track_id: track.track_id,
          name: track.name,
          artist: track.artist,
          album_cover: track.album_cover,
        }
      }),
    });

    if (!res.ok) {
      throw new Error(`server error: ${res.status}`);
    }

    const data = await res.json();
    console.log('Favorite stored:', data);
  } catch (err) {
    console.error('Error storing favorite:', err.message);
  }
};
  return (
    <>
        <div className="song-container" onClick={handleClick}>
            <img 
              src={ plusIcon } 
              className="plus-icon" 
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite()}}>
            </img>
            <img src={ track.album_cover } className="song-cover"></img>
            <h5 className="song-name">{track.name}</h5>
            <h5 className="song-artist">by {track.artist}</h5>
        </div>
    </>
  );
}

export default SongCard;