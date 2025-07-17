import { useState } from 'react';
import app from '../services/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.svg';
import backgroundImage from '../assets/background.svg';

import '../css/index.css';
import '../css/login.css';

function CreateAccount({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userToken = await userCredential.user.getIdToken();

      // Send the ID token to your backend session login route
      const response = await fetch('http://localhost:5000/session_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken: userToken }),
      });

      const result = await response.json();

      if (response.ok) {
        onRegister(); // update parent state if needed
        navigate('/app'); // redirect after successful register/login
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <img src={backgroundImage} className="background-image" />
      <div className="login-container">
        <img className="login-logo" src={logo} alt="Logo" />
        <form className="login-form" onSubmit={handleRegister}>
          <h4 className="login-field-title">Email</h4>
          <input
            className="login-field"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <h4 className="login-field-title">Password</h4>
          <input
            className="login-field login-field-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button login-button-blue">Create Account</button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        <h4>
          Already have an account?{' '}
          <a
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Login here
          </a>
        </h4>
      </div>
    </>
  );
}

export default CreateAccount;