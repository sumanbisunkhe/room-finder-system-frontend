// src\services\userService.js

import api from '../api/api';

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

// Fetch all users.
export const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
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

// Export users to CSV.
export const exportUsersToCSV = async () => {
  return exportCSV('/csv/export/users', 'users.csv');
};

// Import users from CSV.
export const importUsersFromCSV = async (file) => {
  return importCSV('/csv/import/users', file);
};

// Export rooms to CSV.
export const exportRoomsToCSV = async () => {
  return exportCSV('/csv/export/rooms', 'rooms.csv');
};

// Import rooms from CSV.
export const importRoomsFromCSV = async (file) => {
  return importCSV('/csv/import/rooms', file);
};

// Export messages to CSV.
export const exportMessagesToCSV = async () => {
  return exportCSV('/csv/export/messages', 'messages.csv');
};

// Import messages from CSV.
export const importMessagesFromCSV = async (file) => {
  return importCSV('/csv/import/messages', file);
};

// Export bookings to CSV.
export const exportBookingsToCSV = async () => {
  return exportCSV('/csv/export/bookings', 'bookings.csv');
};

// Import bookings from CSV.
export const importBookingsFromCSV = async (file) => {
  return importCSV('/csv/import/bookings', file);
};

/* ==================== Export All Methods ==================== */

export default {
  // User methods
  getCurrentUser,
  registerUser,
  fetchUsers,
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
  importMessagesFromCSV,
  // CSV methods for Bookings
  exportBookingsToCSV,
  importBookingsFromCSV,
};