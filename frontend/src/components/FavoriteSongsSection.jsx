import FavoriteItem from './FavoriteItem';

function FavoriteSongsSection({ favorites, onDelete, onAddClick, type }) {
  return (
    <>
      <div className="songs-container">
        <div className="favorites-heading">
        <h3>Favorite {type}</h3>
        <button className="add-favorite" onClick={onAddClick}>Add {type}</button>
      </div>
      <div className="favorite-songs-container">
      {favorites.length === 0 ? (
        <p>No favorite songs yet.</p>
      ) : (
        favorites.map((fav, i) => (
          <FavoriteItem 
            key={fav.id} 
            favorite={fav.data}  
            onDelete={() => onDelete(fav.id)}  
            type="song"
          />
        ))
      )}
      </div>
      </div>
      </>
  );
}

export default FavoriteSongsSection;