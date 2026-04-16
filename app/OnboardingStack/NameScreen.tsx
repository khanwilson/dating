import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const MAX_LENGTH = 30;

export default function NameScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const [name, setName] = useState(
    () => ZustandPersist.getState().userProfile?.displayName ?? '',
  );

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_LENGTH;

  const handleNext = useCallback(() => {
    if (!isValid) return;
    ZustandPersist.getState().setUserProfile({ displayName: trimmed } as any);
    goNext(router);
  }, [isValid, trimmed, goNext, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>What should people call you?</AppText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={theme.color.neutral[500]}
          maxLength={MAX_LENGTH}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
        <AppText style={styles.charCount}>
          {trimmed.length}/{MAX_LENGTH}
        </AppText>
      </FadeInView>
      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
        nextDisabled={!isValid}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    title: {
      fontSize: theme.fontSize.p24,
      fontWeight: 'bold',
      color: theme.color.textColor.white,
      textAlign: 'center',
      marginTop: 42,
      marginBottom: 32,
    },
    input: {
      fontSize: 28,
      fontWeight: '600',
      color: theme.color.textColor.white,
      textAlign: 'center',
      borderBottomWidth: 2,
      borderBottomColor: theme.color.primary[500],
      paddingVertical: 12,
      marginHorizontal: 20,
    },
    charCount: {
      fontSize: theme.fontSize.p14,
      color: theme.color.neutral[400],
      textAlign: 'center',
      marginTop: 8,
    },
  });
