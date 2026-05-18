import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

export interface RegisterRequest {
  phoneCode: string;
  phoneNumber: string;
}

export interface RequestOtpRequest {
  phoneCode: string;
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  phoneCode: string;
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phoneCode: string;
    phoneNumber: string;
  };
}

export const authService = {
  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  requestOtp: (data: RequestOtpRequest): Promise<void> => {
    return apiClient.post(ENDPOINTS.AUTH.REQUEST_OTP, data);
  },

  verifyOtp: (data: VerifyOtpRequest): Promise<AuthResponse> => {
    return apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
  },

  logout: (): Promise<void> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  },
};
