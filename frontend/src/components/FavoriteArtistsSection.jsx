import FavoriteItem from './FavoriteItem';

function FavoriteArtistSection({ artists, onDelete, onAddClick }) {
  return (
    <>
      <div className="songs-container">
        <div className="favorites-heading">
        <h3>Favorite Artists</h3>
        <button className="add-favorite" onClick={onAddClick}>Add Artists</button>
      </div>
      <div className="favorite-songs-container">
      {artists.length === 0 ? (
        <p>No favorite songs yet.</p>
      ) : (
        artists.map((fav, i) => (
          <FavoriteItem 
            key={fav.id} 
            favorite={fav.data}  
            onDelete={() => onDelete(fav.id)}  
            type="artist"
          />
        ))
      )}
      </div>
      </div>
      </>
  );
}

export default FavoriteArtistSection;