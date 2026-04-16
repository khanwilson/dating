import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';

interface Props {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgressBar = React.memo(({ currentStep, totalSteps }: Props) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <ProgressDot
            key={step}
            isActive={isActive}
            isDone={isDone}
            theme={theme}
          />
        );
      })}
    </View>
  );
});

function ProgressDot({ isActive, isDone, theme }: { isActive: boolean; isDone: boolean; theme: ITheme }) {
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      fillWidth.value = 0;
      fillWidth.value = withTiming(1, { duration: 500 });
    } else if (isDone) {
      fillWidth.value = 1;
    } else {
      fillWidth.value = 0;
    }
  }, [isActive, isDone, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  const isWide = isActive;

  return (
    <View style={[styles.dot, isWide && styles.dotWide]}>
      <Animated.View
        style={[
          styles.dotFill,
          { backgroundColor: theme.color.primary[500] },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dotWide: {
    width: 24,
  },
  dotFill: {
    height: '100%',
    borderRadius: 4,
  },
});

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 16,
      backgroundColor: theme.color.neutral[900],
    },
  });
