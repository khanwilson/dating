import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const MIN_KM = 1;
const MAX_KM = 200;
const THUMB_SIZE = 28;

function clamp(v: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, v));
}

function posToValue(pos: number, usable: number) {
  'worklet';
  if (usable <= 0) return MIN_KM;
  const ratio = clamp(pos / usable, 0, 1);
  return Math.round(MIN_KM + ratio * (MAX_KM - MIN_KM));
}

export default function DistanceScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const initialKm = ZustandPersist.getState().matchPreferences?.maxDistanceKm ?? 50;
  const [distance, setDistance] = useState(initialKm);

  // Shared values for smooth 60fps animation on UI thread
  const thumbX = useSharedValue(0);
  const trackW = useSharedValue(0);
  const isLayoutReady = useSharedValue(false);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    trackW.value = width;
    const usable = width - THUMB_SIZE;
    // Set initial thumb position from persisted value
    thumbX.value = ((initialKm - MIN_KM) / (MAX_KM - MIN_KM)) * usable;
    isLayoutReady.value = true;
  }, [initialKm, thumbX, trackW, isLayoutReady]);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      // Tap: jump to touch position
      const usable = trackW.value - THUMB_SIZE;
      const pos = clamp(e.x - THUMB_SIZE / 2, 0, usable);
      thumbX.value = pos;
      runOnJS(setDistance)(posToValue(pos, usable));
    })
    .onChange((e) => {
      // Drag: apply delta (smooth, no jitter)
      const usable = trackW.value - THUMB_SIZE;
      const newPos = clamp(thumbX.value + e.changeX, 0, usable);
      thumbX.value = newPos;
      runOnJS(setDistance)(posToValue(newPos, usable));
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
    opacity: isLayoutReady.value ? 1 : 0,
  }));

  const fillStyle = useAnimatedStyle(() => {
    if (!isLayoutReady.value || trackW.value <= 0) return { width: 0 };
    // Fill extends to center of thumb
    const fillWidth = thumbX.value + THUMB_SIZE / 2;
    return { width: fillWidth };
  });

  const handleNext = useCallback(() => {
    ZustandPersist.getState().setMatchPreferences({ maxDistanceKm: distance });
    goNext(router);
  }, [distance, goNext, router]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>How far are you willing to search?</AppText>
        <AppText style={styles.value}>{distance} km</AppText>

        <GestureDetector gesture={gesture}>
          <View style={styles.sliderContainer} onLayout={onTrackLayout}>
            <View style={styles.track}>
              <Animated.View style={[styles.trackFill, fillStyle]} />
            </View>
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </GestureDetector>

        <View style={styles.labels}>
          <AppText style={styles.labelText}>{MIN_KM} km</AppText>
          <AppText style={styles.labelText}>{MAX_KM} km</AppText>
        </View>
      </FadeInView>
      <OnboardingFooter
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => goBack(router)}
      />
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    content: { flex: 1, paddingHorizontal: 32 },
    title: {
      fontSize: theme.fontSize.p24,
      fontWeight: 'bold',
      color: theme.color.textColor.white,
      textAlign: 'center',
      marginTop: 42,
      marginBottom: 20,
    },
    value: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.color.primary[500],
      textAlign: 'center',
      marginBottom: 40,
    },
    sliderContainer: {
      height: 40,
      justifyContent: 'center',
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.color.neutral[700],
      overflow: 'hidden',
    },
    trackFill: {
      height: '100%',
      backgroundColor: theme.color.primary[500],
      borderRadius: 3,
    },
    thumb: {
      position: 'absolute',
      top: (40 - THUMB_SIZE) / 2,
      left: 0,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      backgroundColor: theme.color.white,
      borderWidth: 3,
      borderColor: theme.color.primary[500],
    },
    labels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    labelText: {
      fontSize: theme.fontSize.p12,
      color: theme.color.neutral[400],
    },
  });
