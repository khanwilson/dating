import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { AppText } from 'components/text/AppText';
import { RelationshipType } from 'constants/enum';
import { Image } from 'expo-image';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_CANDIDATES, Candidate } from 'src/data/mockCandidates';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';

const { width: SCREEN_W } = Dimensions.get('window');
const MINI_W = 120;
const MINI_H = 160;

interface Section {
  title: string;
  data: Candidate[];
}

function buildSections(): Section[] {
  const byRelType: Record<string, Candidate[]> = {};
  const byInterest: Record<string, Candidate[]> = {};

  for (const c of ALL_CANDIDATES) {
    const rt = c.relationshipType;
    if (!byRelType[rt]) byRelType[rt] = [];
    byRelType[rt].push(c);

    for (const interest of c.interests) {
      if (!byInterest[interest]) byInterest[interest] = [];
      byInterest[interest].push(c);
    }
  }

  const relLabels: Record<string, string> = {
    [RelationshipType.ShortTerm]: 'Looking for short-term',
    [RelationshipType.LongTerm]: 'Looking for long-term',
    [RelationshipType.Friends]: 'Just looking for friends',
  };

  const sections: Section[] = [];
  for (const [key, label] of Object.entries(relLabels)) {
    if (byRelType[key]?.length) sections.push({ title: label, data: byRelType[key] });
  }

  const sortedInterests = Object.entries(byInterest)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 2);
  for (const [interest, candidates] of sortedInterests) {
    sections.push({ title: `Into ${interest}`, data: candidates });
  }

  return sections;
}

export default function DiscoverScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sections = useMemo(buildSections, []);

  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const openDetail = useCallback((c: Candidate) => {
    setSelectedCandidate(c);
    sheetRef.current?.present();
  }, []);

  const handleAction = useCallback((dir: 'like' | 'pass') => {
    if (!selectedCandidate) return;
    if (dir === 'like') ZustandPersist.getState().addLiked(selectedCandidate.id);
    else ZustandPersist.getState().addPassed(selectedCandidate.id);
    sheetRef.current?.dismiss();
    setSelectedCandidate(null);
  }, [selectedCandidate]);

  const renderMiniCard = useCallback(
    ({ item }: { item: Candidate }) => (
      <TouchableOpacity style={styles.miniCard} onPress={() => openDetail(item)} activeOpacity={0.8}>
        <Image source={{ uri: item.photos[0] }} style={styles.miniPhoto} contentFit="cover" />
        <View style={styles.miniInfo}>
          <AppText style={styles.miniName} numberOfLines={1}>
            {item.displayName}, {item.age}
          </AppText>
        </View>
      </TouchableOpacity>
    ),
    [styles, openDetail],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppText style={styles.header}>Discover</AppText>

      <FlatList
        data={sections}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{section.title}</AppText>
            <FlatList
              data={section.data}
              keyExtractor={(c) => `${section.title}-${c.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={renderMiniCard}
            />
          </View>
        )}
      />

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['80%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.color.neutral[900] }}
        handleIndicatorStyle={{ backgroundColor: theme.color.neutral[600] }}
      >
        {selectedCandidate && (
          <BottomSheetScrollView contentContainerStyle={styles.detailContent}>
            <Image
              source={{ uri: selectedCandidate.photos[0] }}
              style={styles.detailPhoto}
              contentFit="cover"
            />
            <View style={styles.detailInfo}>
              <AppText style={styles.detailName}>
                {selectedCandidate.displayName}, {selectedCandidate.age}
              </AppText>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#999" />
                <AppText style={styles.detailSubtext}>
                  {selectedCandidate.distance} km away
                </AppText>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="star-outline" size={16} color="#999" />
                <AppText style={styles.detailSubtext}>{selectedCandidate.zodiac}</AppText>
              </View>
              {selectedCandidate.bio ? (
                <AppText style={styles.detailBio}>{selectedCandidate.bio}</AppText>
              ) : null}
              <View style={styles.detailTags}>
                {selectedCandidate.interests.map((t) => (
                  <View key={t} style={styles.detailTag}>
                    <AppText style={styles.detailTagText}>{t}</AppText>
                  </View>
                ))}
              </View>
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailBtn, { borderColor: '#FF6B6B' }]}
                  onPress={() => handleAction('pass')}
                >
                  <Ionicons name="close" size={24} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailBtn, { borderColor: '#4ADE80' }]}
                  onPress={() => handleAction('like')}
                >
                  <Ionicons name="heart" size={24} color="#4ADE80" />
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>
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
    scrollContent: { paddingBottom: 20 },
    section: { marginTop: 20 },
    sectionTitle: {
      fontSize: 18, fontWeight: '700', color: theme.color.textColor.white,
      paddingHorizontal: 20, marginBottom: 12,
    },
    horizontalList: { paddingHorizontal: 16, gap: 10 },
    miniCard: {
      width: MINI_W, height: MINI_H, borderRadius: 12, overflow: 'hidden',
      backgroundColor: theme.color.neutral[800],
    },
    miniPhoto: { ...StyleSheet.absoluteFillObject },
    miniInfo: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: 8, backgroundColor: 'rgba(0,0,0,0.55)',
      borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    },
    miniName: { fontSize: 12, fontWeight: '600', color: '#fff' },
    detailContent: { paddingBottom: 40 },
    detailPhoto: { width: SCREEN_W, height: SCREEN_W * 1.1, backgroundColor: theme.color.neutral[800] },
    detailInfo: { padding: 20 },
    detailName: { fontSize: 26, fontWeight: 'bold', color: theme.color.textColor.white, marginBottom: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    detailSubtext: { fontSize: 14, color: theme.color.neutral[400] },
    detailBio: { fontSize: 15, color: theme.color.textColor.white, marginTop: 12, lineHeight: 22 },
    detailTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
    detailTag: {
      backgroundColor: `${theme.color.primary[500]}20`, borderRadius: 16,
      paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.color.primary[500],
    },
    detailTagText: { fontSize: 13, color: theme.color.primary[500] },
    detailActions: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 24 },
    detailBtn: {
      width: 56, height: 56, borderRadius: 28, borderWidth: 2,
      alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.neutral[800],
    },
  });
