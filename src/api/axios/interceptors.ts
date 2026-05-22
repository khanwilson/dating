import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import ZustandPersist from 'zustand/persist';
import { handleApiError } from './common';

export const requestInterceptorSuccess = (config: InternalAxiosRequestConfig) => {
  const token = ZustandPersist.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseInterceptorSuccess = (response: AxiosResponse) => {
  console.info('[API Response]: ', response);
  return response;
};

export const responseInterceptorError = (error: AxiosError) => {
  const apiError = handleApiError(error);
  console.info('[API Error]: ', apiError);

  if (apiError.statusCode === 401) {
    ZustandPersist.getState().logout();
    router.replace('/SignInScreen' as any);
  }

  return Promise.reject(apiError);
};
