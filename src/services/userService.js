// src/services/userService.js
import api from '../api';

export const registerUser = async (registerData) => {
  try {
    const response = await api.post('/users/register', registerData);
    return response.data; // Registration success message
  } catch (error) {
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};
