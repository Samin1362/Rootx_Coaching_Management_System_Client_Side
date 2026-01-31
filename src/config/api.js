// API Configuration
// Uses environment variable if set, otherwise defaults based on hostname

const getApiBaseUrl = () => {
  // Check for environment variable first (for explicit configuration)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Auto-detect based on current hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // If running on localhost, use local backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // Production URL for deployed environments
  return 'https://rootx-coaching-management-server-si.vercel.app';
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
