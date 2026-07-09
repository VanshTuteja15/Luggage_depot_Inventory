import { Pressable, StyleSheet, View } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { usePathname, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { APP_NAME, APP_NAV_ITEMS, APP_TAGLINE } from '@/constants/navigation';
import { colors, spacing, touchTarget } from '@/constants/theme';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (href: Href) => {
    router.push(href);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scroll}
      style={styles.drawer}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Ionicons name="briefcase" size={22} color={colors.textOnDark} />
        </View>
        <View style={styles.brandText}>
          <Text variant="label" color={colors.textOnDark}>
            {APP_NAME}
          </Text>
          <Text variant="bodySmall" color={colors.accentMuted}>
            {APP_TAGLINE}
          </Text>
        </View>
      </View>

      <View style={styles.navSection}>
        {APP_NAV_ITEMS.map((item) => {
          const hrefString = typeof item.href === 'string' ? item.href : String(item.href);
          const routeKey = hrefString.replace('/(app)', '') || '/';
          const isActive =
            pathname === routeKey ||
            pathname === hrefString ||
            (routeKey !== '/' && pathname.startsWith(routeKey.replace(/^\//, '')));

          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${item.label}. ${item.description}`}
              onPress={() => navigate(item.href)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={isActive ? colors.accent : colors.textOnDark}
              />
              <View style={styles.navCopy}>
                <Text variant="label" color={isActive ? colors.textOnDark : colors.textOnDark}>
                  {item.label}
                </Text>
                <Text variant="bodySmall" color={colors.accentMuted}>
                  {item.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: colors.primary,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 240, 0.15)',
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  navSection: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  navItem: {
    minHeight: touchTarget + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(201, 162, 75, 0.18)',
  },
  navItemPressed: {
    backgroundColor: 'rgba(242, 242, 240, 0.08)',
  },
  navCopy: {
    flex: 1,
    gap: 2,
  },
});
