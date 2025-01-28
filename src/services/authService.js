// src/services/authService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      identifier,
      password,
    }, {
      withCredentials: true, // Ensure cookies are sent and received
    });

    // Log full response for debugging
    console.log('Full Login Response:', response);

    // Check for token in multiple possible locations
    const token = 
      response.data?.jwt || 
      response.data?.token || 
      response.data?.accessToken ||
      response.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token found in response');
    }

    // Store the token in localStorage
    localStorage.setItem('token', token);

    // Decode token to extract role
    const decodedToken = jwtDecode(token);
    const role = (
      decodedToken.roles?.[0] || 
      decodedToken.role || 
      decodedToken.authorities?.[0]?.authority
    )?.replace('ROLE_', '').toUpperCase();

    if (!role) {
      throw new Error('Unable to determine user role');
    }

    return { token, role };

  } catch (error) {
    console.error('Login Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Login failed. Please try again.'
    );
  }
};