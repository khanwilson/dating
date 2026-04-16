import { FadeInView } from 'components/onboarding/FadeInView';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const MIN_AGE = 18;
const MAX_AGE = 80;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function parseAge(text: string, fallback: number): number {
  const n = parseInt(text, 10);
  return isNaN(n) ? fallback : n;
}

function getUserAge(): number {
  const birthDate = ZustandPersist.getState().userProfile?.birthDate;
  if (!birthDate) return MAX_AGE;
  const bd = new Date(birthDate);
  if (isNaN(bd.getTime())) return MAX_AGE;
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const monthDiff = today.getMonth() - bd.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) age--;
  return clamp(age, MIN_AGE, MAX_AGE);
}

export default function AgeRangeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const prefs = ZustandPersist.getState().matchPreferences;
  const userAge = useMemo(getUserAge, []);
  const [minText, setMinText] = useState(String(prefs?.ageMin ?? MIN_AGE));
  const [maxText, setMaxText] = useState(String(prefs?.ageMax ?? userAge));

  const ageMin = clamp(parseAge(minText, MIN_AGE), MIN_AGE, MAX_AGE);
  const ageMax = clamp(parseAge(maxText, MAX_AGE), MIN_AGE, MAX_AGE);
  const isValid = ageMin <= ageMax && minText.length > 0 && maxText.length > 0;

  const minAtFloor = ageMin <= MIN_AGE;
  const minAtCeil = ageMin >= MAX_AGE;
  const maxAtFloor = ageMax <= MIN_AGE;
  const maxAtCeil = ageMax >= MAX_AGE;

  const incMin = () => { if (!minAtCeil) setMinText(String(clamp(ageMin + 1, MIN_AGE, MAX_AGE))); };
  const decMin = () => { if (!minAtFloor) setMinText(String(clamp(ageMin - 1, MIN_AGE, MAX_AGE))); };
  const incMax = () => { if (!maxAtCeil) setMaxText(String(clamp(ageMax + 1, MIN_AGE, MAX_AGE))); };
  const decMax = () => { if (!maxAtFloor) setMaxText(String(clamp(ageMax - 1, MIN_AGE, MAX_AGE))); };

  const handleNext = useCallback(() => {
    if (!isValid) return;
    ZustandPersist.getState().setMatchPreferences({ ageMin, ageMax });
    goNext(router);
  }, [isValid, ageMin, ageMax, goNext, router]);

  const arrowColor = theme.color.neutral[300];
  const arrowDisabled = theme.color.neutral[700];

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>What age range are you looking for?</AppText>

        <View style={styles.row}>
          <AppText style={styles.sideLabel}>From</AppText>

          <View style={styles.inputCol}>
            <TouchableOpacity style={styles.arrowBtn} onPress={incMin} disabled={minAtCeil}>
              <Ionicons name="chevron-up" size={20} color={minAtCeil ? arrowDisabled : arrowColor} />
            </TouchableOpacity>
            <TextInput
              style={styles.ageInput}
              value={minText}
              onChangeText={(t) => setMinText(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity style={styles.arrowBtn} onPress={decMin} disabled={minAtFloor}>
              <Ionicons name="chevron-down" size={20} color={minAtFloor ? arrowDisabled : arrowColor} />
            </TouchableOpacity>
          </View>

          <AppText style={styles.dash}>—</AppText>

          <View style={styles.inputCol}>
            <TouchableOpacity style={styles.arrowBtn} onPress={incMax} disabled={maxAtCeil}>
              <Ionicons name="chevron-up" size={20} color={maxAtCeil ? arrowDisabled : arrowColor} />
            </TouchableOpacity>
            <TextInput
              style={styles.ageInput}
              value={maxText}
              onChangeText={(t) => setMaxText(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity style={styles.arrowBtn} onPress={decMax} disabled={maxAtFloor}>
              <Ionicons name="chevron-down" size={20} color={maxAtFloor ? arrowDisabled : arrowColor} />
            </TouchableOpacity>
          </View>

          <AppText style={styles.sideLabel}>To</AppText>
        </View>

        {!isValid && minText.length > 0 && maxText.length > 0 && (
          <AppText style={styles.error}>From must be ≤ To ({MIN_AGE}–{MAX_AGE})</AppText>
        )}
      </FadeInView>
      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
        nextDisabled={!isValid}
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
      marginBottom: 40,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    sideLabel: {
      fontSize: theme.fontSize.p16,
      fontWeight: '600',
      color: theme.color.neutral[400],
    },
    inputCol: {
      alignItems: 'center',
    },
    arrowBtn: {
      width: 40,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ageInput: {
      width: 72,
      fontSize: 28,
      fontWeight: '700',
      color: theme.color.textColor.white,
      textAlign: 'center',
      backgroundColor: theme.color.neutral[800],
      borderRadius: 12,
      paddingVertical: 8,
    },
    dash: {
      fontSize: 20,
      color: theme.color.neutral[500],
    },
    error: {
      fontSize: theme.fontSize.p14,
      color: theme.color.red[500],
      textAlign: 'center',
      marginTop: 16,
    },
  });
