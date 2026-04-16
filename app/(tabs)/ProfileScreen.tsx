import { AppText } from 'components/text/AppText';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// Placeholder — profile view + edit + settings built in DAT-011.
export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>Profile</AppText>
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.neutral[900] },
    text: { fontSize: theme.fontSize.p24, fontWeight: 'bold', color: theme.color.textColor.white },
  });
