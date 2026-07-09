import { useEffect, useState } from 'react';

import { getDataStore } from '@/repositories';
import { getDashboardMetrics } from '@/services/dashboard';
import type { DashboardMetrics } from '@/types/domain';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      getDataStore();
      setMetrics(getDashboardMetrics());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard data');
    }
  }, []);

  return {
    metrics,
    loading: metrics === null && error === null,
    error,
  };
}
