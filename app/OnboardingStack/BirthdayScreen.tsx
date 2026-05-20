import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { Zodiac } from 'constants/enum';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { getZodiacFromBirthDate } from 'utils/zodiac';
import ZustandPersist from 'zustand/persist';

const ZODIAC_EMOJI: Record<Zodiac, string> = {
  [Zodiac.Aries]: 'Aries',
  [Zodiac.Taurus]: 'Taurus',
  [Zodiac.Gemini]: 'Gemini',
  [Zodiac.Cancer]: 'Cancer',
  [Zodiac.Leo]: 'Leo',
  [Zodiac.Virgo]: 'Virgo',
  [Zodiac.Libra]: 'Libra',
  [Zodiac.Scorpio]: 'Scorpio',
  [Zodiac.Sagittarius]: 'Sagittarius',
  [Zodiac.Capricorn]: 'Capricorn',
  [Zodiac.Aquarius]: 'Aquarius',
  [Zodiac.Pisces]: 'Pisces',
};

function parseSavedDate(iso?: string): { day: string; month: string; year: string } {
  if (!iso) return { day: '', month: '', year: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return {
    day: String(d.getDate()),
    month: String(d.getMonth() + 1),
    year: String(d.getFullYear()),
  };
}

export default function BirthdayScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const saved = ZustandPersist.getState().userProfile?.birthDate;
  const parsed = useMemo(() => parseSavedDate(saved), [saved]);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);

  const date = useMemo(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100)
      return null;
    const dt = new Date(y, m - 1, d);
    // Verify the date didn't overflow (e.g. Feb 30 → Mar 2)
    if (dt.getDate() !== d || dt.getMonth() !== m - 1 || dt.getFullYear() !== y)
      return null;
    return dt;
  }, [day, month, year]);

  const age = useMemo(() => {
    if (!date) return null;
    const today = new Date();
    let a = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) a--;
    return a;
  }, [date]);

  const zodiac = useMemo(() => (date ? getZodiacFromBirthDate(date) : null), [date]);
  const isValid = date !== null && age !== null && age >= 18 && age <= 80;

  const handleNext = useCallback(() => {
    if (!isValid || !date || !zodiac) return;
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    ZustandPersist.getState().setUserProfile({ birthDate: iso, zodiac } as any);
    goNext(router);
  }, [isValid, date, zodiac, goNext, router]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>When is your birthday?</AppText>

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <AppText style={styles.dateLabel}>Day</AppText>
            <TextInput
              style={styles.dateInput}
              value={day}
              onChangeText={(t) => {
                const v = t.replace(/[^0-9]/g, '').slice(0, 2);
                setDay(v);
                if (v.length === 2) monthRef.current?.focus();
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="DD"
              placeholderTextColor={theme.color.neutral[500]}
            />
          </View>
          <View style={styles.dateField}>
            <AppText style={styles.dateLabel}>Month</AppText>
            <TextInput
              ref={monthRef}
              style={styles.dateInput}
              value={month}
              onChangeText={(t) => {
                const v = t.replace(/[^0-9]/g, '').slice(0, 2);
                setMonth(v);
                if (v.length === 2) yearRef.current?.focus();
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="MM"
              placeholderTextColor={theme.color.neutral[500]}
            />
          </View>
          <View style={styles.dateField}>
            <AppText style={styles.dateLabel}>Year</AppText>
            <TextInput
              ref={yearRef}
              style={styles.dateInput}
              value={year}
              onChangeText={(t) => setYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="YYYY"
              placeholderTextColor={theme.color.neutral[500]}
            />
          </View>
        </View>

        {zodiac && (
          <View style={styles.zodiacBadge}>
            <AppText style={styles.zodiacText}>{ZODIAC_EMOJI[zodiac]}</AppText>
          </View>
        )}

        {age !== null && (age < 18 || age > 80) && (
          <AppText style={styles.errorText}>Age must be between 18 and 80</AppText>
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
      marginBottom: 32,
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
    },
    dateField: { alignItems: 'center' },
    dateLabel: {
      fontSize: theme.fontSize.p14,
      color: theme.color.neutral[400],
      marginBottom: 8,
    },
    dateInput: {
      width: 80,
      fontSize: 24,
      fontWeight: '600',
      color: theme.color.textColor.white,
      textAlign: 'center',
      borderBottomWidth: 2,
      borderBottomColor: theme.color.primary[500],
      paddingVertical: 8,
    },
    zodiacBadge: {
      marginTop: 24,
      alignSelf: 'center',
      backgroundColor: `${theme.color.primary[500]}20`,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: theme.color.primary[500],
    },
    zodiacText: {
      fontSize: theme.fontSize.p16,
      fontWeight: '600',
      color: theme.color.primary[500],
    },
    errorText: {
      fontSize: theme.fontSize.p14,
      color: theme.color.red[500],
      textAlign: 'center',
      marginTop: 12,
    },
  });
