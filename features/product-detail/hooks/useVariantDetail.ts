import { useEffect, useState } from 'react';

import { getDataStore } from '@/repositories';
import { getVariantDetail } from '@/services/catalog';
import type { VariantDetail } from '@/types/domain';

export function useVariantDetail(variantId: string | undefined) {
  const [detail, setDetail] = useState<VariantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!variantId) {
      setError('Variant ID is missing');
      setLoading(false);
      return;
    }

    try {
      getDataStore();
      const result = getVariantDetail(variantId);
      if (!result) {
        setError('Variant not found');
      } else {
        setDetail(result);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load variant');
    } finally {
      setLoading(false);
    }
  }, [variantId]);

  const refresh = () => {
    if (!variantId) return;
    setLoading(true);
    try {
      const result = getVariantDetail(variantId);
      setDetail(result);
      setError(result ? null : 'Variant not found');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load variant');
    } finally {
      setLoading(false);
    }
  };

  return { detail, loading, error, refresh };
}
