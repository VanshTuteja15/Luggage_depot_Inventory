import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, Input, Select, Text } from '@/components/ui';
import { colors, spacing, touchTarget } from '@/constants/theme';
import type { Location } from '@/types/domain';
import type { MultiVariantProductFormValues, VariantEntryFormValues } from '@/schemas/forms';
import { generateSuggestedBarcode } from '@/services/catalog';

type VariantFieldsProps = {
  index: number;
  control: Control<MultiVariantProductFormValues> | Control<{ variants: VariantEntryFormValues[] }>;
  errors: FieldErrors<MultiVariantProductFormValues> | FieldErrors<{ variants: VariantEntryFormValues[] }>;
  locations: Location[];
  onRemove?: () => void;
  canRemove: boolean;
  showInitialStock?: boolean;
};

export function createEmptyVariantEntry(): VariantEntryFormValues {
  return {
    color: '',
    size: '',
    sku: '',
    barcode: generateSuggestedBarcode(),
    landedCost: '0',
    retailPrice: '0',
    reorderPoint: '5',
    threshold: '3',
    active: true,
    initialStock: {},
  };
}

export function VariantEntryFields({
  index,
  control,
  errors,
  locations,
  onRemove,
  canRemove,
  showInitialStock = true,
}: VariantFieldsProps) {
  const variantErrors = (errors as FieldErrors<MultiVariantProductFormValues>).variants?.[index];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="label">Variant {index + 1}</Text>
        {canRemove && onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove variant ${index + 1}`}
            onPress={onRemove}
            style={styles.removeButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        ) : null}
      </View>

      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.color`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Color"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={variantErrors?.color?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.size`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Size"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={variantErrors?.size?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.sku`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="SKU"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="characters"
            error={variantErrors?.sku?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.barcode`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Barcode (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={variantErrors?.barcode?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.landedCost`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Landed cost"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            error={variantErrors?.landedCost?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.retailPrice`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Retail price"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            error={variantErrors?.retailPrice?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.reorderPoint`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Reorder point"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            error={variantErrors?.reorderPoint?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.threshold`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Low-stock threshold"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            error={variantErrors?.threshold?.message}
          />
        )}
      />
      <Controller
        control={control as Control<MultiVariantProductFormValues>}
        name={`variants.${index}.active`}
        render={({ field: { onChange, value } }) => (
          <Select
            label="Status"
            value={value ? 'active' : 'inactive'}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            onChange={(next) => onChange(next === 'active')}
          />
        )}
      />

      {showInitialStock ? (
        <View style={styles.stockSection}>
          <Text variant="caption" color={colors.textSecondary}>
            Initial stock per location (optional)
          </Text>
          {locations.map((location) => (
            <Controller
              key={location.id}
              control={control as Control<MultiVariantProductFormValues>}
              name={`variants.${index}.initialStock.${location.id}`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label={location.name}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={value ?? ''}
                  onChangeText={onChange}
                />
              )}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockSection: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
