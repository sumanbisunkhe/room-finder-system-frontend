// src/services/authService.js
import axios from 'axios';
import { decodeToken } from '../utils/jwtUtils';

export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      identifier,
      password,
    });

    const token = response.data?.jwt || response.data?.token || response.data?.accessToken;

    if (!token) {
      throw new Error('Authentication failed: No token received from server');
    }

    const tokenPayload = decodeToken(token);
    if (!tokenPayload) {
      throw new Error('Failed to decode token');
    }

    const role = tokenPayload.roles?.[0] || tokenPayload.role || tokenPayload.authorities?.[0]?.authority;

    if (!role) {
      throw new Error('Unable to determine user role from token payload');
    }

    return {
      token,
      role: role.replace('ROLE_', '').toUpperCase(),
    };
  } catch (error) {
    // Check for Axios-specific errors
    if (error.response) {
      const { status, data } = error.response;
      console.error(`Login failed (HTTP ${status}):`, data);
      throw new Error(data?.message || 'Login failed due to server error');
    }

    // Log generic errors
    console.error('Login failed:', error.message);
    throw new Error(error.message || 'An unexpected error occurred during login');
  }
};
