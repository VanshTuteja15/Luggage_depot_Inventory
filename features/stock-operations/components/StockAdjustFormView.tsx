import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button, Card, Header, Input, ScreenContainer, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { stockAdjustFormSchema, type StockAdjustFormValues } from '@/schemas/forms';
import {
  adjustInventoryQuantity,
  previewAdjustmentQuantity,
  StockOperationError,
} from '@/services/inventory';

type StockAdjustFormViewProps = {
  variantId: string;
  locationId: string;
  locationName: string;
  productName: string;
  variantLabel: string;
  currentQuantity: number;
};

function route(path: string): Href {
  return path as Href;
}

export function StockAdjustFormView({
  variantId,
  locationId,
  locationName,
  productName,
  variantLabel,
  currentQuantity,
}: StockAdjustFormViewProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustFormSchema),
    defaultValues: { change: '', reason: '' },
  });

  const changeValue = watch('change');
  const parsedChange = useMemo(() => {
    const num = Number(changeValue);
    return Number.isFinite(num) ? num : null;
  }, [changeValue]);

  const resultingQuantity = useMemo(() => {
    if (parsedChange === null) return null;
    return previewAdjustmentQuantity(currentQuantity, parsedChange);
  }, [currentQuantity, parsedChange]);

  const quantityPreviewError = useMemo(() => {
    if (parsedChange === null || changeValue.trim() === '') return null;
    if (parsedChange === 0) return 'Change cannot be zero';
    if (resultingQuantity !== null && resultingQuantity < 0) {
      return `Resulting quantity would be ${resultingQuantity} — cannot go below zero`;
    }
    return null;
  }, [changeValue, parsedChange, resultingQuantity]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setResultError(null);

    const change = Number(values.change);
    const preview = previewAdjustmentQuantity(currentQuantity, change);
    if (preview < 0) {
      setResultError(`Resulting quantity would be ${preview} — cannot go below zero`);
      return;
    }

    try {
      adjustInventoryQuantity(variantId, locationId, change, values.reason.trim());
      router.replace(route(`/inventory/${variantId}`));
    } catch (error) {
      setSubmitError(error instanceof StockOperationError ? error.message : 'Adjustment failed');
    }
  });

  return (
    <ScreenContainer>
      <Header
        title="Adjust Stock"
        subtitle={`${productName} · ${variantLabel} · ${locationName}`}
        showBack
      />

      <Card style={styles.section}>
        <Text variant="label">Current quantity</Text>
        <Text variant="h2">{currentQuantity} units</Text>
      </Card>

      <Card style={styles.section}>
        <Controller
          control={control}
          name="change"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Quantity change"
              placeholder="e.g. +15 or -3"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numbers-and-punctuation"
              error={errors.change?.message ?? quantityPreviewError ?? undefined}
              hint="Use a signed number — positive to add, negative to remove"
            />
          )}
        />

        {resultingQuantity !== null && changeValue.trim() !== '' && !quantityPreviewError ? (
          <Text variant="body" color={colors.textSecondary}>
            Resulting quantity:{' '}
            <Text variant="label">{resultingQuantity} units</Text>
          </Text>
        ) : null}

        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Reason"
              placeholder="Why is stock being adjusted?"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              error={errors.reason?.message}
            />
          )}
        />
      </Card>

      {(submitError || resultError) && !quantityPreviewError ? (
        <Text variant="body" color={colors.error} style={styles.error}>
          {submitError ?? resultError}
        </Text>
      ) : null}

      <Button
        label="Apply Adjustment"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting || Boolean(quantityPreviewError)}
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
