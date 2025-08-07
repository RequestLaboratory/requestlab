// API Configuration
export const API_BASE_URL = 'http://localhost:3005';
// export const API_BASE_URL = 'https://interceptorworker.yadev64.workers.dev';

// Environment-specific configurations
export const CONFIG = {
  API_BASE_URL,
  // Add other configuration constants here as needed
  MAX_RETRIES: 3,
  TIMEOUT: 10000,
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  STATUS: '/status',
  EVENTS: '/events',
  INTERCEPTORS: '/api/interceptors',
  LOGS: (interceptorId: string) => `/api/interceptors/${interceptorId}/logs`,
} as const; 