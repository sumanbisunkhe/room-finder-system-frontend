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
    const response = await api.get('/users'); // The token is now automatically included
    return response.data;
  } catch (error) {
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
      throw new Error(`User with username ${username} not found`);
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
      throw new Error(`User with email ${email} not found`);
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

export default {
  registerUser,
  fetchUsers,
  fetchUserByUsername,
  fetchUserByEmail,
  deactivateUser,
  activateUser,
  deleteUser
};