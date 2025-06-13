// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { getUserRole } from "./utils/jwtUtils";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SeekerDashboard from "./pages/dashboards/SeekerDashboard";
import LandlordDashboard from "./pages/dashboards/LandlordDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import UserManagement from "./pages/dashboards/sections/UserManagement";
import UserAnalytics from "./pages/dashboards/sections/UserAnalytics";
import SystemSettings from "./pages/dashboards/sections/SystemSettings";
import CSVOperations from "./pages/dashboards/sections/CSVOperations";
import ProfileSection from "./pages/dashboards/sections/ProfileSection";
import PropertyManagement from "./pages/landlord/PropertyManagement";
import PropertyAnalytics from "./pages/landlord/PropertyAnalytics";
import ProfileInformation from "./pages/landlord/ProfileInformation";
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
            <Route path="property-management" element={<PropertyManagement />} />
            <Route path="property-analytics" element={<PropertyAnalytics />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="profile-information" element={<ProfileInformation />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="user-management" replace />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="user-analytics" element={<UserAnalytics />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="csv-operations" element={<CSVOperations />} />
            <Route path="profile-information" element={<ProfileSection />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </SnackbarProvider>
  );
};

export default App;