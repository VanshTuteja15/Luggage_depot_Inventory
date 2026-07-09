import type { Href } from 'expo-router';

export type NavItem = {
  label: string;
  href: Href;
  icon: string;
  description: string;
};

export const APP_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/(app)',
    icon: 'grid-outline',
    description: 'Overview and recent activity',
  },
  {
    label: 'Inventory',
    href: '/(app)/inventory',
    icon: 'cube-outline',
    description: 'Search and manage products',
  },
  {
    label: 'Locations',
    href: '/(app)/locations',
    icon: 'location-outline',
    description: 'Store locations',
  },
  {
    label: 'Categories',
    href: '/(app)/categories',
    icon: 'pricetags-outline',
    description: 'Product categories',
  },
  {
    label: 'Transfer Stock',
    href: '/(app)/transfer',
    icon: 'swap-horizontal-outline',
    description: 'Move stock between stores',
  },
  {
    label: 'Import / Export',
    href: '/(app)/import-export',
    icon: 'document-text-outline',
    description: 'CSV inventory sync',
  },
  {
    label: 'Reports',
    href: '/(app)/reports',
    icon: 'bar-chart-outline',
    description: 'Inventory insights',
  },
];

export const APP_NAME = 'Luggage Depot OS';
export const APP_TAGLINE = 'Inventory & retail operations';
