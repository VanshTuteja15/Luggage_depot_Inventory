import { useLocalSearchParams } from 'expo-router';

import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui';
import { useVariantDetail } from '@/features/product-detail';
import { AddVariantsFormView } from '@/features/product-form';

export default function AddVariantsScreen() {
  const { variantId } = useLocalSearchParams<{ variantId: string }>();
  const { detail, loading, error } = useVariantDetail(variantId);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState message="Loading product..." />
      </ScreenContainer>
    );
  }

  if (error || !detail) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message={error ?? 'Product not found.'} />
      </ScreenContainer>
    );
  }

  return <AddVariantsFormView productDetail={detail} />;
}
