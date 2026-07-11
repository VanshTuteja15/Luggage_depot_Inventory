import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getDataStore } from '@/repositories';
import { getVariantDetail } from '@/services/catalog';
import type { VariantDetail } from '@/types/domain';

export function useVariantDetail(variantId: string | undefined) {
  const [detail, setDetail] = useState<VariantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(() => {
    if (!variantId) {
      setError('Variant ID is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      getDataStore();
      const result = getVariantDetail(variantId);
      if (!result) {
        setError('Variant not found');
        setDetail(null);
      } else {
        setDetail(result);
        setError(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load variant');
    } finally {
      setLoading(false);
    }
  }, [variantId]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  return { detail, loading, error, refresh: loadDetail };
}
