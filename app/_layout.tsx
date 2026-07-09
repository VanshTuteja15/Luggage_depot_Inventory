import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { AppProviders } from '@/features/app/providers/AppProviders';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <StatusBar style="dark" />
      </AppProviders>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
