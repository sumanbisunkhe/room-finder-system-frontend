// src/services/authService.js
import api from '../api/api.js';

export const loginUser = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', {
      identifier,
      password,
    });
    return response.data; // JWT token
  } catch (error) {
    throw error.response ? error.response.data : new Error('Login failed');
  }
};
