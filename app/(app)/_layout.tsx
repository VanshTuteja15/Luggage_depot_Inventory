import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppDrawerContent,
  useDrawerOptions,
} from '@/components/navigation/AppDrawerContent';
import { Text } from '@/components/ui';
import { APP_NAME } from '@/constants/navigation';
import { colors, spacing, touchTarget } from '@/constants/theme';

function DrawerToggleButton() {
  const navigation = useNavigation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open navigation menu"
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.menuButton}>
      <Ionicons name="menu" size={24} color={colors.textOnDark} />
    </Pressable>
  );
}

function AppDrawerHeader() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      {!isLargeScreen ? <DrawerToggleButton /> : <View style={styles.menuButton} />}
      <Text variant="label" color={colors.textOnDark} style={styles.headerTitle}>
        {APP_NAME}
      </Text>
      <View style={styles.menuButton} />
    </View>
  );
}

export default function AppLayout() {
  const drawerOptions = useDrawerOptions();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        header: () => <AppDrawerHeader />,
        ...drawerOptions,
        overlayColor: colors.overlay,
      }}>
      <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="inventory/index" options={{ title: 'Inventory' }} />
      <Drawer.Screen name="transfer/index" options={{ title: 'Transfer Stock' }} />
      <Drawer.Screen name="pricing/index" options={{ title: 'Pricing' }} />
      <Drawer.Screen name="reports/index" options={{ title: 'Reports' }} />
      <Drawer.Screen name="forecast/index" options={{ title: 'Forecast & Orders' }} />
      <Drawer.Screen name="locations/index" options={{ title: 'Locations' }} />
      <Drawer.Screen name="import-export/index" options={{ title: 'Import / Export' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 240, 0.12)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
