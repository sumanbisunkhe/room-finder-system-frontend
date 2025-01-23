// src/pages/dashboards/LandlordDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandlordDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Landlord Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <nav>
        <Link to="/landlord/properties">My Properties</Link>
        <Link to="/landlord/add-property">Add Property</Link>
        <Link to="/landlord/applications">Applications</Link>
      </nav>
      <main>
        <h2>Welcome, Landlord!</h2>
        {/* Add more landlord-specific content */}
      </main>
    </div>
  );
};

export default LandlordDashboard;
