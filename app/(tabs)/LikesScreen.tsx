import { Ionicons } from '@expo/vector-icons';
import { AppText } from 'components/text/AppText';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_CANDIDATES, Candidate } from 'src/data/mockCandidates';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 4;
const GRID_COLS = 3;
const CELL_SIZE = (SCREEN_W - 24 * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

// Mock "liked me" profiles — fixed set of candidate ids that pretend to like the user.
const LIKED_ME_IDS = ALL_CANDIDATES.slice(5, 15).map((c) => c.id);

const candidateMap = new Map(ALL_CANDIDATES.map((c) => [c.id, c]));

function lookupCandidates(ids: string[]): Candidate[] {
  const result: Candidate[] = [];
  for (const id of ids) {
    const c = candidateMap.get(id);
    if (c) result.push(c);
  }
  return result;
}

type Tab = 'liked' | 'likedMe';

export default function LikesScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<Tab>('liked');

  const iLikedRaw = ZustandPersist(useShallow((s) => s.iLiked));
  const iLiked = useMemo(() => iLikedRaw ?? [], [iLikedRaw]);

  const likedProfiles = useMemo(() => lookupCandidates(iLiked), [iLiked]);
  const likedMeProfiles = useMemo(() => lookupCandidates(LIKED_ME_IDS), []);

  const renderThumbnail = useMemo(
    () =>
      ({ item }: { item: Candidate }) => (
        <View style={styles.cell}>
          <Image source={{ uri: item.photos[0] }} style={styles.cellPhoto} contentFit="cover" />
          <View style={styles.cellInfo}>
            <AppText style={styles.cellName} numberOfLines={1}>
              {item.displayName}, {item.age}
            </AppText>
          </View>
        </View>
      ),
    [styles],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppText style={styles.header}>Likes</AppText>

      {/* Sub-tab pills */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.pill, activeTab === 'liked' && styles.pillActive]}
          onPress={() => setActiveTab('liked')}
        >
          <AppText style={[styles.pillText, activeTab === 'liked' && styles.pillTextActive]}>
            I Liked ({likedProfiles.length})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, activeTab === 'likedMe' && styles.pillActive]}
          onPress={() => setActiveTab('likedMe')}
        >
          <AppText style={[styles.pillText, activeTab === 'likedMe' && styles.pillTextActive]}>
            Liked Me ({likedMeProfiles.length})
          </AppText>
        </TouchableOpacity>
      </View>

      {activeTab === 'liked' ? (
        likedProfiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={56} color={theme.color.neutral[600]} />
            <AppText style={styles.emptyTitle}>No likes yet</AppText>
            <AppText style={styles.emptySubtitle}>Start swiping to find your match</AppText>
          </View>
        ) : (
          <FlatList
            data={likedProfiles}
            keyExtractor={(c) => c.id}
            numColumns={GRID_COLS}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            renderItem={renderThumbnail}
          />
        )
      ) : (
        <View style={styles.gridWrapper}>
          <FlatList
            data={likedMeProfiles}
            keyExtractor={(c) => c.id}
            numColumns={GRID_COLS}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            renderItem={renderThumbnail}
          />
          {/* Paywall overlay */}
          <View style={styles.paywall}>
            <View style={styles.paywallCard}>
              <Ionicons name="lock-closed" size={40} color={theme.color.primary[500]} />
              <AppText style={styles.paywallTitle}>See who likes you</AppText>
              <AppText style={styles.paywallSubtitle}>
                Upgrade to instantly see everyone who has liked your profile
              </AppText>
              <TouchableOpacity style={styles.paywallBtn} activeOpacity={0.8}>
                <AppText style={styles.paywallBtnText}>Upgrade</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    header: {
      fontSize: 28, fontWeight: 'bold', color: theme.color.textColor.white,
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
    },
    tabRow: {
      flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16,
    },
    pill: {
      paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
      backgroundColor: theme.color.neutral[800],
    },
    pillActive: {
      backgroundColor: theme.color.primary[500],
    },
    pillText: {
      fontSize: 14, fontWeight: '600', color: theme.color.neutral[400],
    },
    pillTextActive: {
      color: theme.color.white,
    },
    grid: { paddingHorizontal: 24, paddingBottom: 20 },
    gridRow: { gap: GRID_GAP, marginBottom: GRID_GAP },
    cell: {
      width: CELL_SIZE, height: CELL_SIZE * 1.35, borderRadius: 10, overflow: 'hidden',
      backgroundColor: theme.color.neutral[800],
    },
    cellPhoto: { ...StyleSheet.absoluteFillObject },
    cellInfo: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: 6, backgroundColor: 'rgba(0,0,0,0.55)',
      borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    },
    cellName: { fontSize: 11, fontWeight: '600', color: '#fff' },
    gridWrapper: { flex: 1 },
    paywall: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    paywallCard: {
      backgroundColor: theme.color.neutral[800],
      borderRadius: 20, padding: 28, alignItems: 'center',
      borderWidth: 1, borderColor: theme.color.neutral[700],
    },
    paywallTitle: {
      fontSize: 20, fontWeight: '700', color: theme.color.textColor.white,
      marginTop: 16, marginBottom: 8,
    },
    paywallSubtitle: {
      fontSize: 14, color: theme.color.neutral[400], textAlign: 'center', lineHeight: 20,
    },
    paywallBtn: {
      marginTop: 20, backgroundColor: theme.color.primary[500],
      paddingVertical: 12, paddingHorizontal: 40, borderRadius: 24,
    },
    paywallBtnText: {
      fontSize: 16, fontWeight: '700', color: theme.color.white,
    },
    emptyState: {
      flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18, fontWeight: '700', color: theme.color.textColor.white, marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14, color: theme.color.neutral[400], marginTop: 8, textAlign: 'center',
    },
  });
