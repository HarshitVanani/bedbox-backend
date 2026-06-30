// frontend/src/utils/apiConfig.js

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') || 
                hostname.startsWith('10.') || 
                hostname.startsWith('172.');

export const API_BASE_URL = isLocal
  ? `http://${hostname}:5000`
  : 'https://bedbox-backend.onrender.com';
