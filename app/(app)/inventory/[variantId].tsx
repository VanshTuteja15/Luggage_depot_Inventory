import { useLocalSearchParams } from 'expo-router';

import { VariantDetailView } from '@/features/product-detail';

export default function VariantDetailScreen() {
  const { variantId } = useLocalSearchParams<{ variantId: string }>();
  return <VariantDetailView variantId={variantId ?? ''} />;
}
