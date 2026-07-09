import type { Href } from 'expo-router';

export type NavItem = {
  label: string;
  href: Href;
  icon: string;
  description: string;
  /** Route segment used for active-state matching in the drawer */
  segment: string;
};

export const APP_NAME = 'Luggage Depot OS';
export const APP_TAGLINE = 'Inventory, pricing & AI ordering';

/** Typed-route-safe href helper until Expo regenerates route types */
function route(path: string): Href {
  return path as Href;
}

export const APP_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: route('/'),
    icon: 'grid-outline',
    description: 'Overview and key metrics',
    segment: 'index',
  },
  {
    label: 'Inventory',
    href: route('/inventory'),
    icon: 'cube-outline',
    description: 'Products, stock, and filters',
    segment: 'inventory',
  },
  {
    label: 'Pricing',
    href: route('/pricing'),
    icon: 'pricetag-outline',
    description: 'Landed cost and retail price',
    segment: 'pricing',
  },
  {
    label: 'Reports',
    href: route('/reports'),
    icon: 'bar-chart-outline',
    description: 'Margins, profit, and insights',
    segment: 'reports',
  },
  {
    label: 'Forecast & Orders',
    href: route('/forecast'),
    icon: 'trending-up-outline',
    description: 'AI sales forecasting and ordering',
    segment: 'forecast',
  },
  {
    label: 'Locations',
    href: route('/locations'),
    icon: 'location-outline',
    description: 'Calgary store locations',
    segment: 'locations',
  },
  {
    label: 'Import / Export',
    href: route('/import-export'),
    icon: 'document-text-outline',
    description: 'CSV inventory sync',
    segment: 'import-export',
  },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/';

  if (item.segment === 'index') {
    return normalized === '/' || normalized === '/index';
  }

  return normalized === `/${item.segment}` || normalized.startsWith(`/${item.segment}/`);
}
