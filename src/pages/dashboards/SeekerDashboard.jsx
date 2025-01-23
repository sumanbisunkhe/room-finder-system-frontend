// src/pages/dashboards/SeekerDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SeekerDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Seeker Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <nav>
        <Link to="/seeker/properties">Find Properties</Link>
        <Link to="/seeker/applications">My Applications</Link>
        <Link to="/seeker/profile">Profile</Link>
      </nav>
      <main>
        <h2>Welcome, Property Seeker!</h2>
        {/* Add more seeker-specific content */}
      </main>
    </div>
  );
};

export default SeekerDashboard;