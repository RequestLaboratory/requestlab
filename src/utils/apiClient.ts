import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for CORS
  withCredentials: false,
});

// Request interceptor to add common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add ngrok-skip-browser-warning header to bypass ngrok browser warning
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    // For local server with global access, no authentication is needed
    // But we can still add session if available for future use
    const sessionId = localStorage.getItem('sessionId');
    const noLoginRequired = localStorage.getItem('noLoginRequired') === 'true';
    
    if (!noLoginRequired && sessionId) {
      config.headers['Authorization'] = `Bearer ${sessionId}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect to login
      localStorage.removeItem('sessionId');
      window.location.href = '/';
    }
    
    // Log CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('CORS Error:', error);
      console.error('Request URL:', error.config?.url);
      console.error('Request headers:', error.config?.headers);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
