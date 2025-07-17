import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from '../pages/Login';
import CreateAccount from '../pages/CreateAccount';
import App from '../pages/App';
import SongDetail from '../pages/songDetail';
import FavoritesPage from '../pages/favoritesPage';
import ExplorePage from '../pages/App';


function Root() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('loggedIn') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn);
  }, [loggedIn]);

  return (
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
        <Route path="/register" element={<CreateAccount onRegister={() => setLoggedIn(true)} />} />
        <Route path="/app" element={loggedIn ? <App /> : <Login onLogin={() => setLoggedIn(true)} />} />
        <Route path="*" element={<Login onLogin={() => setLoggedIn(true)} />} />
        <Route path="/song/:id" element={<SongDetail />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
  );
}

export default Root;