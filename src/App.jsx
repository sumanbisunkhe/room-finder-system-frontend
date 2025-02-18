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
        >
          <Route index element={<Navigate to="properties" replace />} />
          <Route path="property-management" element={<LandlordDashboard />} />
          <Route path="add-property" element={<LandlordDashboard />} />
          <Route path="applications" element={<LandlordDashboard />} />
          <Route path="property-analytics" element={<LandlordDashboard />} />
          <Route path="system-settings" element={<LandlordDashboard />} />
          <Route path="profile-information" element={<LandlordDashboard />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }>
          {/* Default redirect for /dashboard/admin */}
          <Route index element={<Navigate to="user-management" replace />} />

          {/* Admin sub-routes */}
          <Route path="user-management">
            <Route index element={<AdminDashboard />} />
            <Route path="add" element={<AdminDashboard />} />
            <Route path="edit/:userId" element={<AdminDashboard />} />
          </Route>
          <Route path="user-analytics" element={<AdminDashboard />} />
          <Route path="system-settings" element={<AdminDashboard />} />
          <Route path="csv-operations" element={<AdminDashboard />} />
          <Route path="profile-information">
            <Route index element={<AdminDashboard />} />
            <Route path="edit" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;