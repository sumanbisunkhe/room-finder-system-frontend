//src\pages\dashboards\LandlordDashboard.jsx

import React, { useState } from 'react';
import { Home, PlusCircle, Inbox, BarChart2, LogOut } from 'lucide-react';

const LandlordDashboard = () => {
  const [activeSection, setActiveSection] = useState('properties');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const sections = {
    properties: {
      icon: <Home />,
      title: 'Property Portfolio',
      description: 'Manage and showcase your available rooms.',
      bg: 'bg-green-50',
      text: 'text-green-700'
    },
    addProperty: {
      icon: <PlusCircle />,
      title: 'List New Space',
      description: 'Create attractive property listings.',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700'
    },
    applications: {
      icon: <Inbox />,
      title: 'Booking Requests',
      description: 'Review and respond to tenant applications.',
      bg: 'bg-blue-50',
      text: 'text-blue-700'
    },
    analytics: {
      icon: <BarChart2 />,
      title: 'Performance Insights',
      description: 'View occupancy rates and rental performance.',
      bg: 'bg-amber-50',
      text: 'text-amber-700'
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex antialiased">
      <nav className="w-72 bg-white border-r shadow-lg p-6 space-y-2">
        <div className="flex items-center mb-10">
          <Home className="w-10 h-10 text-green-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Landlord Hub</h1>
        </div>
        {Object.entries(sections).map(([key, section]) => (
          <button 
            key={key}
            onClick={() => setActiveSection(key)}
            className={`w-full flex items-center p-3 rounded-lg transition transform hover:scale-105 ${
              activeSection === key 
                ? `${section.bg} ${section.text} ring-2 ring-offset-2 ring-green-200` 
                : 'hover:bg-gray-100'
            }`}
          >
            {section.icon}
            <div className="ml-4">
              <div className="font-semibold">{section.title}</div>
              <div className="text-xs text-gray-500">{section.description}</div>
            </div>
          </button>
        ))}
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center p-3 mt-4 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut />
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </nav>
      <main className="flex-grow p-10 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {sections[activeSection].title}
          </h2>
          <p className="text-gray-600">{sections[activeSection].description}</p>
        </div>
      </main>
    </div>
  );
};

export default LandlordDashboard;