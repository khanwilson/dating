import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

const BUTTON_SIZE = 56;
const ICON_SIZE = 24;

interface Props {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export const OnboardingFooter = React.memo(
  ({ currentStep, onNext, onBack, nextLabel, nextDisabled }: Props) => {
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const isFinish = nextLabel === 'Finish';
    const nextIconName = isFinish ? 'checkmark' : 'chevron-forward';

    return (
      <View style={styles.container}>
        {currentStep > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={ICON_SIZE} color={theme.color.neutral[300]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <TouchableOpacity
          style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={nextDisabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name={nextIconName}
            size={ICON_SIZE}
            color={nextDisabled ? theme.color.neutral[500] : theme.color.white}
          />
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
