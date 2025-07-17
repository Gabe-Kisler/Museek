import '../css/tag-pickers.css'
import '../css/favorites.css'

function GenrePicker({ selectedGenres, genreOptions, onAddGenre, show, close }) {
  const handleAddGenre = (genre) => {
    onAddGenre(genre);
    if (close) close();
  };

  const availableGenres = genreOptions.filter(genre => 
    !selectedGenres.some(selected => selected.data?.name === genre)
  );

  if (!show) return null;

  return (
    <div className="tag-picker">
      <div className="tag-options">
        {availableGenres.length > 0 ? (
          availableGenres.map(genre => (
            <button
              key={genre}
              className="tag-option"
              onClick={() => handleAddGenre(genre)}
            >
              {genre}
            </button>
          ))
        ) : (
          <p className="no-genres">All genres selected!</p>
        )}
      </div>
    </div>
  );
}

export default GenrePicker;