import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, Cog, LogOut, Bell, Search, 
  Menu, HelpCircle, Globe, Filter, UserCheck, UserX, Trash2, 
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import './AdminDashboard.css';

const API_BASE_URL = 'http://localhost:8080/api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Authentication and token management
  const token = localStorage.getItem('token');
  const config = {
    headers: { 'Authorization': `Bearer ${token}` }
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
      showNotification('Error fetching users', 'error');
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error('Error response:', err.response.data);
        console.error('Status code:', err.response.status);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', err.message);
      }
    }
  };
  // Search and filter users
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userFilter !== 'all') {
      result = result.filter(user => user.role === userFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, userFilter, users]);

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // User actions
  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'deactivate':
          await axios.put(`${API_BASE_URL}/users/${userId}/deactivate`, {}, config);
          showNotification('User deactivated successfully');
          break;
        case 'activate':
          await axios.put(`${API_BASE_URL}/users/${userId}/activate`, {}, config);
          showNotification('User activated successfully');
          break;
        case 'delete':
          await axios.delete(`${API_BASE_URL}/users/${userId}/delete`, config);
          showNotification('User deleted successfully');
          break;
      }
      fetchUsers(); // Refresh user list
    } catch (err) {
      showNotification('Failed to perform user action', 'error');
      console.error('User action failed:', err);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Sections configuration
  const sections = {
    users: {
      icon: <Users />,
      title: 'User Management',
      description: 'Comprehensive user account controls and role assignments.',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700'
    },
    approvals: {
      icon: <ShieldCheck />,
      title: 'Content Moderation',
      description: 'Review and validate property listings and user submissions.',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700'
    },
    settings: {
      icon: <Cog />,
      title: 'System Configuration',
      description: 'Advanced platform settings and global parameters.',
      bg: 'bg-sky-50',
      text: 'text-sky-700'
    }
  };

  // Render user management section
  const renderUserManagement = () => {
    if (loading) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="user-management">
        <div className="user-filters">
          <div className="search-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users by username or email" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="user-role-filter"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="seeker">Seekers</option>
            <option value="landlord">Landlords</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <div className="user-actions">
                    {user.status === 'active' ? (
                      <button 
                        onClick={() => handleUserAction(user.id, 'deactivate')}
                        className="action-btn deactivate"
                        title="Deactivate User"
                      >
                        <UserX />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUserAction(user.id, 'activate')}
                        className="action-btn activate"
                        title="Activate User"
                      >
                        <UserCheck />
                      </button>
                    )}
                    <button 
                      onClick={() => handleUserAction(user.id, 'delete')}
                      className="action-btn delete"
                      title="Delete User"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Notification component
  const Notification = ({ message, type }) => {
    const icons = {
      success: <CheckCircle className="notification-icon text-green-500" />,
      error: <XCircle className="notification-icon text-red-500" />,
      warning: <AlertCircle className="notification-icon text-yellow-500" />
    };

    return (
      <div className={`notification ${type}-notification`}>
        {icons[type]}
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}
      
      <nav className="top-navbar">
        <div className="navbar-left">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="sidebar-toggle"
          >
            <Menu />
          </button>
          <div className="logo-container">
            <ShieldCheck className="logo-icon" />
            <span className="logo-text">RoomFinder Admin</span>
          </div>
        </div>
        <div className="navbar-right">
          <div className="profile-section">
            <img 
              src="/api/placeholder/40/40" 
              alt="Admin Profile" 
              className="profile-image" 
            />
            <span className="profile-name">Admin User</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-button"
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {isSidebarOpen && (
          <nav className="sidebar">
            {Object.entries(sections).map(([key, section]) => (
              <button 
                key={key}
                onClick={() => setActiveSection(key)}
                className={`sidebar-item ${
                  activeSection === key 
                    ? `${section.bg} ${section.text} active` 
                    : ''
                }`}
              >
                {section.icon}
                <div className="sidebar-item-text">
                  <div className="sidebar-item-title">{section.title}</div>
                  <div className="sidebar-item-description">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        )}

        <main className={`main-content ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <div className="content-header">
            <h2>{sections[activeSection].title}</h2>
            <p>{sections[activeSection].description}</p>
          </div>
          <div className="content-area">
            {activeSection === 'users' && renderUserManagement()}
            {/* Future sections can be added here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;