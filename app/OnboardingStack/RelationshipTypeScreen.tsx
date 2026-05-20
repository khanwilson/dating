import { useSubmitOnboarding } from 'api/hooks';
import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { SelectionCard } from 'components/onboarding/SelectionCard';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { RelationshipType } from 'constants/enum';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: RelationshipType.ShortTerm, label: 'Short-term fun' },
  { value: RelationshipType.LongTerm, label: 'Long-term relationship' },
  { value: RelationshipType.Friends, label: 'Just friends' },
];

export default function RelationshipTypeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goBack } = useOnboardingStep();
  const submitOnboarding = useSubmitOnboarding();

  const [selected, setSelected] = useState<RelationshipType | null>(
    () => ZustandPersist.getState().matchPreferences?.relationshipType ?? null,
  );

  const handleNext = useCallback(() => {
    if (!selected || submitOnboarding.isPending) return;

    const state = ZustandPersist.getState();
    ZustandPersist.getState().setMatchPreferences({ relationshipType: selected });

    submitOnboarding.mutate(
      {
        userProfile: state.userProfile!,
        matchPreferences: { ...state.matchPreferences!, relationshipType: selected },
      },
      {
        onSuccess: () => router.replace('/(tabs)/SwipeScreen' as any),
      },
    );
  }, [selected, submitOnboarding, router]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>What kind of relationship?</AppText>
        <View style={styles.cards}>
          {OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={selected === opt.value}
              onPress={() => setSelected(opt.value)}
            />
          ))}
        </View>
        {submitOnboarding.isError && (
          <AppText style={styles.errorText}>Something went wrong. Please try again.</AppText>
        )}
      </FadeInView>
      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
        nextDisabled={!selected}
        loading={submitOnboarding.isPending}
        nextLabel="Finish"
      />
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    content: { flex: 1, paddingHorizontal: 24 },
    title: {
      fontSize: theme.fontSize.p24,
      fontWeight: 'bold',
      color: theme.color.textColor.white,
      textAlign: 'center',
      marginTop: 42,
      marginBottom: 32,
    },
    cards: { gap: 0 },
    errorText: {
      fontSize: theme.fontSize.p14,
      color: theme.color.red[500],
      textAlign: 'center',
      marginTop: 16,
    },
  });
