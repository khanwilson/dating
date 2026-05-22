import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BasePopupProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BasePopup({ visible, onClose, children }: BasePopupProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.popup} activeOpacity={1} onPress={() => {}}>
          <View>{children}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    width: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
