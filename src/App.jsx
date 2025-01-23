// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getUserRole } from "./utils/jwtUtils";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SeekerDashboard from "./pages/dashboards/SeekerDashboard";
import LandlordDashboard from "./pages/dashboards/LandlordDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import "./App.css";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole(token);

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard/seeker"
          element={
            <ProtectedRoute requiredRole="SEEKER">
              <SeekerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/landlord"
          element={
            <ProtectedRoute requiredRole="LANDLORD">
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;