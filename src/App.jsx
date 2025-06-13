// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getUserRole } from "./utils/jwtUtils";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SeekerDashboard from "./pages/dashboards/SeekerDashboard";
import LandlordDashboard from "./pages/dashboards/LandlordDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { isTokenValid } from "./services/authService";
import "./App.css";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token || !isTokenValid()) {
    // Redirect to login if no token or token is invalid
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case "SEEKER":
        return <Navigate to="/dashboard/seeker" replace />;
      case "LANDLORD":
        return <Navigate to="/landlord/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

const App = () => {
  return (
    <SnackbarProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Seeker Dashboard Routes */}
          <Route 
            path="/dashboard/seeker"
            element={
              <ProtectedRoute requiredRole="SEEKER">
                <SeekerDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="browse-property" replace />} />
            <Route path="browse-property" element={<SeekerDashboard />} />
            <Route path="bookings" element={<SeekerDashboard />} />
            <Route path="property-analytics" element={<SeekerDashboard />} />
            <Route path="system-settings" element={<SeekerDashboard />} />
            <Route path="profile-information" element={<SeekerDashboard />} />
          </Route>

          {/* Landlord Dashboard Routes */}
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute requiredRole="LANDLORD">
                <LandlordDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="property-management" replace />} />
            <Route path="property-management" element={<LandlordDashboard />} />
            <Route path="property-bookings" element={<LandlordDashboard />} />
            <Route path="add-property" element={<LandlordDashboard />} />
            <Route path="messages" element={<LandlordDashboard />} />
            <Route path="property-analytics" element={<LandlordDashboard />} />
            <Route path="system-settings" element={<LandlordDashboard />} />
            <Route path="profile-information" element={<LandlordDashboard />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route 
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </SnackbarProvider>
  );
};

export default App;