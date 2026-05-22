// Auth hooks
export { useLogout, useRegister, useRequestPhoneOtp, useConfirmPhoneOtp, AUTH_KEYS } from './useAuth';

// User hooks
export { useUpdateProfile, useUserProfile, USER_KEYS } from './useUser';

// Onboarding hooks
export { useSubmitOnboarding, ONBOARDING_KEYS } from './useOnboarding';

// Match hooks
export { useCandidates, useLike, useLikedMe, usePass, MATCH_KEYS } from './useMatch';

// Chat hooks
export { useConversations, useMarkAsRead, useMessages, useSendMessage, CHAT_KEYS } from './useChat';

// Location hooks
export { useLocation } from './useLocation';
export type { Coordinates, LocationState } from './useLocation';
