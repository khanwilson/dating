export const baseUrl = {
  value: 'http://192.168.24.103:4000/api',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/phone-otp/register',
    PHONE_OTP_REQUEST: '/auth/phone-otp/request',
    PHONE_OTP_CONFIRM: '/auth/phone-otp/confirm',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },
  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
  // Swipes
  SWIPES: {
    CANDIDATES: '/swipes/candidates',
    ACTION: '/swipes',
    LIKED_ME: '/swipes/liked-me',
    LIKED_BY_ME: '/swipes/liked-by-me',
  },
  // Matches
  MATCHES: {
    UNMATCH: (matchId: string) => `/matches/${matchId}`,
  },
};
