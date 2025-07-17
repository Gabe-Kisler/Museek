import { useRef, useState, useEffect, forwardRef } from 'react';
import '../css/header.css';
import logo from '../assets/logo.svg';
import plusButton from '../assets/plus-icon.svg';
import '../css/search-results.css';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";


const Header = forwardRef (function Header(props, searchRef) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [user, setUser] = useState(null);

  const inputRef = searchRef || useRef();
  const overlayRef = useRef();
  const overlayInputRef = useRef();

  const { onSearchStateChange, searchFilter } = props;

  useEffect (() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
        setIsScrolled(currentScrollY > 50);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const { addFavorite } = useFavorites(user);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isSearchActive && overlayRef.current && !overlayRef.current.contains(event.target)) {
        closeSearchOverlay();
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape' && isSearchActive) {
        closeSearchOverlay();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchActive]);
  
  useEffect(() => {
    if (onSearchStateChange) {
      onSearchStateChange(isSearchActive);
    }
  }, [isSearchActive, onSearchStateChange]);

  const closeSearchOverlay = () => {
    setIsSearchActive(false);
    setSearchResults(null);
    setSearchQuery("");
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true);
    if (isHidden) {
      window.scrollBy({ top: -1, behavior: 'smooth' });
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      if (value.trim() === "") {
        setSearchResults(null);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/search-bar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: value, "filter": searchFilter })
        });

        const data = await res.json();
        console.log(data);
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed", err);
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    }, 100);

    setDebounceTimer(timer);
  };

  const handleSearchSubmit = async(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Search submitted:', searchQuery);
    }
  };

  const handleResultClick = (result, type) => {
    console.log('Result clicked:', result, type);
    closeSearchOverlay();
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className='header-wrapper'>
      <div className={`header-container ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'hidden' : ''} ${isSearchActive ? 'search-active' : ''}`}>
        <img src={logo} className="header-logo" onClick={() => navigate('/app')} />
        <input
          ref={inputRef}
          className="search-bar"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchInput}
          onKeyDown={handleSearchSubmit}
          onFocus={handleSearchFocus}
        />
        <h5 className="header-nav" onClick={() => navigate('/explore')}>Explore</h5>
        <h5 className="header-nav">Discover</h5>
        <h5 className="header-nav" onClick={() => navigate('/favorites')}>Favorites</h5>
        <h5 className="header-nav">Account</h5>
      </div>

      {isSearchActive && (
        <div className="search-overlay">
          <div className="search-overlay-content" ref={overlayRef}>
            <input
              ref={overlayInputRef}
              className="search-bar-overlay"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={handleSearchSubmit}
              autoFocus
            />
            <div className="search-overlay-results">
              {loading && <div className="search-loading">Searching...</div>}

              {!loading && (
                <>
                  {searchResults?.artists?.length > 0 && (
                    <div className="search-section">
                      {searchResults.artists.map((artist) => (
                        <div 
                          key={artist.artist_id} 
                          className="search-result"
                          onClick={() => handleResultClick(artist, 'artist')}
                        >
                          <img className="search-img" src={artist.image} alt={artist.name} />
                          <div className="search-result-info">
                            <h3 className="search-result-title">{artist.name}</h3>
                            <h5>Artist</h5>
                          </div>
                          <img src={plusButton} className="add-favorite-button" onClick={(e) => { e.stopPropagation; addFavorite('artist', artist)}}></img>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults?.tracks?.length > 0 && (
                    <div className="search-section">
                      {searchResults.tracks.map((track) => (
                        <div 
                          key={track.track_id} 
                          className="search-result"
                          onClick={() => handleResultClick(track, 'track')}
                        >
                          <img className="search-img" src={track.album_cover} alt={track.name} />
                          <div className="search-result-info">
                            <h3 className="search-result-title">{track.name} – {track.artist}</h3>
                            <h5>Song</h5>
                          </div>
                          <img src={plusButton} className="add-favorite-button" onClick={(e) => { e.stopPropagation; addFavorite('song', track)}}></img>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults?.albums?.length > 0 && (
                    <div className="search-section">
                      {searchResults.albums.map((album) => (
                        <div 
                          key={album.album_id} 
                          className="search-result"
                          onClick={() => handleResultClick(album, 'album')}
                        >
                          <img className="search-img" src={album.album_cover} alt={album.name} />
                          <div className="search-result-info">
                            <h3 className="search-result-title">{album.name} – {album.artist}</h3>
                            <h5>Album</h5>
                          </div>
                          <img src={plusButton} className="add-favorite-button" onClick={(e) => { e.stopPropagation; addFavorite('album', album)}}></img>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Header;