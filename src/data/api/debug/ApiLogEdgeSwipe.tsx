import React, { useState } from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import ZustandSession from 'zustand/session';
import { devMode } from '../resource';
import { ModalApiLogs } from './ModalApiLogs';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
}

export const ApiLogEdgeSwipe: React.FC<Props> = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { ModalDebugStatus } = ZustandSession();

  // Don't render if debug mode not enabled
  if (!ModalDebugStatus) return null;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { moveX, dx } = gestureState;
      // Only trigger if starting from right edge and swiping left
      const isFromRightEdge = moveX > screenWidth - 50; // 50px from right edge
      const isSwipingLeft = dx < -20; // Swiping left at least 20px
      return isFromRightEdge && isSwipingLeft;
    },

    onPanResponderGrant: () => {
      // Visual feedback could be added here (like a subtle edge highlight)
      console.info('🔥 Edge swipe detected - preparing to open API logs...');
    },

    onPanResponderMove: (evt, gestureState) => {
      // const { dx } = gestureState;
      // Could add progress indicator based on swipe distance
      // const progress = Math.min(Math.abs(dx) / (screenWidth * 0.2), 1);
      // You could add visual feedback here based on progress
    },

    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      // Trigger modal if swiped far enough or fast enough
      const swipeThreshold = screenWidth * 0.15; // 15% of screen width
      const velocityThreshold = -0.3; // Negative for left swipe

      if (Math.abs(dx) > swipeThreshold || vx < velocityThreshold) {
        openModal();
      } else {
        console.error('❌ Edge swipe cancelled - not enough distance/velocity');
      }
    },
  });

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  if (!devMode.value) return <>
  </>

  return (
    <>
      {/* Invisible edge detector for swipe gesture */}
      <View
        style={styles.edgeDetector}
        {...panResponder.panHandlers}
      />

      {/* Modal */}
      <ModalApiLogs visible={modalVisible} onClose={closeModal} />
    </>
  );
};

const styles = StyleSheet.create({
  edgeDetector: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 30, // 30px detection area from right edge for easier access
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
});
