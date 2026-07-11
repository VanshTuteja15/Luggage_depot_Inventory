import { useLocalSearchParams } from 'expo-router';

import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui';
import { useVariantDetail } from '@/features/product-detail';
import { StockAdjustFormView } from '@/features/stock-operations';
import { formatVariantLabel } from '@/services/inventory';

export default function AdjustStockScreen() {
  const { variantId, locationId, qty } = useLocalSearchParams<{
    variantId: string;
    locationId: string;
    qty?: string;
  }>();
  const { detail, loading, error } = useVariantDetail(variantId);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState message="Loading product..." />
      </ScreenContainer>
    );
  }

  if (error || !detail || !locationId) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message={error ?? 'Product or location not found.'} />
      </ScreenContainer>
    );
  }

  const locationRow = detail.inventoryByLocation.find((row) => row.locationId === locationId);
  if (!locationRow) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message="Location not found for this variant." />
      </ScreenContainer>
    );
  }

  const currentQuantity =
    qty !== undefined && !Number.isNaN(Number(qty)) ? Number(qty) : locationRow.quantity;

  return (
    <StockAdjustFormView
      variantId={detail.variant.id}
      locationId={locationId}
      locationName={locationRow.locationName}
      productName={detail.product.name}
      variantLabel={formatVariantLabel(detail.variant.color, detail.variant.size)}
      currentQuantity={currentQuantity}
    />
  );
}
