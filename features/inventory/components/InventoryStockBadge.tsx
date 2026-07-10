import { Badge } from '@/components/ui';
import type { VariantStockStatus } from '@/types/domain';
import {
  stockStatusBadgeIcon,
  stockStatusBadgeVariant,
  stockStatusLabel,
} from '@/services/inventory';

type InventoryStockBadgeProps = {
  status: VariantStockStatus;
};

export function InventoryStockBadge({ status }: InventoryStockBadgeProps) {
  return (
    <Badge
      label={stockStatusLabel(status)}
      variant={stockStatusBadgeVariant(status)}
      icon={stockStatusBadgeIcon(status)}
    />
  );
}
