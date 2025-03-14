// src/services/roomService.js
import api from '../api/api';

/**
 * Enhanced error handler for room-related operations
 */
const handleError = (error, context = 'room operation') => {
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

/* ==================== Core Room API Methods ==================== */
export const createRoom = async (roomData, landlordId) => {
  try {
    const formData = new FormData();

    // Append basic fields
    formData.append('title', roomData.title);
    formData.append('description', roomData.description);
    formData.append('price', Number(roomData.price));
    formData.append('address', roomData.address);
    formData.append('city', roomData.city);
    formData.append('size', Number(roomData.size));
    formData.append('available', roomData.available);

    // Append amenities as individual fields
    Object.entries(roomData.amenities).forEach(([key, value]) => {
      formData.append(`amenities[${key}]`, value);
    });

    // Handle images
    roomData.images.forEach(image => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });

    const response = await api.post('/rooms', formData, {
      headers: {
        'X-Landlord-Id': landlordId,
        'Content-Type': 'multipart/form-data'

      }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'create room');
  }
};

export const updateRoom = async (roomId, updates, landlordId) => {
  try {
    const formData = new FormData();

    /// 1. Handle existing images
    const existingImages = updates.images.filter(img => typeof img === 'string');
    formData.append('existingImages', JSON.stringify(existingImages));

    // 2. Handle new images
    const newImages = updates.images
      .filter(img => typeof img !== 'string')
      .map(img => img.file);
    newImages.forEach(image => formData.append('images', image));

    // Append other fields
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'amenities') {
        Object.entries(value).forEach(([amenityKey, amenityValue]) => {
          formData.append(`amenities[${amenityKey}]`, amenityValue);
        });
      } else if (key !== 'images') { // Skip images since handled above
        formData.append(key, value);
      }
    });

    const response = await api.put(`/rooms/${roomId}`, formData, {
      headers: {
        'X-Landlord-Id': landlordId,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'update room');
  }
};

export const deleteRoom = async (roomId, landlordId) => {
  try {
    await api.delete(`/rooms/${roomId}`, {
      headers: { 'X-Landlord-Id': landlordId }
    });
    return { success: true, message: 'Room deleted successfully' };
  } catch (error) {
    return handleError(error, 'delete room');
  }
};

export const fetchAllRooms = async () => {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch all rooms');
  }
};

export const getRoomById = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch room');
  }
};

export const fetchRoomsByLandlord = async (landlordId) => {
  try {
    const response = await api.get(`/rooms/landlord/${landlordId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'fetch landlord rooms');
  }
};

export const searchRooms = async (filters) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get('/rooms/search', { params });
    return response.data;
  } catch (error) {
    return handleError(error, 'search rooms');
  }
};

export const toggleAvailability = async (roomId, landlordId) => {
  try {
    const response = await api.patch(`/rooms/${roomId}/availability`, null, {
      headers: { 'X-Landlord-Id': landlordId }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'toggle availability');
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

export const exportRoomsToCSV = async () => {
  try {
    const response = await api.get('/csv/export/rooms', { responseType: 'blob' });
    downloadCSVFile(response.data, 'rooms.csv');
    return { success: true, message: 'Rooms exported successfully' };
  } catch (error) {
    return handleError(error, 'export rooms');
  }
};

export const importRoomsFromCSV = async (file, landlordId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Landlord-Id': landlordId
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'import rooms');
  }
};
// Get the current user after validating the session.
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/current');
    // Ensure response.data contains the ApiResponse structure
    if (response.data.success && response.data.data) {
      return response.data.data; // User data is in response.data.data
    } else {
      throw new Error(response.data.message || 'User not found');
    }
  } catch (error) {
    console.error('Get Current User Error:', error);
    return Promise.reject(new Error(error.response?.data?.message || 'Failed to get current user'));
  }
};

/* ==================== Default Export ==================== */

export default {
  getCurrentUser,
  createRoom,
  updateRoom,
  deleteRoom,
  fetchAllRooms,
  getRoomById,
  fetchRoomsByLandlord,
  searchRooms,
  toggleAvailability,
  exportRoomsToCSV,
  importRoomsFromCSV
};