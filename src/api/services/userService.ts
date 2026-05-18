import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

export interface User {
  id: string;
  phoneCode: string;
  phoneNumber: string;
  displayName?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatar?: string;
}

export const userService = {
  getProfile: (): Promise<User> => {
    return apiClient.get(ENDPOINTS.USER.PROFILE);
  },

  updateProfile: (data: UpdateProfileRequest): Promise<User> => {
    return apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, data);
  },
};
