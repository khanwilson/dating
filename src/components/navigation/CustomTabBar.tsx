import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppText } from 'components/text/AppText';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';

const TAB_CONFIG: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'Swipe', icon: 'heart-outline', iconFocused: 'heart' },
  { name: 'Discover', icon: 'compass-outline', iconFocused: 'compass' },
  { name: 'Likes', icon: 'star-outline', iconFocused: 'star' },
  { name: 'Chat', icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
  { name: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const renderTab = useCallback(
    (index: number, isFocused: boolean) => {
      const tab = TAB_CONFIG[index];
      if (!tab) return null;
      const iconName = isFocused ? tab.iconFocused : tab.icon;
      const color = isFocused ? theme.color.primary[500] : theme.color.neutral[400];

      return (
        <View style={styles.tabContent}>
          <Ionicons name={iconName} size={22} color={color} />
          <AppText style={[styles.tabLabel, { color }]}>{tab.name}</AppText>
        </View>
      );
    },
    [theme, styles],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.color.bg.white,
          borderTopColor: theme.color.stroke,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tab}
          >
            {renderTab(index, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderTopWidth: 0.5,
      paddingTop: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    tabLabel: {
      fontSize: theme.fontSize.p12,
      fontWeight: '500',
    },
  });
