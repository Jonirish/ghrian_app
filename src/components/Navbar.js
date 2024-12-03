import React from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = ({ userRole, onLogout }) => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {userRole && <li><Link to="/profile">Profile</Link></li>}
        {(userRole === "STAFF" || userRole === "PRINCIPAL") && (
          <li><Link to="/upload">Upload</Link></li>
        )}
        {userRole === "PRINCIPAL" && (
          <li><Link to="/principal-dashboard">Principal Dashboard</Link></li>
        )}
        {userRole === "STAFF" && (
          <li><Link to="/staff-dashboard">Staff Dashboard</Link></li>
        )}
        {userRole ? (
          <li onClick={onLogout}>Logout</li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;