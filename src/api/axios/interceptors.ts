import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import ZustandPersist from 'zustand/persist';
import { handleApiError } from './common';

export interface TokenManager {
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const setupRequestInterceptor = () => {
  return async (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = await ZustandPersist.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };
};

export const setupResponseInterceptor = () => {
  return async (error: AxiosError) => {
    const apiError = handleApiError(error);

    // Handle 401 - Unauthorized (token expired)
    if (apiError.statusCode === 401) {
      // Clear token
      ZustandPersist.getState().logout();
      // You can add navigation logic here if needed
    }

    // Handle 403 - Forbidden
    if (apiError.statusCode === 403) {
      // Handle forbidden access
    }

    return Promise.reject(apiError);
  };
};
