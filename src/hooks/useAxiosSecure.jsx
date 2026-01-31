import axios from 'axios';
import { useEffect } from 'react';
import useAuth from './useAuth';
import { API_BASE_URL } from '../config/api';

const axiosSecure = axios.create({
  baseURL: API_BASE_URL
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
        // Handle 403 Forbidden - Organization suspension
        if (error.response?.status === 403 && error.response?.data?.suspended) {
          // Use window.location instead of navigate since this hook can be called outside Router context
          window.location.href = '/organization-suspended';
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