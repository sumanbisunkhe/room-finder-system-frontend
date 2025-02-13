// src/utils/jwtUtils.js
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
};

export const getUserRole = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload) return null;

    const role = payload.roles?.[0] || payload.role;
    return role ? role.replace('ROLE_', '').toUpperCase() : null;
  } catch (error) {
    console.error('Error extracting user role:', error);
    return null;
  }
};


export const getUsername = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload) return null;
    
    return payload.sub || payload.username || null;
  } catch (error) {
    console.error('Error extracting username:', error);
    return null;
  }
};
