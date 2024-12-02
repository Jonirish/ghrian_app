import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';
// eslint-disable-next-line
import qs from 'qs';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLogin }) => { // Accept onLogin as a prop from App.js
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login...'); // Debug
      const response = await axios.post('http://localhost:8000/auth/login', `username=${email}&password=${password}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Save the token in localStorage
      const token = response.data.access_token;
      console.log('Login successful. Token received:', token); // Debug

      localStorage.setItem('token', token);

      // Decode the token to get user role
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded);

      // Update the user role in App.js
      onLogin(token);
      console.log('onLogin called with token'); // Debug

      // Redirect to the home page
      navigate('/');
    } catch (error) {
      setErrorMessage('Invalid email or password. Please try again.');
      console.error('Login failed:', error); // Debug
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;


