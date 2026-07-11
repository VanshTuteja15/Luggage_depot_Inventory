import { useLocalSearchParams } from 'expo-router';

import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui';
import { ProductFormView } from '@/features/product-form';
import { useVariantDetail } from '@/features/product-detail';

export default function EditProductScreen() {
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

  return <ProductFormView mode="edit" variantId={variantId} initialDetail={detail} />;
}
