import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, ModeTheme } from 'constants/enum';
import { MatchPreferences, UserProfile } from 'types/user';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Define the store state type
export interface PersistState {
  // Theme
  ThemeApp?: ModeTheme;
  // Localization
  Localization?: LANGUAGES;
  // Auth
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    phoneCode: string;
    phoneNumber: string;
    displayName?: string;
    avatar?: string;
  };
  // Dating profile (DAT-002)
  userProfile?: UserProfile;
  matchPreferences?: MatchPreferences;
  onboardingStep?: number; // 1..9; undefined = not started
  // Swipe state (DAT-008)
  iLiked?: string[];
  iPassed?: string[];

  // Actions
  save: <K extends keyof PersistState>(key: K, value: PersistState[K]) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: PersistState['user']) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setMatchPreferences: (prefs: Partial<MatchPreferences>) => void;
  setOnboardingStep: (step: number) => void;
  addLiked: (id: string) => void;
  addPassed: (id: string) => void;
  clearProfile: () => void;
  logout: () => void;
  reset: () => void;
}

// Create the store with persist middleware
const ZustandPersist = create<PersistState>()(
  persist(
    (set, get) => ({
      // Generic save function for any key
      save: (key, value) => set({ [key]: value }),

      // Set auth tokens
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      // Set user data
      setUser: (user) => set({ user }),

      // Dating profile actions
      setUserProfile: (profile) =>
        set({ userProfile: { ...get().userProfile, ...profile } as UserProfile }),

      setMatchPreferences: (prefs) =>
        set({ matchPreferences: { ...get().matchPreferences, ...prefs } as MatchPreferences }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      addLiked: (id) => set({ iLiked: [...(get().iLiked ?? []), id] }),
      addPassed: (id) => set({ iPassed: [...(get().iPassed ?? []), id] }),

      clearProfile: () => set({
        userProfile: undefined,
        matchPreferences: undefined,
        onboardingStep: undefined,
        iLiked: undefined,
        iPassed: undefined,
      }),

      // Logout - clear auth data + dating profile + swipe state
      logout: () => set({
        accessToken: undefined,
        refreshToken: undefined,
        user: undefined,
        userProfile: undefined,
        matchPreferences: undefined,
        onboardingStep: undefined,
        iLiked: undefined,
        iPassed: undefined,
      }),

      // Reset all state
      reset: () => set({}),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        ThemeApp: state.ThemeApp,
        Localization: state.Localization,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        userProfile: state.userProfile,
        matchPreferences: state.matchPreferences,
        onboardingStep: state.onboardingStep,
        iLiked: state.iLiked,
        iPassed: state.iPassed,
      }),
    }
  )
);

export default ZustandPersist;
