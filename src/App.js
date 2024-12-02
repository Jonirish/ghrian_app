import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
// eslint-disable-next-line
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ParentDashboard from './pages/ParentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';

const App = () => {
  const [userRole, setUserRole] = useState(null);

  // Function to handle login
  const handleLogin = (token) => {
    console.log('handleLogin called in App.js with token:', token); // Debug
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded); // Debug

    setUserRole(decoded.role); // Update userRole based on the decoded token
    console.log('User role set to:', decoded.role); // Debug
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserRole(null); // Reset userRole to null
  };

  // Check token on initial render to persist logged-in state
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log('Checking token on initial render:', token); // Debug

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token on initial render:', decoded); // Debug

        setUserRole(decoded.role);
      } catch (error) {
        console.error('Invalid token:', error); // Debug
        
        handleLogout(); // Log out if token is invalid
      }
    }
  }, []);

  return (
    <Router>
      {/* Pass userRole and handleLogout to Navbar */}
      <Navbar userRole={userRole} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={userRole ? <Home /> : <Navigate to="/login" />} />
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} // Pass handleLogin to Login.js
        />
        <Route
          path="/upload"
          element={(userRole === "STAFF" || userRole === "PRINCIPAL") ? <Upload /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={userRole === "ADMIN" ? <Admin /> : <Navigate to="/login" />}
        />
        <Route
          path="/parent-dashboard"
          element={userRole === "PARENT" ? <ParentDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/principal-dashboard"
          element={userRole === "PRINCIPAL" ? <PrincipalDashboard /> : <Navigate to="/login" />}
  />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
