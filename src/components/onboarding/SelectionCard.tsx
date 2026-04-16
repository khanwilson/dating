import { AppText } from 'components/text/AppText';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const SelectionCard = React.memo(({ label, selected, onPress }: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, selected), [theme, selected]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <AppText style={styles.label}>{label}</AppText>
    </TouchableOpacity>
  );
});

const createStyles = (theme: ITheme, selected: boolean) =>
  StyleSheet.create({
    card: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: selected ? theme.color.primary[500] : theme.color.neutral[600],
      backgroundColor: selected ? `${theme.color.primary[500]}20` : theme.color.neutral[800],
      marginBottom: 12,
      alignItems: 'center',
    },
    label: {
      fontSize: theme.fontSize.p16,
      fontWeight: '600',
      color: selected ? theme.color.primary[500] : theme.color.textColor.white,
    },
  });
