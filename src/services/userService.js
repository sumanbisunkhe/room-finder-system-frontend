// src\services\userService.js

import api from '../api/api';

// Register user
export const registerUser = async (registerData) => {
  try {
    const response = await api.post('/users/register', registerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

// Fetch users
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

    throw error.response ? error.response.data : new Error('Failed to fetch users');
  }
};


// Fetch user by username
export const fetchUserByUsername = async (username) => {
  try {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, message: `User with username ${username} not found` };
    }
    throw error.response ? error.response.data : new Error('Failed to fetch user by username');
  }
};

// Fetch user by email
export const fetchUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, message: `User with email ${email} not found` };
    }
    throw error.response ? error.response.data : new Error('Failed to fetch user by email');
  }
};

// Deactivate user
export const deactivateUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to deactivate user');
  }
};

// Activate user
export const activateUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to activate user');
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/delete`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete user');
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Logout failed');
  }
};
// Update user profile
export const updateUserProfile = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}/update`, updateData);
    return response.data;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          throw new Error('User not found');
        case 400:
          throw error.response.data;
        default:
          throw new Error('An error occurred while updating the profile');
      }
    }
    throw new Error('Failed to update user profile');
  }
};

export default {
  registerUser,
  fetchUsers,
  fetchUserByUsername,
  fetchUserByEmail,
  deactivateUser,
  activateUser,
  deleteUser,
  updateUserProfile
};