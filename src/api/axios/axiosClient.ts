import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { baseUrl } from './config';

// Create axios instance with default config
const axiosClient = axios.create({
  baseURL: baseUrl.value,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from zustand store if needed
    // const token = ZustandPersist.getState()?.token;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          // Handle unauthorized - clear token, redirect to login
          // ZustandPersist.getState().logout();
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
      }
    }
    return Promise.reject(error);
  }
);


export default axiosClient;
