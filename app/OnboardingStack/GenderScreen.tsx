import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { SelectionCard } from 'components/onboarding/SelectionCard';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { Gender } from 'constants/enum';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.Male, label: 'Male' },
  { value: Gender.Female, label: 'Female' },
  { value: Gender.NonBinary, label: 'Non-binary' },
  { value: Gender.PreferNotToSay, label: 'Prefer not to say' },
];

export default function GenderScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const [selected, setSelected] = useState<Gender | null>(
    () => ZustandPersist.getState().userProfile?.gender ?? null,
  );

  const handleNext = useCallback(() => {
    if (!selected) return;
    ZustandPersist.getState().setUserProfile({ gender: selected } as any);
    goNext(router);
  }, [selected, goNext, router]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>What is your gender?</AppText>
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
      </FadeInView>
      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
        nextDisabled={!selected}
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
  });
