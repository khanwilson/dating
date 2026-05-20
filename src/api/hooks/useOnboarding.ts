import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService, SubmitOnboardingRequest } from 'api/services/onboardingService';
import ZustandPersist from 'zustand/persist';

export const ONBOARDING_KEYS = {
  me: ['onboarding', 'me'] as const,
};

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitOnboardingRequest) => onboardingService.submitOnboarding(data),
    onSuccess: () => {
      ZustandPersist.getState().setUserProfile({ completed: true } as any);
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Submit onboarding failed:', error);
    },
  });
};

