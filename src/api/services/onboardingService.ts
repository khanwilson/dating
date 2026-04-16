import { MatchPreferences, UserProfile } from 'types/user';

export interface SubmitOnboardingRequest {
  userProfile: UserProfile;
  matchPreferences: MatchPreferences;
}

export interface SubmitOnboardingResponse {
  success: boolean;
  userId: string;
}

export interface GetMeResponse {
  userProfile: UserProfile;
  matchPreferences: MatchPreferences;
}

// Mock implementations — swap to real apiClient calls when backend is ready.
export const onboardingService = {
  submitOnboarding: (data: SubmitOnboardingRequest): Promise<SubmitOnboardingResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, userId: `user-${Date.now()}` });
      }, 500);
    });
  },

  getMe: (): Promise<GetMeResponse> => {
    // In mock mode, return from zustand — real impl would call apiClient.get('/me')
    return new Promise((resolve) => {
      setTimeout(() => {
        const ZustandPersist = require('zustand/persist').default;
        const state = ZustandPersist.getState();
        resolve({
          userProfile: state.userProfile!,
          matchPreferences: state.matchPreferences!,
        });
      }, 300);
    });
  },
};
