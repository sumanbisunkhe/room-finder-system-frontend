// src/services/authService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear local storage
      localStorage.clear();
      // Redirect to login page
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', {
      identifier,
      password,
    });

    // Log full response for debugging
    console.log('Full Login Response:', response);

    // Check for token in multiple possible locations
    const token = 
      response.data?.jwt || 
      response.data?.token || 
      response.data?.accessToken ||
      response.headers['authorization']?.replace('Bearer ', '') ||
      response.data?.data?.token; // Check in nested data object

    if (!token) {
      throw new Error('No token found in response');
    }

    // Store the token in localStorage
    localStorage.setItem('token', token);

    // Decode token to extract role and expiration
    const decodedToken = jwtDecode(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      throw new Error('Token is expired');
    }

    // Try to extract role from multiple possible locations
    let role = null;
    if (response.data?.role) {
      role = response.data.role;
    } else if (response.data?.data?.role) {
      role = response.data.data.role;
    } else if (decodedToken.roles?.[0]) {
      role = decodedToken.roles[0];
    } else if (decodedToken.role) {
      role = decodedToken.role;
    } else if (decodedToken.authorities?.[0]?.authority) {
      role = decodedToken.authorities[0].authority;
    }

    // Clean up role format
    role = role?.replace('ROLE_', '').toUpperCase();

    if (!role) {
      throw new Error('Unable to determine user role');
    }

    // Store role in localStorage
    localStorage.setItem('userRole', role);

    return { token, role };

  } catch (error) {
    console.error('Login Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });

    // Clear any invalid tokens
    localStorage.clear();

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Login failed. Please try again.'
    );
  }
};

/**
 * Check if the current token is valid and not expired
 * @returns {boolean}
 */
export const isTokenValid = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token has expiration and is not expired
    if (decodedToken.exp) {
      return decodedToken.exp > currentTime;
    }

    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Get the remaining time in seconds before token expiration
 * @returns {number} Seconds until expiration, or 0 if token is invalid/expired
 */
export const getTokenExpirationTime = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 0;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp) {
      const timeRemaining = decodedToken.exp - currentTime;
      return timeRemaining > 0 ? timeRemaining : 0;
    }

    return 0;
  } catch (error) {
    console.error('Token expiration check error:', error);
    return 0;
  }
};

/**
 * Logout user and clear storage
 */
export const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};