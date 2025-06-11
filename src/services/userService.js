// src\services\userService.js

import api from '../api/api';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

/**
 * Enhanced error handler that parses the backend response.
 * If the backend returns an error with a "message" or "detail" property,
 * those values are used as the error message. Otherwise, a default message is used.
 * 
 * @param {Object} error - The error caught from an axios call.
 * @param {string} defaultMessage - Fallback error message.
 * @returns {Promise<never>} A rejected promise with an Error.
 */
const handleError = (error, defaultMessage) => {
  if (error.response && error.response.data) {
    let msg = defaultMessage;
    const errorData = error.response.data;
    if (typeof errorData === 'string') {
      msg = errorData;
    } else if (errorData.message) {
      msg = errorData.message;
    }
    // If a detail property exists (e.g., duplicate key violation details), use it.
    if (errorData.detail) {
      msg = errorData.detail;
    }
    return Promise.reject(new Error(msg));
  }
  return Promise.reject(new Error(defaultMessage));
};

/**
 * Helper function to download a CSV file from a Blob.
 * @param {Blob} data - The CSV file data.
 * @param {string} filename - The filename to be used when saving the file.
 */
const downloadCSVFile = (data, filename) => {
  const blob = new Blob([data], { type: 'application/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Generic function for exporting CSV files.
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} filename - The filename to use when downloading.
 * @returns {Promise<Object>} An object with a success flag and a message.
 */
const exportCSV = async (endpoint, filename) => {
  try {
    const response = await api.get(endpoint, { responseType: 'blob' });
    downloadCSVFile(response.data, filename);
    // return { success: true, message: `${filename} exported successfully.` };
  } catch (error) {
    return handleError(error, `Failed to export ${filename}`);
  }
};

/**
 * Generic function for importing CSV files.
 * @param {string} endpoint - The API endpoint to call.
 * @param {File} file - The CSV file to upload.
 * @returns {Promise<Object>} The response data from the API.
 */
const importCSV = async (endpoint, file) => {
  if (!file) throw new Error('No file provided.');
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Check for success flag in response
    if (!response.data.success) {
      throw new Error(response.data.message || 'Import failed');
    }

    return response.data;
  } catch (error) {
    console.log('Caught error in importCSV:', error);
    
    if (error.response?.status === 409) {
      throw new Error('Some users in the CSV already exist in the system');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to import users'
    );
  }
};

/* ==================== User API Methods ==================== */

// Register a new user.
export const registerUser = async (registerData) => {
  try {
    const response = await api.post('/users/register', registerData);
    return response.data;
  } catch (error) {
    return handleError(error, 'Registration failed');
  }
};

// Fetch all users with pagination
export const fetchUsers = async (params = {}) => {
  try {
    const { page = 0, size = 20, role, status } = params;
    let response;

    // Base query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    // Handle different filter combinations
    if (role && role !== 'all') {
      // Get users by role first
      switch (role) {
        case 'SEEKER':
          response = await fetchSeekers(page, size);
          break;
        case 'LANDLORD':
          response = await fetchLandlords(page, size);
          break;
        case 'ADMIN':
          response = await fetchAdmins(page, size);
          break;
        default:
          throw new Error('Invalid role specified');
      }
    } else if (status !== undefined && status !== 'all') {
      // If only status filter is active
      response = status === 'active' 
        ? await fetchActiveUsers(page, size)
        : await fetchInactiveUsers(page, size);
    } else {
      // No filters or all filters
      response = await api.get(`/users?${queryParams}`);
      response = response.data;
    }

    // Apply status filter to role-filtered results if needed
    if (role && role !== 'all' && status !== undefined && status !== 'all') {
      const filteredContent = response.content.filter(user => 
        status === 'active' ? user.active !== false : user.active === false
      );
      
      return {
        ...response,
        content: filteredContent,
        totalElements: filteredContent.length,
        totalPages: Math.ceil(filteredContent.length / size)
      };
    }

    return response;
  } catch (error) {
    console.error('Fetch Users Service Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return handleError(error, 'Failed to fetch users');
  }
};

// Fetch a user by username.
export const fetchUserByUsername = async (username) => {
  try {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, message: `User with username ${username} not found` };
    }
    return handleError(error, 'Failed to fetch user by username');
  }
};

// Fetch a user by email.
export const fetchUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, message: `User with email ${email} not found` };
    }
    return handleError(error, 'Failed to fetch user by email');
  }
};

// Deactivate a user.
export const deactivateUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to deactivate user');
  }
};

// Activate a user.
export const activateUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to activate user');
  }
};

// Delete a user.
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/delete`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to delete user');
  }
};

// Logout the current user.
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    return handleError(error, 'Logout failed');
  }
};

// Update user profile.
export const updateUserProfile = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}/update`, updateData);
    return response.data;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(new Error('User not found'));
        case 400:
          return Promise.reject(new Error(error.response.data.message || 'Bad Request'));
        default:
          return Promise.reject(new Error('An error occurred while updating the profile'));
      }
    }
    return Promise.reject(new Error('Failed to update user profile'));
  }
};

// Update user profile.
export const updateOwnProfile = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}/update`, updateData);
    return response.data;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(new Error('User not found'));
        case 400:
          return Promise.reject(new Error(error.response.data.message || 'Bad Request'));
        default:
          return Promise.reject(new Error('An error occurred while updating the profile'));
      }
    }
    return Promise.reject(new Error('Failed to update user profile'));
  }
};

// Get the current user after validating the session.
export const getCurrentUser = async () => {
  try {
    console.log('Validating session...');
    const validationResponse = await api.get('/auth/validate');
    console.log('Validation Response:', validationResponse.data);

    if (!validationResponse.data || validationResponse.data.message !== 'Valid token') {
      throw new Error('Invalid or expired session');
    }

    console.log('Fetching user details...');
    const userResponse = await api.get('/users/current');
    console.log('User Response:', userResponse.data);

    return userResponse.data;
  } catch (error) {
    console.error('Get Current User Error:', error);
    return Promise.reject(new Error(error.response?.data?.message || 'Failed to get current user'));
  }
};



/* ==================== Password Management ==================== */

/**
 * Change user's password after validating current password.
 * @param {number} userId - ID of the user
 * @param {string} currentPassword - User's current password for validation
 * @param {string} newPassword - New password to set
 * @returns {Promise<Object>} API response
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await api.put(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return handleError(error, 'Invalid password format or requirements');
        case 401:
          return handleError(error, 'Current password is incorrect');
        case 403:
          return handleError(error, 'Account is inactive');
        default:
          return handleError(error, 'Failed to change password');
      }
    }
    return handleError(error, 'Network error while changing password');
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch user by ID');
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    // Access the nested data from the backend response
    return { 
      success: true, 
      data: response.data.data // Adjusted to response.data.data
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'User not found' 
    };
  }
};
/* ==================== CSV Import/Export Methods ==================== */

/**
 * Helper function to handle CSV file download
 * @param {Blob} data - The CSV file data
 * @param {string} filename - The name to save the file as
 */
const downloadCSV = (data, filename) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Export users data to CSV
 * @returns {Promise<Blob>} CSV file data
 */
export const exportUsersToCSV = async () => {
  try {
    const response = await api.get('/csv/export/users', {
      responseType: 'blob'
    });
    downloadCSV(response.data, 'users.csv');
    return { success: true, message: 'Users exported successfully' };
  } catch (error) {
    if (error.response?.status === 500) {
      throw new Error('Server error while exporting users');
    }
    throw new Error(error.response?.data?.message || 'Failed to export users');
  }
};

/**
 * Import users from CSV file
 * @param {File} file - The CSV file to import
 * @returns {Promise<Object>} Response from the server
 */
export const importUsersFromCSV = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      throw new Error('Invalid file format. Please upload a CSV file');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      validateStatus: function (status) {
        return status < 500; // Only reject if status is 500 or greater
      }
    });

    // Check if the response indicates success
    if (response.data && response.data.success) {
      return { success: true, message: 'Users imported successfully' };
    }

    // Handle non-500 errors with specific messages
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || 'Failed to import users');
    }

    return { success: true, message: 'Users imported successfully' };
  } catch (error) {
    console.error('Import users error:', error.response || error);

    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 400:
          if (error.response.data && error.response.data.message) {
            throw new Error(`Invalid CSV format: ${error.response.data.message}`);
          }
          throw new Error('Invalid CSV format or data');
        case 409:
          throw new Error('Some users in the CSV already exist in the system');
        case 413:
          throw new Error('File size too large. Please upload a smaller file');
        case 415:
          throw new Error('Unsupported file type. Please upload a CSV file');
        case 500:
          const errorMessage = error.response.data?.message || error.response.data?.error;
          if (errorMessage && errorMessage.includes('duplicate')) {
            throw new Error('Duplicate entries found in CSV file');
          } else if (errorMessage && errorMessage.includes('format')) {
            throw new Error('Invalid CSV format or structure');
          } else {
            throw new Error('Server error while processing the CSV file. Please check the file format and try again');
          }
        default:
          throw new Error(error.response.data?.message || 'Failed to import users');
      }
    }

    // Handle network or other errors
    if (error.request) {
      throw new Error('Network error. Please check your connection and try again');
    }

    throw error;
  }
};

/**
 * Export rooms data to CSV
 * @returns {Promise<Blob>} CSV file data
 */
export const exportRoomsToCSV = async () => {
  try {
    const response = await api.get('/csv/export/rooms', {
      responseType: 'blob'
    });
    downloadCSV(response.data, 'rooms.csv');
    return { success: true, message: 'Rooms exported successfully' };
  } catch (error) {
    if (error.response?.status === 500) {
      throw new Error('Server error while exporting rooms');
    }
    throw new Error(error.response?.data?.message || 'Failed to export rooms');
  }
};

/**
 * Import rooms from CSV file
 * @param {File} file - The CSV file to import
 * @returns {Promise<Object>} Response from the server
 */
export const importRoomsFromCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return { success: true, message: 'Rooms imported successfully' };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 409:
          throw new Error('Some rooms in the CSV already exist in the system');
        case 400:
          throw new Error('Invalid CSV file format');
        case 500:
          throw new Error('Server error while importing rooms');
        default:
          throw new Error(error.response.data?.message || 'Failed to import rooms');
      }
    }
    throw new Error('Network error while importing rooms');
  }
};

/**
 * Export messages data to CSV
 * @returns {Promise<Blob>} CSV file data
 */
export const exportMessagesToCSV = async () => {
  try {
    const response = await api.get('/csv/export/messages', {
      responseType: 'blob'
    });
    downloadCSV(response.data, 'messages.csv');
    return { success: true, message: 'Messages exported successfully' };
  } catch (error) {
    if (error.response?.status === 500) {
      throw new Error('Server error while exporting messages');
    }
    throw new Error(error.response?.data?.message || 'Failed to export messages');
  }
};

/**
 * Import messages from CSV file
 * @param {File} file - The CSV file to import
 * @returns {Promise<Object>} Response from the server
 */
export const importMessagesToCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return { success: true, message: 'Messages imported successfully' };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 409:
          throw new Error('Some messages in the CSV already exist in the system');
        case 400:
          throw new Error('Invalid CSV file format');
        case 500:
          throw new Error('Server error while importing messages');
        default:
          throw new Error(error.response.data?.message || 'Failed to import messages');
      }
    }
    throw new Error('Network error while importing messages');
  }
};

/**
 * Export bookings data to CSV
 * @returns {Promise<Blob>} CSV file data
 */
export const exportBookingsToCSV = async () => {
  try {
    const response = await api.get('/csv/export/bookings', {
      responseType: 'blob'
    });
    downloadCSV(response.data, 'bookings.csv');
    return { success: true, message: 'Bookings exported successfully' };
  } catch (error) {
    if (error.response?.status === 500) {
      throw new Error('Server error while exporting bookings');
    }
    throw new Error(error.response?.data?.message || 'Failed to export bookings');
  }
};

/**
 * Import bookings from CSV file
 * @param {File} file - The CSV file to import
 * @returns {Promise<Object>} Response from the server
 */
export const importBookingsToCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import/bookings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return { success: true, message: 'Bookings imported successfully' };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 409:
          throw new Error('Some bookings in the CSV already exist in the system');
        case 400:
          throw new Error('Invalid CSV file format');
        case 500:
          throw new Error('Server error while importing bookings');
        default:
          throw new Error(error.response.data?.message || 'Failed to import bookings');
      }
    }
    throw new Error('Network error while importing bookings');
  }
};

// Search users by username or email with pagination
export const searchUsers = async (keyword, params = {}) => {
  try {
    const { page = 0, size = 20, role, status } = params;

    // First get all matching users for the search term
    const queryParams = new URLSearchParams({
      keyword,
      page: page.toString(),
      size: size.toString()
    });

    const response = await api.get(`/users/search?${queryParams}`);
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to search users');
    }

    let results = response.data.data;

    // Apply role filter if specified
    if (role && role !== 'all') {
      results = {
        ...results,
        content: results.content.filter(user => user.role === role)
      };
    }

    // Apply status filter if specified
    if (status !== undefined && status !== 'all') {
      results = {
        ...results,
        content: results.content.filter(user => 
          status === 'active' ? user.active !== false : user.active === false
        )
      };
    }

    // Update pagination info if filters were applied
    if ((role && role !== 'all') || (status !== undefined && status !== 'all')) {
      results = {
        ...results,
        totalElements: results.content.length,
        totalPages: Math.ceil(results.content.length / size)
      };
    }

    return results;
  } catch (error) {
    console.error('Search Users Service Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return handleError(error, 'Failed to search users');
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const response = await api.get('/users/stats');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user statistics');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
  }
};

// Get paginated seekers
export const fetchSeekers = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/users/seekers?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch seekers');
  }
};

// Get paginated landlords
export const fetchLandlords = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/users/landlords?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch landlords');
  }
};

// Get paginated admins
export const fetchAdmins = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/users/admins?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch admins');
  }
};

/**
 * Get user growth trends data
 * @param {string} interval - The interval for trends ('monthly' or 'daily')
 * @returns {Promise<Array>} Array of growth trend data
 * @example Response format:
 * {
 *   period: "2025-04" | "2025-04-03",
 *   userCount: number,
 *   periodLabel: "April 2025" | "03 Apr 2025"
 * }
 */
export const getGrowthTrends = async (interval = 'monthly') => {
  try {
    if (!['monthly', 'daily'].includes(interval)) {
      throw new Error('Invalid interval. Must be either "monthly" or "daily"');
    }

    const response = await api.get('/users/growth-trends', {
      params: { interval }
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Failed to fetch growth trends');
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error(`Invalid interval parameter: ${interval}`);
        case 500:
          throw new Error('Server error while fetching growth trends');
        default:
          throw new Error(error.response.data?.message || 'Failed to fetch growth trends');
      }
    }
    throw new Error('Network error while fetching growth trends');
  }
};

export const fetchActiveUsers = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/users/active?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching active users');
  }
};

export const fetchInactiveUsers = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/users/inactive?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching inactive users');
  }
};

/* ==================== Export All Methods ==================== */

export default {
  // User methods
  getCurrentUser,
  registerUser,
  fetchUsers,
  searchUsers,
  fetchUserById,
  getUserById,
  fetchUserByUsername,
  fetchUserByEmail,
  deactivateUser,
  activateUser,
  deleteUser,
  updateUserProfile,
  logout,
  changePassword,
  // CSV methods for Users
  exportUsersToCSV,
  importUsersFromCSV,
  // CSV methods for Rooms
  exportRoomsToCSV,
  importRoomsFromCSV,
  // CSV methods for Messages
  exportMessagesToCSV,
  importMessagesToCSV,
  // CSV methods for Bookings
  exportBookingsToCSV,
  importBookingsToCSV,
  getUserStatistics,
  fetchSeekers,
  fetchLandlords,
  fetchAdmins,
  getGrowthTrends,
  fetchActiveUsers,
  fetchInactiveUsers,
};