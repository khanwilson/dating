import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { interestQuestions } from 'constants/interestQuestions';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { InterestAnswer } from 'types/user';
import ZustandPersist from 'zustand/persist';

function buildInitial(): Map<string, Set<string>> {
  const saved = ZustandPersist.getState().userProfile?.interests ?? [];
  const map = new Map<string, Set<string>>();
  for (const a of saved) map.set(a.questionId, new Set(a.selectedOptions));
  return map;
}

export default function InterestsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const [selections, setSelections] = useState(buildInitial);

  const totalSelected = useMemo(() => {
    let count = 0;
    selections.forEach((s) => (count += s.size));
    return count;
  }, [selections]);

  const toggle = useCallback((qId: string, option: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(qId) ?? []);
      if (set.has(option)) set.delete(option);
      else set.add(option);
      if (set.size > 0) next.set(qId, set);
      else next.delete(qId);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (totalSelected < 3) return;
    const interests: InterestAnswer[] = [];
    selections.forEach((opts, qId) => {
      if (opts.size > 0) interests.push({ questionId: qId, selectedOptions: [...opts] });
    });
    ZustandPersist.getState().setUserProfile({ interests } as any);
    goNext(router);
  }, [totalSelected, selections, goNext, router]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <AppText style={styles.title}>What are your interests?</AppText>
        <AppText style={styles.subtitle}>Pick at least 3 ({totalSelected} selected)</AppText>

        {interestQuestions.map((q) => (
          <View key={q.id} style={styles.section}>
            <AppText style={styles.sectionTitle}>{q.title}</AppText>
            <View style={styles.chipRow}>
              {q.options.map((opt) => {
                const selected = selections.get(q.id)?.has(opt) ?? false;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggle(q.id, opt)}
                    activeOpacity={0.7}
                  >
                    <AppText style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {opt}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      </FadeInView>
      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
        nextDisabled={totalSelected < 3}
      />
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    title: {
      fontSize: theme.fontSize.p24,
      fontWeight: 'bold',
      color: theme.color.textColor.white,
      textAlign: 'center',
      marginBottom: 4,
      marginTop: 42,
    },
    subtitle: {
      fontSize: theme.fontSize.p14,
      color: theme.color.neutral[400],
      textAlign: 'center',
      marginBottom: 24,
    },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: theme.fontSize.p16,
      fontWeight: '600',
      color: theme.color.textColor.white,
      marginBottom: 10,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.color.neutral[600],
      backgroundColor: theme.color.neutral[800],
    },
    chipSelected: {
      borderColor: theme.color.primary[500],
      backgroundColor: `${theme.color.primary[500]}20`,
    },
    chipText: {
      fontSize: theme.fontSize.p14,
      fontWeight: '600',
      color: theme.color.neutral[300],
    },
    chipTextSelected: {
      color: theme.color.primary[500],
    },
  });
