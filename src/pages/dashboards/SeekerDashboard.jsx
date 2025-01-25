//src\pages\dashboards\SeekerDashboard.jsx

import React, { useState } from 'react';
import { Search, FileText, User, MapPin, LogOut } from 'lucide-react';

const SeekerDashboard = () => {
  const [activeSection, setActiveSection] = useState('search');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const sections = {
    search: {
      icon: <Search />,
      title: 'Property Discovery',
      description: 'Explore personalized room recommendations.',
      bg: 'bg-purple-50',
      text: 'text-purple-700'
    },
    applications: {
      icon: <FileText />,
      title: 'Booking Tracker',
      description: 'Monitor your room application statuses.',
      bg: 'bg-teal-50',
      text: 'text-teal-700'
    },
    profile: {
      icon: <User />,
      title: 'Personal Hub',
      description: 'Manage preferences and account details.',
      bg: 'bg-rose-50',
      text: 'text-rose-700'
    },
    saved: {
      icon: <MapPin />,
      title: 'Saved Locations',
      description: 'Review and organize your favorite properties.',
      bg: 'bg-orange-50',
      text: 'text-orange-700'
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex antialiased">
      <nav className="w-72 bg-white border-r shadow-lg p-6 space-y-2">
        <div className="flex items-center mb-10">
          <Search className="w-10 h-10 text-purple-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Room Seeker</h1>
        </div>
        {Object.entries(sections).map(([key, section]) => (
          <button 
            key={key}
            onClick={() => setActiveSection(key)}
            className={`w-full flex items-center p-3 rounded-lg transition transform hover:scale-105 ${
              activeSection === key 
                ? `${section.bg} ${section.text} ring-2 ring-offset-2 ring-purple-200` 
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

export default SeekerDashboard;