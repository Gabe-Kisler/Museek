import ArtistCard from './ArtistCard';
import arrow from '../assets/arrow.svg';

function DisplayArtists({ title, tracks, loading, error, dropdownOptions, onOptionSelect }) {
  if (loading) return <p>Loading {title} artists...</p>;
  if (error) return <p>Error loading {title}: {error}</p>;

  return (
    <div className="song-section">
      <div className="song-title">
        <h3>{title}</h3>

        {dropdownOptions && dropdownOptions.length > 0 && (
          <div className="dropdown-wrapper">
            <img className="arrow" src={arrow} alt="arrow" />
            <div className="horizontal-dropdown">
              {dropdownOptions.map((option, idx) => (
                <div
                  key={idx}
                  className="dropdown-option"
                  onClick={() => onOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="artist-scroll-container">
        {Array.isArray(tracks) && tracks.map((track) => (
          <ArtistCard key={track.artist_id} track={track} />
        ))}
      </div>
    </div>
  );
}

export default DisplayArtists;