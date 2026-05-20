import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

const BUTTON_SIZE = 56;
const ICON_SIZE = 24;

interface Props {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export const OnboardingFooter = React.memo(
  ({ currentStep, onNext, onBack, nextLabel, nextDisabled, loading }: Props) => {
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const isFinish = nextLabel === 'Finish';
    const nextIconName = isFinish ? 'checkmark' : 'chevron-forward';
    const isDisabled = nextDisabled || loading;

    return (
      <View style={styles.container}>
        {currentStep > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7} disabled={loading}>
            <Ionicons name="chevron-back" size={ICON_SIZE} color={theme.color.neutral[300]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <TouchableOpacity
          style={[styles.nextButton, isDisabled && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.color.white} />
          ) : (
            <Ionicons
              name={nextIconName}
              size={ICON_SIZE}
              color={isDisabled ? theme.color.neutral[500] : theme.color.white}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 40,
      backgroundColor: theme.color.neutral[900],
    },
    backButton: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: theme.color.neutral[700],
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButton: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: theme.color.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonDisabled: {
      opacity: 0.4,
    },
    placeholder: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    },
  });
