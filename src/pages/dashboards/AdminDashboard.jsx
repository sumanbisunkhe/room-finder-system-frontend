// src/pages/dashboards/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <nav>
        <button>User Management</button>
        <button>Property Approvals</button>
        <button>System Settings</button>
      </nav>
      <main>
        <h2>Welcome, Administrator!</h2>
        {/* Add more admin-specific content */}
      </main>
    </div>
  );
};

export default AdminDashboard;