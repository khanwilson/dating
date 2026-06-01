import React, { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { AppText } from 'components/text/AppText';
import { Candidate } from 'api/services/matchService';

interface MatchPopupProps {
  visible: boolean;
  currentUserAvatar?: string;
  matchedCandidate: Candidate | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchPopup({
  visible,
  currentUserAvatar,
  matchedCandidate,
  onSendMessage,
  onKeepSwiping,
}: MatchPopupProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    } else {
      opacity.value = 0;
      scale.value = 0.85;
    }
  }, [visible, opacity, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onKeepSwiping}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, containerStyle]}>
          <AppText style={styles.headline}>{"It's a Match!"}</AppText>

          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: currentUserAvatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
            <AppText style={styles.heart}>❤️</AppText>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: matchedCandidate?.photos[0]?.url }}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
          </View>

          {matchedCandidate && (
            <AppText style={styles.subtext}>
              You and {matchedCandidate.displayName} liked each other
            </AppText>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={onSendMessage} activeOpacity={0.8}>
            <AppText style={styles.primaryBtnText}>Send message</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onKeepSwiping} activeOpacity={0.8}>
            <AppText style={styles.secondaryBtnText}>Keep swiping</AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B9D',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FF6B9D',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  heart: {
    fontSize: 28,
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#FF6B9D',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
});
