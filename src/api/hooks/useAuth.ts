import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  RegisterRequest,
  RequestOtpRequest,
  VerifyOtpRequest,
} from 'api/services/authService';
import { userService } from 'api/services/userService';
import ZustandPersist from 'zustand/persist';

export const AUTH_KEYS = {
  user: ['user'] as const,
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: async (response) => {
      ZustandPersist.getState().setTokens(response.accessToken, response.refreshToken);
      // Token is now in store — interceptor will attach it automatically
      const user = await userService.getProfile();
      ZustandPersist.getState().setUser(user);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
    onError: (error) => {
      console.error('Register failed:', error);
    },
  });
};

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: (data: RequestOtpRequest) => authService.requestOtp(data),
    onError: (error) => {
      console.error('OTP request failed:', error);
    },
  });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: async (response) => {
      ZustandPersist.getState().setTokens(response.accessToken, response.refreshToken);
      const user = await userService.getProfile();
      ZustandPersist.getState().setUser(user);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
    onError: (error) => {
      console.error('OTP verification failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      ZustandPersist.getState().logout();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      ZustandPersist.getState().logout();
      queryClient.clear();
    },
  });
};
