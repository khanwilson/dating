import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';
import { MatchPreferences, UserProfile } from 'types/user';

export interface SubmitOnboardingRequest {
  userProfile: UserProfile;
  matchPreferences: MatchPreferences;
}

export const onboardingService = {
  submitOnboarding: ({ userProfile, matchPreferences }: SubmitOnboardingRequest): Promise<void> => {
    return apiClient.patch(ENDPOINTS.USER.UPDATE_PROFILE, {
      displayName: userProfile?.displayName,
      birthDate: userProfile?.birthDate,
      zodiac: userProfile?.zodiac,
      gender: userProfile?.gender,
      bio: userProfile?.bio,
      photos: (userProfile?.photos ?? []).map(({ uri, order }) => ({ url: uri, order })),
      interests: userProfile?.interests,
      ...matchPreferences,
    });
  },
};
