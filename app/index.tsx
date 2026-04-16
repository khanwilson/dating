import { getOnboardingRoute } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

export default function SplashScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    // TODO: remove after clearing data
    ZustandPersist.getState().logout();

    const timer = setTimeout(() => {
      const state = ZustandPersist.getState();

      if (state.userProfile?.completed) {
        // Profile complete — go to main app
        router.replace('/(tabs)/SwipeScreen' as any);
        return;
      }

      // Profile not complete — resume or start onboarding
      const step = state.onboardingStep ?? 1;
      router.replace(getOnboardingRoute(step) as any);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Dating</AppText>
      <AppText style={styles.subtitle}>Find your match</AppText>
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.neutral[900],
  },
  title: {
    fontSize: theme.fontSize.p32,
    fontWeight: 'bold',
    color: theme.color.textColor.white,
    marginBottom: theme.dimensions.p8,
  },
  subtitle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.textColor.subText,
  },
});
