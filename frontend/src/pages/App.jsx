import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import backgroundImage from '../assets/background.svg';

import Header from '../components/Header';
import DisplaySongs from '../components/DisplaySongs';
import DisplayArtists from '../components/DisplayArtists';
import useSongs from '../hooks/useSongs';
import useRecommendationAlgorithm from '../hooks/useRecommendationAlgorithm';

function App() {
  const [selectedGenre, setSelectedGenre] = useState("Rock");
  const [selectedDecade, setSelectedDecade] = useState("90's");
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const rock = useSongs("genre-songs", "rock");
  const pop = useSongs("genre-songs", "pop");
  const jazz = useSongs("genre-songs", "jazz");
  const rap = useSongs("genre-songs", "rap");
  const blues = useSongs("genre-songs", "blues");
  const folk = useSongs("genre-songs", "folk");
  const r_and_b = useSongs("genre-songs", "r&b");

  const nineties = useSongs("decade", 1990);
  const eighties = useSongs("decade", 1980);
  const seventies = useSongs("decade", 1970);
  const two_thousands = useSongs("decade", 2000);
  const twenty_tens = useSongs("decade", 2010);
  const twenty_twenties = useSongs("decade", 2020);

  const rock_artists = useSongs("artists-by-genre", "rock");
  const pop_artists = useSongs("artists-by-genre", "pop");
  const jazz_artists = useSongs("artists-by-genre", "jazz");
  const rap_artists = useSongs("artists-by-genre", "rap");
  const blues_artists = useSongs("artists-by-genre", "blues");
  const folk_artists = useSongs("artists-by-genre", "folk");
  const r_and_b_artists = useSongs("artists-by-genre", "r&b");


  const { tracks: recommendedTracks, loading: recommendedLoading, error: recommendedError } = useRecommendationAlgorithm(user?.uid);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return <p>Checking authentication...</p>;
  if (!user) return <p>Please log in to see your recommendations.</p>;



  const genreMap = {
    Rock: rock,
    Pop: pop,
    Jazz: jazz,
    Rap: rap,
    Blues: blues,
    Folk: folk,
    "R&B": r_and_b,
  };

  const decadeMap = {
    "70's": seventies,
    "80's": eighties,
    "90's": nineties,
    "2000's": two_thousands,
    "2010's": twenty_tens,
    "2020's": twenty_twenties,
  };

  const artistGenreMap = {
    Rock: rock_artists,
    Pop: pop_artists,
    Jazz: jazz_artists,
    Rap: rap_artists,
    Blues: blues_artists,
    Folk: folk_artists,
    "R&B": r_and_b_artists,
  };

  return (
    <>
      <img src={backgroundImage} className="background-image" />
      <Header onSearchStateChange={setHasSearchResults} />
      <div className={`content-container ${hasSearchResults ? 'search-active' : ''}`}>
        
        <h2 className="section-title">Just for you</h2>
        <hr></hr>
        <DisplaySongs
          title="Recommended for You"
          tracks={recommendedTracks}
          loading={recommendedLoading}
          error={recommendedError}
        />

        <h2 className="section-title">Explore more</h2>
        <hr></hr>
        <DisplaySongs
          title={selectedGenre}
          {...(genreMap[selectedGenre] || {})}
          dropdownOptions={["Rock", "Pop", "Rap", "Jazz", "Blues", "Folk", "R&B"].filter(
            (genre) => genre !== selectedGenre
          )}
          onOptionSelect={setSelectedGenre}
        />

        <DisplaySongs
          title={selectedDecade}
          {...(decadeMap[selectedDecade] || {})}
          dropdownOptions={["70's", "80's", "90's", "2000's", "2010's", "2020's"].filter(
            (decade) => decade !== selectedDecade
          )}
          onOptionSelect={setSelectedDecade}
        />

        <DisplayArtists
          title={selectedGenre}
          {...(artistGenreMap[selectedGenre] || {})}
          dropdownOptions={["Rock", "Pop", "Rap", "Jazz", "Blues", "Folk", "R&B"].filter(
            (genre) => genre !== selectedGenre
          )}
          onOptionSelect={setSelectedGenre}
        />
      </div>
    </>
  );
}

export default App;