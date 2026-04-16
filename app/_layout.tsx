import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'api/axios/queryClient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configureLocalization, fallBackLanguage } from 'localization/index';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ThemeProvider from 'theme/index';
import ZustandPersist from 'zustand/persist';

export default function RootLayout() {
  useEffect(() => {
    const savedLanguage = ZustandPersist.getState()?.Localization || fallBackLanguage;
    configureLocalization(savedLanguage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="OnboardingStack" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
