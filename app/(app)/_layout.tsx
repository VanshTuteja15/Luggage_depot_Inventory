import { Pressable, StyleSheet, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
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

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <DrawerToggleButton />
      <Text variant="label" color={colors.textOnDark}>
        {APP_NAME}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        header: () => <AppDrawerHeader />,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: colors.primary,
          width: 300,
        },
      }}>
      <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="inventory/index" options={{ title: 'Inventory' }} />
      <Drawer.Screen name="locations/index" options={{ title: 'Locations' }} />
      <Drawer.Screen name="categories/index" options={{ title: 'Categories' }} />
      <Drawer.Screen name="transfer/index" options={{ title: 'Transfer Stock' }} />
      <Drawer.Screen name="import-export/index" options={{ title: 'Import / Export' }} />
      <Drawer.Screen name="reports/index" options={{ title: 'Reports' }} />
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
  menuButton: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: touchTarget,
  },
});
