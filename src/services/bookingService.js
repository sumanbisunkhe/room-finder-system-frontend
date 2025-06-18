// src/services/bookingService.js
import api from '../api/api';

/**
 * Enhanced error handler for booking-related operations
 */
const handleError = (error, context = 'booking operation') => {
  console.error('API Error Details:', {
    context,
    error: error.message,
    response: error.response?.data,
    status: error.response?.status
  });

  if (error.response?.status === 401) {
    return Promise.reject(new Error('Session expired. Please login again.'));
  }

  if (error.response?.status === 403) {
    return Promise.reject(new Error('You do not have permission to perform this action.'));
  }

  if (error.response && error.response.data) {
    let msg = `Failed to ${context}`;
    const errorData = error.response.data;

    if (typeof errorData === 'string') {
      msg += `: ${errorData}`;
    } else if (errorData.message) {
      msg += `: ${errorData.message}`;
    } else if (errorData.errors) {
      msg += `: ${Object.values(errorData.errors).join(', ')}`;
    }
    return Promise.reject(new Error(msg));
  }

  if (error.request) {
    // The request was made but no response was received
    return Promise.reject(new Error(`Network error while trying to ${context}. Please check your connection.`));
  }

  return Promise.reject(new Error(`Failed to ${context}: ${error.message}`));
};

/**
 * Helper function to build query parameters for pagination and sorting
 * @param {Object} params - Pagination and sorting parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sorting criteria (e.g., 'startDate,desc')
 * @returns {string} Query string
 */
const buildQueryString = (params = {}) => {
  const { page = 0, size = 10, sort } = params;
  let query = `?page=${page}&size=${size}`;
  if (sort) {
    query += `&sort=${sort}`;
  }
  return query;
};

/* ==================== Core Booking API Methods ==================== */

/**
 * Create a new booking
 * @param {Object} bookingRequest - The booking request data
 * @returns {Promise<Object>} The created booking
 */
export const createBooking = async (bookingRequest) => {
  try {
    const response = await api.post('/bookings', bookingRequest);
    return response.data;
  } catch (error) {
    return handleError(error, 'create booking');
  }
};

/**
 * Update an existing booking
 * @param {number} bookingId - The ID of the booking to update
 * @param {Object} bookingRequest - The updated booking data
 * @returns {Promise<Object>} The updated booking
 */
export const updateBooking = async (bookingId, bookingRequest) => {
  try {
    const response = await api.put(`/bookings/${bookingId}`, bookingRequest);
    return response.data;
  } catch (error) {
    return handleError(error, 'update booking');
  }
};

/**
 * Approve a booking (Landlord only)
 * @param {number} bookingId - The ID of the booking to approve
 * @returns {Promise<Object>} The approved booking
 */
export const approveBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/approve`);
    return response.data;
  } catch (error) {
    return handleError(error, 'approve booking');
  }
};

/**
 * Reject a booking (Landlord only)
 * @param {number} bookingId - The ID of the booking to reject
 * @returns {Promise<Object>} The rejected booking
 */
export const rejectBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/reject`);
    return response.data;
  } catch (error) {
    return handleError(error, 'reject booking');
  }
};

/**
 * Cancel a booking (Seeker only)
 * @param {number} bookingId - The ID of the booking to cancel
 * @returns {Promise<Object>} The cancelled booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    return handleError(error, 'cancel booking');
  }
};

/**
 * Delete a booking (Seeker only)
 * @param {number} bookingId - The ID of the booking to delete
 * @returns {Promise<void>} A promise that resolves when the booking is deleted
 */
export const deleteBooking = async (bookingId) => {
  try {
    await api.delete(`/bookings/${bookingId}`);
    return Promise.resolve();
  } catch (error) {
    return handleError(error, 'delete booking');
  }
};

/**
 * Get a booking by ID
 * @param {number} bookingId - The ID of the booking to retrieve
 * @returns {Promise<Object>} The booking details
 */
export const getBooking = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch booking');
  }
};

/**
 * Get all bookings for the current seeker
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsBySeeker = async (params = { page: 0, size: 10 }) => {
  try {
    const response = await api.get('/bookings/seeker/my-bookings', { params });
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch seeker bookings');
  }
};

/**
 * Get all bookings for a specific room
 * @param {number} roomId - The ID of the room
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsByRoom = async (roomId, params = { page: 0, size: 10 }) => {
  try {
    const response = await api.get(`/bookings/room/${roomId}`, { params });
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch room bookings');
  }
};

/**
 * Get pending bookings for a specific room
 * @param {number} roomId - The ID of the room
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} Paginated list of pending bookings
 */
export const getPendingBookingsByRoom = async (roomId, params = { page: 0, size: 10 }) => {
  try {
    const response = await api.get(`/bookings/room/${roomId}/pending`, { params });
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch pending room bookings');
  }
};

/**
 * Get all bookings for the current landlord
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsByLandlord = async (params = { page: 0, size: 10 }) => {
  try {
    const response = await api.get('/bookings/landlord/my-bookings', { params });
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch landlord bookings');
  }
};

/* ==================== Status Filter Methods ==================== */

/**
 * Get all bookings by status
 * @param {string} status - Booking status (PENDING|APPROVED|REJECTED|CANCELLED)
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sorting criteria (e.g., 'startDate,desc')
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsByStatus = async (status, params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await api.get(`/bookings/status/${status}${queryString}`);
    return response.data;
  } catch (error) {
    return handleError(error, `fetch ${status.toLowerCase()} bookings`);
  }
};

/**
 * Get seeker's bookings by status
 * @param {string} status - Booking status (PENDING|APPROVED|REJECTED|CANCELLED)
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sorting criteria (e.g., 'startDate,desc')
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsBySeekerAndStatus = async (status, params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await api.get(`/bookings/seeker/my-bookings/status/${status}${queryString}`);
    return response.data;
  } catch (error) {
    return handleError(error, `fetch seeker's ${status.toLowerCase()} bookings`);
  }
};

/**
 * Get room's bookings by status
 * @param {number} roomId - The ID of the room
 * @param {string} status - Booking status (PENDING|APPROVED|REJECTED|CANCELLED)
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sorting criteria (e.g., 'startDate,desc')
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsByRoomAndStatus = async (roomId, status, params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await api.get(`/bookings/room/${roomId}/status/${status}${queryString}`);
    return response.data;
  } catch (error) {
    return handleError(error, `fetch room's ${status.toLowerCase()} bookings`);
  }
};

/**
 * Get landlord's bookings by status
 * @param {string} status - Booking status (PENDING|APPROVED|REJECTED|CANCELLED)
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sorting criteria (e.g., 'startDate,desc')
 * @returns {Promise<Object>} Paginated list of bookings
 */
export const getBookingsByLandlordAndStatus = async (status, params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await api.get(`/bookings/landlord/my-bookings/status/${status}${queryString}`);
    return response.data;
  } catch (error) {
    return handleError(error, `fetch landlord's ${status.toLowerCase()} bookings`);
  }
};

/* ==================== CSV Methods ==================== */

const downloadCSVFile = (data, filename) => {
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

export const exportBookingsToCSV = async (landlordId) => {
  try {
    const response = await api.get('/csv/export/bookings', {
      responseType: 'blob',
      headers: { 'X-Landlord-Id': landlordId }
    });
    downloadCSVFile(response.data, 'bookings.csv');
    return { success: true, message: 'Bookings exported successfully' };
  } catch (error) {
    return handleError(error, 'export bookings');
  }
};

export const importBookingsFromCSV = async (file, landlordId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import/bookings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Landlord-Id': landlordId
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'import bookings');
  }
};

/* ==================== Default Export ==================== */

export default {
  createBooking,
  updateBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  deleteBooking,
  getBooking,
  getBookingsBySeeker,
  getBookingsByRoom,
  getPendingBookingsByRoom,
  getBookingsByLandlord,
  getBookingsByStatus,
  getBookingsBySeekerAndStatus,
  getBookingsByRoomAndStatus,
  getBookingsByLandlordAndStatus,
  exportBookingsToCSV,
  importBookingsFromCSV
};