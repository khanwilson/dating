import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService, SubmitOnboardingRequest } from 'api/services/onboardingService';

export const ONBOARDING_KEYS = {
  me: ['onboarding', 'me'] as const,
};

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitOnboardingRequest) => onboardingService.submitOnboarding(data),
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Submit onboarding failed:', error);
    },
  });
};

