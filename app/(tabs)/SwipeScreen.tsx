import { Ionicons } from '@expo/vector-icons';
import { AppText } from 'components/text/AppText';
import { Candidate, getCandidates } from 'src/data/mockCandidates';
import { Image } from 'expo-image';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.3;
const MAX_ROTATION = 12;
const CARD_MARGIN = 12;

export default function SwipeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const prefs = ZustandPersist(useShallow((s) => s.matchPreferences));
  const profile = ZustandPersist(useShallow((s) => s.userProfile));
  const iLikedRaw = ZustandPersist(useShallow((s) => s.iLiked));
  const iPassedRaw = ZustandPersist(useShallow((s) => s.iPassed));

  const iLiked = useMemo(() => iLikedRaw ?? [], [iLikedRaw]);
  const iPassed = useMemo(() => iPassedRaw ?? [], [iPassedRaw]);

  const candidates = useMemo(
    () => getCandidates(prefs, profile, iLiked, iPassed),
    [prefs, profile, iLiked, iPassed],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback(
    (direction: 'like' | 'pass') => {
      const card = candidates[currentIndex];
      if (!card) return;
      if (direction === 'like') ZustandPersist.getState().addLiked(card.id);
      else ZustandPersist.getState().addPassed(card.id);
      setCurrentIndex((i) => i + 1);
    },
    [candidates, currentIndex],
  );

  const topCard = candidates[currentIndex];
  const nextCard = candidates[currentIndex + 1];

  if (!topCard) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-dislike-outline" size={64} color={theme.color.neutral[500]} />
          <AppText style={styles.emptyTitle}>No more people nearby</AppText>
          <AppText style={styles.emptySubtitle}>Try expanding your distance</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        {nextCard && <StaticCard candidate={nextCard} styles={styles} />}
        <SwipeableCard
          key={topCard.id}
          candidate={topCard}
          styles={styles}
          onSwipe={handleSwipe}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionPass]}
          onPress={() => handleSwipe('pass')}
        >
          <Ionicons name="close" size={28} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionSuperLike]}
          onPress={() => handleSwipe('like')}
        >
          <Ionicons name="star" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionLike]}
          onPress={() => handleSwipe('like')}
        >
          <Ionicons name="heart" size={28} color="#4ADE80" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SwipeableCard({
  candidate,
  styles,
  onSwipe,
}: {
  candidate: Candidate;
  styles: ReturnType<typeof createStyles>;
  onSwipe: (dir: 'like' | 'pass') => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const dismiss = useCallback(
    (dir: 'like' | 'pass') => { onSwipe(dir); },
    [onSwipe],
  );

  const nextPhoto = useCallback(() => {
    setPhotoIndex((prev) => Math.min(prev + 1, candidate.photos.length - 1));
  }, [candidate.photos.length]);

  const prevPhoto = useCallback(() => {
    setPhotoIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.4;
    })
    .onEnd((e) => {
      const absX = Math.abs(e.translationX);
      if (absX > SWIPE_THRESHOLD) {
        const dir = e.translationX > 0 ? 'like' : 'pass';
        const targetX = e.translationX > 0 ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
        translateX.value = withTiming(targetX, { duration: 300 }, () => {
          runOnJS(dismiss)(dir as 'like' | 'pass');
        });
        translateY.value = withTiming(e.translationY * 2, { duration: 300 });
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      if (e.absoluteX > SCREEN_W / 2) {
        runOnJS(nextPhoto)();
      } else {
        runOnJS(prevPhoto)();
      }
    });

  const gesture = Gesture.Exclusive(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_W, 0, SCREEN_W],
      [-MAX_ROTATION, 0, MAX_ROTATION],
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: candidate.photos[photoIndex] ?? candidate.photos[0] }}
          style={styles.cardPhoto}
          contentFit="cover"
        />

        {candidate.photos.length > 1 && (
          <View style={styles.photoDots}>
            {candidate.photos.map((_, i) => (
              <View key={i} style={[styles.photoDot, i === photoIndex && styles.photoDotActive]} />
            ))}
          </View>
        )}

        {/* Info background is on the info View itself */}

        {/* LIKE stamp */}
        <Animated.View style={[styles.stamp, styles.stampLike, likeStampStyle]}>
          <AppText style={styles.stampLikeText}>LIKE</AppText>
        </Animated.View>

        {/* NOPE stamp */}
        <Animated.View style={[styles.stamp, styles.stampNope, nopeStampStyle]}>
          <AppText style={styles.stampNopeText}>NOPE</AppText>
        </Animated.View>

        {/* Info */}
        <View style={styles.info}>
          <AppText style={styles.nameAge}>
            {candidate.displayName}  {candidate.age}
          </AppText>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={14} color="#ccc" />
            <AppText style={styles.distanceText}>{candidate.distance} km away</AppText>
          </View>
          {candidate.interests.length > 0 && (
            <View style={styles.tags}>
              {candidate.interests.slice(0, 3).map((t) => (
                <View key={t} style={styles.tag}>
                  <AppText style={styles.tagText}>{t}</AppText>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function StaticCard({
  candidate,
  styles,
}: {
  candidate: Candidate;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={[styles.card, styles.cardBehind]}>
      <Image source={{ uri: candidate.photos[0] }} style={styles.cardPhoto} contentFit="cover" />
      <View style={styles.info}>
        <AppText style={styles.nameAge}>
          {candidate.displayName}  {candidate.age}
        </AppText>
      </View>
    </View>
  );
}

const createStyles = (theme: ITheme, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900], paddingTop: insets.top },
    cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: CARD_MARGIN },
    card: {
      position: 'absolute',
      width: SCREEN_W - CARD_MARGIN * 2,
      height: SCREEN_H * 0.62,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.color.neutral[800],
    },
    cardBehind: { transform: [{ scale: 0.95 }, { translateY: -8 }] },
    cardPhoto: { ...StyleSheet.absoluteFillObject },
    photoDots: {
      position: 'absolute', top: 12, left: 0, right: 0,
      flexDirection: 'row', justifyContent: 'center', gap: 4, zIndex: 10,
    },
    photoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
    photoDotActive: { backgroundColor: '#fff', width: 18 },
    info: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: 16, paddingBottom: 20,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    nameAge: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    distanceText: { fontSize: 14, color: '#ccc' },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    tag: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
    tagText: { fontSize: 12, color: '#fff' },
    stamp: { position: 'absolute', top: 50, borderWidth: 4, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, zIndex: 20 },
    stampLike: { right: 20, borderColor: '#4ADE80', transform: [{ rotate: '-15deg' }] },
    stampLikeText: { fontSize: 32, fontWeight: '900', color: '#4ADE80' },
    stampNope: { left: 20, borderColor: '#FF6B6B', transform: [{ rotate: '15deg' }] },
    stampNopeText: { fontSize: 32, fontWeight: '900', color: '#FF6B6B' },
    actions: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
      gap: 24, paddingVertical: 16, paddingBottom: insets.bottom + 8,
    },
    actionBtn: {
      width: 56, height: 56, borderRadius: 28, borderWidth: 2,
      alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.neutral[800],
    },
    actionPass: { borderColor: '#FF6B6B' },
    actionLike: { width: 64, height: 64, borderRadius: 32, borderColor: '#4ADE80' },
    actionSuperLike: { borderColor: '#6C63FF' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.color.textColor.white, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: theme.color.neutral[400], marginTop: 8 },
  });
