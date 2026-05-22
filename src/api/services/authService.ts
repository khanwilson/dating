import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

export interface PhoneOtpRequest {
  phoneCode: string;
  phoneNumber: string;
}

export interface PhoneOtpConfirmRequest {
  phoneCode: string;
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export const authService = {
  register: (data: PhoneOtpRequest): Promise<AuthResponse> => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  requestPhoneOtp: (data: PhoneOtpRequest): Promise<void> => {
    return apiClient.post(ENDPOINTS.AUTH.PHONE_OTP_REQUEST, data);
  },

  confirmPhoneOtp: (data: PhoneOtpConfirmRequest): Promise<AuthResponse> => {
    return apiClient.post(ENDPOINTS.AUTH.PHONE_OTP_CONFIRM, data);
  },

  logout: (): Promise<void> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  },
};
