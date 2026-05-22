import { Router } from 'expo-router';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

const ONBOARDING_ROUTES = [
  '/OnboardingStack/NameScreen',
  '/OnboardingStack/PhoneScreen',
  '/OnboardingStack/BirthdayScreen',
  '/OnboardingStack/GenderScreen',
  '/OnboardingStack/LookingForScreen',
  '/OnboardingStack/AgeRangeScreen',
  '/OnboardingStack/InterestsScreen',
  '/OnboardingStack/PhotosScreen',
  '/OnboardingStack/DistanceScreen',
  '/OnboardingStack/RelationshipTypeScreen',
] as const;

export const TOTAL_STEPS = ONBOARDING_ROUTES.length; // 10

export function getOnboardingRoute(step: number): string {
  const idx = Math.max(0, Math.min(step - 1, ONBOARDING_ROUTES.length - 1));
  return ONBOARDING_ROUTES[idx];
}

export function useOnboardingStep() {
  const onboardingStep = ZustandPersist(useShallow((s) => s.onboardingStep));
  const currentStep = onboardingStep ?? 1;

  const goNext = (router: Router) => {
    if (currentStep >= TOTAL_STEPS) {
      // Final step: mark profile complete, navigate to main app
      ZustandPersist.getState().setOnboardingStep(TOTAL_STEPS);
      router.replace('/(tabs)/SwipeScreen' as any);
      return;
    }
    const nextStep = currentStep + 1;
    ZustandPersist.getState().setOnboardingStep(nextStep);
    router.replace(getOnboardingRoute(nextStep) as any);
  };

  const goBack = (router: Router) => {
    if (currentStep <= 1) return;
    if (currentStep === 3) {
      router.replace('/SignInScreen' as any);
      return;
    }
    const prevStep = currentStep - 1;
    ZustandPersist.getState().setOnboardingStep(prevStep);
    router.replace(getOnboardingRoute(prevStep) as any);
  };

  return { currentStep, goNext, goBack, totalSteps: TOTAL_STEPS };
}
