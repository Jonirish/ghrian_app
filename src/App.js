import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Fixed import

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile"; // Ensure Profile is imported
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import PrincipalProfile from "./pages/PrincipalProfile";
import ParentProfile from "./pages/ParentProfile";
import StaffProfile from "./pages/StaffProfile";
import AdminProfile from "./pages/AdminProfile";
import ActionPage from "./pages/ActionPage";

const App = () => {
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUserRole(decoded.role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserRole(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch {
        handleLogout();
      }
    }
  }, []);

  return (
    <Router>
      <Navbar userRole={userRole} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={userRole ? <Home userRole={userRole} /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/upload"
          element={userRole === "STAFF" || userRole === "PRINCIPAL" ? <Upload /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={userRole === "ADMIN" ? <Admin /> : <Navigate to="/login" />}
        />
        <Route
          path="/principal-dashboard"
          element={userRole === "PRINCIPAL" ? <PrincipalDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/staff-dashboard"
          element={userRole === "STAFF" ? <StaffDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/action"
          element={
            userRole === "STAFF" || userRole === "PRINCIPAL" ? (
              <ActionPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            userRole === "PRINCIPAL" ? (
              <PrincipalProfile />
            ) : userRole === "STAFF" ? (
              <StaffProfile />
            ) : userRole === "ADMIN" ? (
              <AdminProfile />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
