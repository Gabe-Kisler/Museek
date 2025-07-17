import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";

import plusIcon from '../assets/plus-icon.svg'

import '../css/songs.css'
import '../css/text.css'
import '../css/artists.css'

function ArtistCard({ track }) {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/song/${track.artist_id}`, { state: { track } });
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
    const res = await fetch('http://127.0.0.1:5000/store-favorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`, 
      },
      body: JSON.stringify({
        type: 'artist',
        data: {
          track_id: track.artist_id,
          name: track.name,
          genre: track.genre,
          image: track.image,
          popularity: track.popularity
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
        <div className="artist-container" onClick={handleClick}>
            <img 
              src={ plusIcon } 
              className="plus-icon-artist" 
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite()}}>
            </img>
            <img src={ track.image } className="artist-image"></img>
            <h5 className="artist-name">{track.name}</h5>        </div>
    </>
  );
}

export default ArtistCard;