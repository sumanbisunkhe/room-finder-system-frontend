// src/services/authService.js
import axios from 'axios';
import { decodeToken } from '../utils/jwtUtils';

export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      identifier,
      password,
    }, {
      // Add headers for debugging
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log full response for debugging
    console.log('Full Backend Response:', response);
    console.log('Response Data:', response.data);

    // Check for JWT token in multiple possible locations
    const token = 
      response.data.jwt || 
      response.data.token || 
      response.data.accessToken;

    if (!token) {
      console.error('No token found in response', response.data);
      throw new Error('Authentication failed: No token received');
    }

    const tokenPayload = decodeToken(token);
    if (!tokenPayload) throw new Error('Failed to decode token');

    // More comprehensive role extraction
    const role = 
      tokenPayload.roles?.[0] || 
      tokenPayload.role || 
      tokenPayload.authorities?.[0]?.authority;

    if (!role) {
      console.error('No role found in token payload', tokenPayload);
      throw new Error('Unable to determine user role');
    }

    return {
      token,
      role: role.replace('ROLE_', '').toUpperCase(),
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Login Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    throw error;
  }
};