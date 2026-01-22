import axios from 'axios';
import { useEffect } from 'react';
import useAuth from './useAuth';

const axiosSecure = axios.create({
  baseURL: "http://localhost:3001"
})

const useAxiosSecure = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Request interceptor to add authentication headers
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        // Add user email header for authentication
        if (user?.email) {
          config.headers['x-user-email'] = user.email;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          console.error('Unauthorized access - please login again');
          // Could redirect to login here
        }
        // Handle 403 Forbidden (e.g., insufficient permissions)
        if (error.response?.status === 403) {
          console.error('Access forbidden:', error.response?.data?.message);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [user?.email]);

  return axiosSecure;
};

export default useAxiosSecure;