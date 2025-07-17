import '../css/tag-pickers.css'
import '../css/favorites.css'

function TagPicker({ selectedTags, tagOptions, onAddTag, show, close }) {
  const handleAddTag = (tag) => {
    onAddTag(tag);
    if (close) close();
  };

  const availableTags = tagOptions.filter(tag => 
    !selectedTags.some(selected => selected.data?.name === tag)
  );

  if (!show) return null;

  return (
    <div className="tag-picker">
      <div className="tag-options">
        {availableTags.length > 0 ? (
          availableTags.map(tag => (
            <button
              key={tag}
              className="tag-option"
              onClick={() => handleAddTag(tag)}
            >
              {tag}
            </button>
          ))
        ) : (
          <p className="no-tags">All tags selected!</p>
        )}
      </div>
    </div>
  );
}

export default TagPicker;