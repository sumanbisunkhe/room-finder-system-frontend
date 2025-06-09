// src/services/messageService.js
import api from '../api/api';

/**
 * Enhanced error handler for message-related operations
 */
const handleError = (error, context = 'message operation') => {
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

/* ==================== Core Messaging API Methods ==================== */

export const sendMessage = async (receiverId, content, roomId = null) => {
  try {
    const response = await api.post('/messages', {
      receiverId,
      content,
      roomId
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    return handleError(error, 'send message');
  }
};

export const markAsRead = async (messageId) => {
  try {
    const response = await api.put(`/messages/${messageId}/read`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'mark message as read');
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error, 'delete message');
  }
};

export const getRoomMessages = async (roomId) => {
  try {
    const response = await api.get(`/messages/room/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    return handleError(error, 'fetch room messages');
  }
};

export const getConversation = async (otherUserId) => {
  try {
    const response = await api.get(`/messages/conversation/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    return handleError(error, 'fetch conversation');
  }
};

export const getUnreadMessages = async () => {
  try {
    const response = await api.get('/messages/unread', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  } catch (error) {
    return handleError(error, 'fetch unread messages');
  }
};

export const getDirectConversations = async () => {
  try {
    const response = await api.get('/messages/direct-conversations', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
  }
};


/* ==================== Default Export ==================== */

export default {
  sendMessage,
  markAsRead,
  deleteMessage,
  getRoomMessages,
  getConversation,
  getUnreadMessages,
  getDirectConversations

};