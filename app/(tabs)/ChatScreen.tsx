import { AppText } from 'components/text/AppText';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

// Placeholder — conversation list + chat box built in DAT-010.
export default function ChatScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>Chat</AppText>
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.neutral[900] },
    text: { fontSize: theme.fontSize.p24, fontWeight: 'bold', color: theme.color.textColor.white },
  });
