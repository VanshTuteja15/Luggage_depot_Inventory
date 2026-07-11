import { useLocalSearchParams } from 'expo-router';

import { TransferStockView } from '@/features/stock-operations';

export default function TransferStockScreen() {
  const { variantId } = useLocalSearchParams<{ variantId?: string }>();
  return <TransferStockView initialVariantId={variantId} />;
}
