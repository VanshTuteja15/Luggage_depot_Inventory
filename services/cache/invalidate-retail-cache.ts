import { clearVariantViewsCache } from '@/services/filter';
import { clearDashboardCache } from '@/services/dashboard';

/** Invalidate derived caches after repository mutations */
export function invalidateRetailCaches(): void {
  clearVariantViewsCache();
  clearDashboardCache();
}
