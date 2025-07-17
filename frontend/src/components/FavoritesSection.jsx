function FavoritesSection({ 
  title, 
  items, 
  onDelete, 
  field, 
  emptyMessage, 
  headerContent,
  children 
}) {
  return (
    <div className="preferences-container">
      <div className="favorites-heading">
        <h3>{title}</h3>
        {headerContent}
      </div>

      {children}

      {items.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <div className="favorite-genre">
          {items.map((item, i) => (
            <div key={i} className="preference-item">
              <h5>{item.data?.name || item}</h5><span onClick={() => onDelete(item.id)} className="delete-btn">&times;</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesSection;