// src/services/bookingService.js
import api from '../api/api';

/**
 * Enhanced error handler for booking-related operations
 */
const handleError = (error, context = 'booking operation') => {
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
  return Promise.reject(new Error(`Failed to ${context}`));
};

/* ==================== Core Booking API Methods ==================== */
export const createBooking = async (bookingRequest) => {
  try {
    const response = await api.post('/bookings', bookingRequest);
    return response.data;
  } catch (error) {
    return handleError(error, 'create booking');
  }
};

export const updateBooking = async (bookingId, bookingRequest) => {
  try {
    const response = await api.put(`/bookings/${bookingId}`, bookingRequest);
    return response.data;
  } catch (error) {
    return handleError(error, 'update booking');
  }
};

// Remove header-based ID passing (backend uses authentication)
export const approveBooking = async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/approve`);
      return response.data;
    } catch (error) {
      return handleError(error, 'approve booking');
    }
  };
  
  export const rejectBooking = async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/reject`);
      return response.data;
    } catch (error) {
      return handleError(error, 'reject booking');
    }
  };
  
  export const cancelBooking = async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      return handleError(error, 'cancel booking');
    }
  };

export const getBooking = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch booking');
  }
};

export const getBookingsBySeeker = async (seekerId) => {
  try {
    const response = await api.get(`/bookings/seeker/${seekerId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch seeker bookings');
  }
};

export const getBookingsByRoom = async (roomId) => {
  try {
    const response = await api.get(`/bookings/room/${roomId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch room bookings');
  }
};

export const getPendingBookingsByRoom = async (roomId) => {
  try {
    const response = await api.get(`/bookings/room/${roomId}/pending`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch pending room bookings');
  }
};

export const getBookingsByLandlord = async () => {
  try {
    const response = await api.get('/bookings/landlord/my-bookings');
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch landlord bookings');
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
  getBooking,
  getBookingsBySeeker,
  getBookingsByRoom,
  getPendingBookingsByRoom,
  getBookingsByLandlord,
  exportBookingsToCSV,
  importBookingsFromCSV
};