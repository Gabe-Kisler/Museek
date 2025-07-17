function FavoriteItem({ favorite, onDelete, type }) {

  let content;
  if (type == 'song') {
    content = (
      <>
        <img className="cover" src={favorite.album_cover} alt={`${favorite.name} cover`} />
        <span>
          <h5 className="favorite-info">{favorite.name} — by {favorite.artist}</h5>
        </span>
      </>
    );
  }

  else if (type == 'artist') {
    content = (
      <>
        <img className="cover" src={favorite.image} alt={`${favorite.name} cover`} />
        <span>
          <h5 className="favorite-info">{favorite.name}</h5>
        </span>
      </>
    );
  }


  return (
    <div className="favorite-item">
      {content}
      <span onClick={() => onDelete()} className="delete-btn">&times;</span>
    </div>
  );
}

export default FavoriteItem