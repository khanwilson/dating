import { AppText } from 'components/text/AppText';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import { BasePopup } from './BasePopup';

interface PopupPhone404Props {
  visible: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export function PopupPhone404({ visible, onClose, onRegister }: PopupPhone404Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BasePopup visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <AppText style={styles.title}>Số điện thoại chưa tồn tại</AppText>
        <AppText style={styles.body}>Bạn muốn tạo tài khoản mới?</AppText>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
            <AppText style={styles.cancelText}>Huỷ</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.registerBtn]} onPress={onRegister}>
            <AppText style={styles.registerText}>Đăng ký</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </BasePopup>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.color.neutral[800],
      borderRadius: 16,
      padding: 24,
    },
    title: {
      fontSize: theme.fontSize.p16,
      fontWeight: '700',
      color: theme.color.textColor.white,
      textAlign: 'center',
      marginBottom: 8,
    },
    body: {
      fontSize: theme.fontSize.p14,
      color: theme.color.neutral[400],
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    btn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelBtn: {
      backgroundColor: theme.color.neutral[700],
    },
    registerBtn: {
      backgroundColor: theme.color.primary[500],
    },
    cancelText: {
      fontSize: theme.fontSize.p14,
      fontWeight: '600',
      color: theme.color.textColor.white,
    },
    registerText: {
      fontSize: theme.fontSize.p14,
      fontWeight: '600',
      color: theme.color.textColor.white,
    },
  });
