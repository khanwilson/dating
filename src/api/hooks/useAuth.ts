import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  PhoneOtpConfirmRequest,
  PhoneOtpRequest,
} from 'api/services/authService';
import { userService } from 'api/services/userService';
import { getOnboardingRoute } from 'components/onboarding/useOnboardingStep';
import { router } from 'expo-router';
import ZustandPersist from 'zustand/persist';

export const AUTH_KEYS = {
  user: ['user'] as const,
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: PhoneOtpRequest) => authService.register(data),
    onSuccess: async (response) => {
      const tokens = (response as any)?.data ?? response;
      ZustandPersist.getState().setTokens(tokens.accessToken, tokens.refreshToken);
    },
    onError: (error) => {
      console.error('Register failed:', error);
    },
  });
};

export const useRequestPhoneOtp = () => {
  return useMutation({
    mutationFn: (data: PhoneOtpRequest) => authService.requestPhoneOtp(data),
    onError: (error) => {
      console.error('OTP request failed:', error);
    },
  });
};

export const useConfirmPhoneOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PhoneOtpConfirmRequest) => authService.confirmPhoneOtp(data),
    onSuccess: async (response) => {
      // API wraps response as { data: AuthResponse }
      const tokens = (response as any)?.data ?? response;
      ZustandPersist.getState().setTokens(tokens.accessToken, tokens.refreshToken);

      const rawProfile = await userService.getProfile();
      // API wraps response as { data: User }
      const profile = (rawProfile as any)?.data ?? rawProfile;
      ZustandPersist.getState().setUser(profile);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });

      if (profile?.relationshipType) {
        router.replace('/(tabs)/SwipeScreen' as any);
      } else {
        ZustandPersist.getState().setOnboardingStep(3);
        router.replace(getOnboardingRoute(3) as any);
      }
    },
    onError: (error) => {
      console.error('OTP confirm failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      ZustandPersist.getState().clearProfile();
      ZustandPersist.getState().logout();
      queryClient.clear();
      router.replace('/SignInScreen' as any);
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      ZustandPersist.getState().clearProfile();
      ZustandPersist.getState().logout();
      queryClient.clear();
      router.replace('/SignInScreen' as any);
    },
  });
};
