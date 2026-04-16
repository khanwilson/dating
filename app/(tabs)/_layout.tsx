import { CustomTabBar } from 'components/navigation/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="SwipeScreen" />
      <Tabs.Screen name="DiscoverScreen" />
      <Tabs.Screen name="LikesScreen" />
      <Tabs.Screen name="ChatScreen" />
      <Tabs.Screen name="ProfileScreen" />
    </Tabs>
  );
}
