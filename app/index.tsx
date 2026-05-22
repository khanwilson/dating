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
    const navigate = () => {
      const state = ZustandPersist.getState();

      if (state.userProfile?.matchPreferences?.relationshipType) {
        router.replace('/(tabs)/SwipeScreen' as any);
        return;
      }

      if (state.accessToken) {
        ZustandPersist.getState().setOnboardingStep(3);
        router.replace(getOnboardingRoute(3) as any);
        return;
      }

      router.replace('/SignInScreen' as any);
    };

    const minDelay = new Promise<void>((res) => setTimeout(res, 1500));

    if (ZustandPersist.persist.hasHydrated()) {
      minDelay.then(navigate);
    } else {
      const hydrated = new Promise<void>((res) => {
        const unsub = ZustandPersist.persist.onFinishHydration(() => {
          unsub();
          res();
        });
      });
      Promise.all([minDelay, hydrated]).then(navigate);
    }
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
