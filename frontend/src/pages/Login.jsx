import { useState, useEffect } from 'react';
import app from '../services/firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background.svg'

import '../css/index.css';
import '../css/login.css';

function Login ({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate(); 

    const auth = getAuth(app);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const userToken = await userCred.user.getIdToken();

            const response = await fetch ('/session_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ idToken: userToken })
            })

            const result = await response.json();

            if (response.ok) {
                onLogin();
                navigate('/app');
            }
            else {
                console.error ('login failed', result.error);
            }
        }

        catch (error) {
            console.error ('firebase error', error.message);
        }
    }
return (
    <>
    <img src={ backgroundImage } className="background-image"/>
    <div className="login-container">
        <img className="login-logo" src={logo}></img>
        <form className="login-form" onSubmit={handleLogin}>
            <h4 className="login-field-title">Email:</h4>
            <input className="login-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <h4 className="login-field-title">Password:</h4>
            <input className="login-field login-field-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <button type="submit" className="login-button login-button-blue">Login</button>
        </form>
        <button type="button" className="login-button login-button-grey">Forgot password</button>
        <h4 className="login-field-title">Don't have an account?<a href="/register"> register now</a></h4>
        <h4 className="login-field-title">----------- or --------------</h4>
        <button type="button" className="login-button login-button-blue">Login with Google</button>
    </div>
    </>
)
}


export default Login;