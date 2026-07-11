import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button, Card, Header, Input, ScreenContainer, Select, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getDataStore } from '@/repositories';
import { transferStockFormSchema, type TransferStockFormValues } from '@/schemas/forms';
import {
  getAvailableTransferQuantity,
  getStockOperationFormOptions,
  StockOperationError,
  transferStock,
} from '@/services/inventory';

function route(path: string): Href {
  return path as Href;
}

type TransferStockViewProps = {
  initialVariantId?: string;
};

export function TransferStockView({ initialVariantId }: TransferStockViewProps = {}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formOptions = useMemo(() => {
    getDataStore();
    return getStockOperationFormOptions();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockFormSchema),
    defaultValues: {
      variantId: initialVariantId ?? '',
      fromLocationId: '',
      toLocationId: '',
      quantity: '',
      reason: '',
    },
  });

  const variantId = watch('variantId');
  const fromLocationId = watch('fromLocationId');
  const toLocationId = watch('toLocationId');
  const quantityValue = watch('quantity');

  const availableQuantity = useMemo(() => {
    if (!variantId || !fromLocationId) return null;
    return getAvailableTransferQuantity(variantId, fromLocationId);
  }, [variantId, fromLocationId]);

  const inlineErrors = useMemo(() => {
    const next: Partial<Record<keyof TransferStockFormValues, string>> = {};
    if (fromLocationId && toLocationId && fromLocationId === toLocationId) {
      next.toLocationId = 'From and to locations must be different';
    }
    const qty = Number(quantityValue);
    if (quantityValue.trim() && Number.isFinite(qty) && qty > 0 && availableQuantity !== null) {
      if (qty > availableQuantity) {
        next.quantity = `Only ${availableQuantity} units available at source location`;
      }
    }
    return next;
  }, [fromLocationId, toLocationId, quantityValue, availableQuantity]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (values.fromLocationId === values.toLocationId) {
      setError('toLocationId', { message: 'From and to locations must be different' });
      return;
    }

    const quantity = Number(values.quantity);
    const available = getAvailableTransferQuantity(values.variantId, values.fromLocationId);
    if (quantity > available) {
      setError('quantity', {
        message: `Only ${available} units available at source location`,
      });
      return;
    }

    try {
      transferStock(
        values.variantId,
        values.fromLocationId,
        values.toLocationId,
        quantity,
        values.reason.trim()
      );
      router.replace(route(`/inventory/${values.variantId}`));
    } catch (error) {
      setSubmitError(error instanceof StockOperationError ? error.message : 'Transfer failed');
    }
  });

  const locationOptions = formOptions.locations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  return (
    <ScreenContainer>
      <Header
        title="Transfer Stock"
        subtitle="Move inventory between locations with a full audit trail"
        showBack
      />

      <Card style={styles.section}>
        <Controller
          control={control}
          name="variantId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Product variant"
              placeholder="Select variant"
              value={value}
              options={formOptions.variants}
              onChange={onChange}
              error={errors.variantId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="fromLocationId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="From location"
              placeholder="Select source"
              value={value}
              options={locationOptions}
              onChange={onChange}
              error={errors.fromLocationId?.message}
            />
          )}
        />

        {availableQuantity !== null ? (
          <Text variant="bodySmall" color={colors.textSecondary}>
            Available at source: {availableQuantity} units
          </Text>
        ) : null}

        <Controller
          control={control}
          name="toLocationId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="To location"
              placeholder="Select destination"
              value={value}
              options={locationOptions}
              onChange={onChange}
              error={errors.toLocationId?.message ?? inlineErrors.toLocationId}
            />
          )}
        />

        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Quantity"
              placeholder="Units to transfer"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              error={errors.quantity?.message ?? inlineErrors.quantity}
            />
          )}
        />

        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Reason"
              placeholder="Why is stock being transferred?"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              error={errors.reason?.message}
            />
          )}
        />
      </Card>

      {submitError ? (
        <Text variant="body" color={colors.error} style={styles.error}>
          {submitError}
        </Text>
      ) : null}

      <Button
        label="Transfer Stock"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          Boolean(inlineErrors.toLocationId) ||
          Boolean(inlineErrors.quantity)
        }
        fullWidth
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: spacing.md,
  },
});
