import { Ionicons } from '@expo/vector-icons';
import { AppText } from 'components/text/AppText';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const profile = ZustandPersist(useShallow((s) => s.userProfile));
  const prefs = ZustandPersist(useShallow((s) => s.userProfile?.matchPreferences));
  // const themeMode = ZustandPersist(useShallow((s) => s.ThemeApp));
  // const lang = ZustandPersist(useShallow((s) => s.Localization));
  // const isDark = themeMode !== ModeTheme.Light;
  // const isVietnamese = lang === LANGUAGES.VIETNAMESE;
  // const toggleTheme = () => {
  //   const next = isDark ? ModeTheme.Light : ModeTheme.Dark;
  //   ZustandPersist.getState().save('ThemeApp', next);
  //   theme.changeTheme(next);
  // };
  // const toggleLanguage = () => {
  //   const next = isVietnamese ? LANGUAGES.ENGLISH : LANGUAGES.VIETNAMESE;
  //   changeLanguage(next);
  // };

  const handleLogout = () => {
    ZustandPersist.getState().clearProfile();
    ZustandPersist.getState().logout();
    router.replace('/SignInScreen' as any);
  };

  const age = useMemo(() => {
    if (!profile?.birthDate) return null;
    const bd = new Date(profile.birthDate);
    const today = new Date();
    let a = today.getFullYear() - bd.getFullYear();
    const md = today.getMonth() - bd.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < bd.getDate())) a--;
    return a;
  }, [profile?.birthDate]);

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppText style={styles.emptyText}>No profile data</AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Photos carousel */}
      {profile.photos?.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.photoCarousel}>
          {profile.photos.map((p) => (
            <Image key={p.id} source={{ uri: p.uri }} style={styles.photo} contentFit="cover" />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="person" size={64} color={theme.color.neutral[600]} />
        </View>
      )}

      {/* Profile info */}
      <View style={styles.infoSection}>
        <AppText style={styles.name}>
          {profile.displayName}{age ? `, ${age}` : ''}
        </AppText>
        {profile.zodiac && (
          <View style={styles.row}>
            <Ionicons name="star-outline" size={16} color={theme.color.primary[500]} />
            <AppText style={styles.infoText}>{profile.zodiac}</AppText>
          </View>
        )}
        {profile.gender && (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={16} color={theme.color.neutral[400]} />
            <AppText style={styles.infoText}>{profile.gender}</AppText>
          </View>
        )}
      </View>

      {/* Preferences */}
      {prefs && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Preferences</AppText>
          <InfoRow icon="heart-outline" label="Looking for" value={prefs.lookingFor} theme={theme} />
          <InfoRow icon="calendar-outline" label="Age range" value={`${prefs.ageMin} - ${prefs.ageMax}`} theme={theme} />
          <InfoRow icon="location-outline" label="Distance" value={`${prefs.maxDistanceKm} km`} theme={theme} />
          <InfoRow icon="people-outline" label="Relationship" value={prefs.relationshipType} theme={theme} />
        </View>
      )}

      {/* Interests */}
      {profile.interests?.length > 0 && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Interests</AppText>
          <View style={styles.tags}>
            {profile.interests.flatMap((a) =>
              a.selectedOptions.map((opt) => (
                <View key={`${a.questionId}-${opt}`} style={styles.tag}>
                  <AppText style={styles.tagText}>{opt}</AppText>
                </View>
              )),
            )}
          </View>
        </View>
      )}

      {/* Settings — hidden until DAT-012 is implemented */}
      {/* <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Settings</AppText>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={theme.color.neutral[400]} />
            <AppText style={styles.settingText}>Dark mode</AppText>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.color.primary[500] }} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="language" size={20} color={theme.color.neutral[400]} />
            <AppText style={styles.settingText}>Vietnamese</AppText>
          </View>
          <Switch value={isVietnamese} onValueChange={toggleLanguage} trackColor={{ true: theme.color.primary[500] }} />
        </View>
      </View> */}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        <AppText style={styles.logoutText}>Log out</AppText>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: ITheme;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 }}>
      <Ionicons name={icon} size={18} color={theme.color.neutral[400]} />
      <AppText style={{ fontSize: 14, color: theme.color.neutral[400], width: 100 }}>{label}</AppText>
      <AppText style={{ fontSize: 14, color: theme.color.textColor.white, flex: 1 }}>{value}</AppText>
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900] },
    scrollContent: { paddingBottom: 40 },
    emptyText: { fontSize: 16, color: theme.color.neutral[400], textAlign: 'center', marginTop: 60 },
    photoCarousel: { height: 300 },
    photo: { width: Dimensions.get('window').width, height: 300 },
    photoPlaceholder: {
      height: 200, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.color.neutral[800],
    },
    infoSection: { padding: 20 },
    name: { fontSize: 28, fontWeight: 'bold', color: theme.color.textColor.white, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    infoText: { fontSize: 15, color: theme.color.neutral[300] },
    section: { paddingHorizontal: 20, marginTop: 16 },
    sectionTitle: {
      fontSize: 18, fontWeight: '700', color: theme.color.textColor.white,
      marginBottom: 12, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: theme.color.neutral[700],
    },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
      backgroundColor: `${theme.color.primary[500]}20`, borderRadius: 16,
      paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.color.primary[500],
    },
    tagText: { fontSize: 13, color: theme.color.primary[500] },
    settingRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 12,
    },
    settingLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    settingText: { fontSize: 15, color: theme.color.textColor.white },
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, marginTop: 32, marginHorizontal: 20, paddingVertical: 14,
      borderRadius: 12, borderWidth: 1.5, borderColor: '#FF6B6B',
    },
    logoutText: { fontSize: 16, fontWeight: '600', color: '#FF6B6B' },
  });
