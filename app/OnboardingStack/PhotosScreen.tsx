import { FadeInView } from 'components/onboarding/FadeInView';
import { OnboardingFooter } from 'components/onboarding/OnboardingFooter';
import { OnboardingProgressBar } from 'components/onboarding/OnboardingProgressBar';
import { useOnboardingStep } from 'components/onboarding/useOnboardingStep';
import { AppText } from 'components/text/AppText';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { Photo } from 'types/user';
import ZustandPersist from 'zustand/persist';

const MAX_PHOTOS = 6;
const GRID_GAP = 10;
const GRID_COLS = 3;
const screenWidth = Dimensions.get('window').width;
const CELL_SIZE = (screenWidth - 48 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

let idCounter = Date.now();
function nextId() {
  return String(idCounter++);
}

export default function PhotosScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currentStep, totalSteps, goNext, goBack } = useOnboardingStep();

  const [photos, setPhotos] = useState<Photo[]>(
    () => ZustandPersist.getState().userProfile?.photos ?? [],
  );

  const pickPhoto = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    setPhotos((prev) => [...prev, { id: nextId(), uri, order: prev.length }]);
  }, [photos.length]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })));
  }, []);

  const isValid = photos.length >= 1;

  const handleNext = useCallback(() => {
    if (!isValid) return;
    ZustandPersist.getState().setUserProfile({ photos } as any);
    goNext(router);
  }, [isValid, photos, goNext, router]);

  const slots = useMemo(() => {
    const arr: (Photo | null)[] = [...photos];
    while (arr.length < MAX_PHOTOS) arr.push(null);
    return arr;
  }, [photos]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <FadeInView style={styles.content}>
        <AppText style={styles.title}>Add your photos</AppText>
        <AppText style={styles.subtitle}>
          At least 1, up to {MAX_PHOTOS} ({photos.length} added)
        </AppText>

        <View style={styles.grid}>
          {slots.map((photo, i) => (
            <TouchableOpacity
              key={photo?.id ?? `empty-${i}`}
              style={[styles.cell, photo && styles.cellFilled]}
              onPress={() => (photo ? removePhoto(photo.id) : pickPhoto())}
              activeOpacity={0.7}
            >
              {photo ? (
                <>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <View style={styles.removeBadge}>
                    <AppText style={styles.removeText}>x</AppText>
                  </View>
                </>
              ) : (
                <AppText style={styles.addText}>+</AppText>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
      marginBottom: 4,
    },
    subtitle: {
      fontSize: theme.fontSize.p14,
      color: theme.color.neutral[400],
      textAlign: 'center',
      marginBottom: 24,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GRID_GAP,
      justifyContent: 'center',
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE * 1.3,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.color.neutral[600],
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.color.neutral[800],
    },
    cellFilled: {
      borderStyle: 'solid',
      borderColor: theme.color.primary[500],
    },
    addText: {
      fontSize: 32,
      color: theme.color.neutral[500],
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    removeBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.color.red[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.color.white,
    },
  });
