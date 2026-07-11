import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button, Card, Header, Input, ScreenContainer, Select, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getDataStore } from '@/repositories';
import {
  addProductFormSchema,
  editProductFormSchema,
  parseProductFormValues,
  type AddProductFormValues,
} from '@/schemas/forms';
import {
  CatalogServiceError,
  createProductWithVariant,
  generateSuggestedBarcode,
  getCatalogFormOptions,
  updateProductWithVariant,
} from '@/services/catalog';
import type { VariantDetail } from '@/types/domain';

type ProductFormViewProps = {
  mode: 'add' | 'edit';
  variantId?: string;
  initialDetail?: VariantDetail | null;
};

function route(path: string): Href {
  return path as Href;
}

const defaultValues: AddProductFormValues = {
  name: '',
  brandId: '',
  categoryId: '',
  supplierId: '',
  description: '',
  notes: '',
  color: '',
  size: '',
  sku: '',
  barcode: generateSuggestedBarcode(),
  landedCost: '0',
  retailPrice: '0',
  reorderPoint: '5',
  threshold: '3',
  active: true,
};

export function ProductFormView({ mode, variantId, initialDetail }: ProductFormViewProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialStock, setInitialStock] = useState<Record<string, string>>({});

  const formOptions = useMemo(() => {
    getDataStore();
    return getCatalogFormOptions();
  }, []);

  const editDefaults = useMemo((): AddProductFormValues | undefined => {
    if (!initialDetail) return undefined;
    const { product, variant } = initialDetail;
    return {
      name: product.name,
      brandId: product.brandId,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      description: product.description,
      notes: product.notes,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      barcode: variant.barcode,
      landedCost: String(variant.landedCost),
      retailPrice: String(variant.retailPrice),
      reorderPoint: String(variant.reorderPoint),
      threshold: String(variant.threshold),
      active: variant.active,
    };
  }, [initialDetail]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProductFormValues>({
    resolver: zodResolver(mode === 'add' ? addProductFormSchema : editProductFormSchema),
    defaultValues: editDefaults ?? defaultValues,
  });

  useEffect(() => {
    if (editDefaults) {
      reset(editDefaults);
    }
  }, [editDefaults, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const parsed = parseProductFormValues(values);
    try {
      if (mode === 'add') {
        const stockByLocation = Object.fromEntries(
          Object.entries(initialStock)
            .map(([locationId, qty]) => [locationId, Number(qty)] as const)
            .filter(([, qty]) => Number.isFinite(qty) && qty > 0)
        );
        const result = createProductWithVariant(parsed, stockByLocation);
        router.replace(route(`/inventory/${result.variantId}`));
        return;
      }

      if (!variantId || !initialDetail) {
        throw new CatalogServiceError('Missing variant context for edit');
      }

      updateProductWithVariant(initialDetail.product.id, variantId, parsed);
      router.replace(route(`/inventory/${variantId}`));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save product');
    }
  });

  return (
    <ScreenContainer>
      <Header
        title={mode === 'add' ? 'Add Product' : 'Edit Product'}
        subtitle={
          mode === 'add'
            ? 'Create a parent product and first variant'
            : 'Update product and variant details'
        }
        showBack
      />

      <Card style={styles.section}>
        <Text variant="h3">Product</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Product name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="brandId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Brand"
              placeholder="Select brand"
              value={value}
              options={formOptions.brands.map((brand) => ({ label: brand.name, value: brand.id }))}
              onChange={onChange}
              error={errors.brandId?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Category"
              placeholder="Select category"
              value={value}
              options={formOptions.categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              onChange={onChange}
              error={errors.categoryId?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="supplierId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Supplier"
              placeholder="Select supplier"
              value={value}
              options={formOptions.suppliers.map((supplier) => ({
                label: supplier.name,
                value: supplier.id,
              }))}
              onChange={onChange}
              error={errors.supplierId?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Description" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Notes" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text variant="h3">Variant</Text>
        <Controller
          control={control}
          name="color"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Color" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.color?.message} />
          )}
        />
        <Controller
          control={control}
          name="size"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Size" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.size?.message} />
          )}
        />
        <Controller
          control={control}
          name="sku"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="SKU"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
              error={errors.sku?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="barcode"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Barcode" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.barcode?.message} />
          )}
        />
        <Controller
          control={control}
          name="landedCost"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Landed cost"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={errors.landedCost?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="retailPrice"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Retail price"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={errors.retailPrice?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="reorderPoint"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Reorder point"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              error={errors.reorderPoint?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="threshold"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Low-stock threshold"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              error={errors.threshold?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="active"
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
      </Card>

      {mode === 'add' ? (
        <Card style={styles.section}>
          <Text variant="h3">Initial Stock (optional)</Text>
          <Text variant="bodySmall" color={colors.textSecondary}>
            Set opening quantities per location. Each entry creates an initial stock movement.
          </Text>
          {formOptions.locations.map((location) => (
            <Input
              key={location.id}
              label={location.name}
              placeholder="0"
              keyboardType="number-pad"
              value={initialStock[location.id] ?? ''}
              onChangeText={(text) =>
                setInitialStock((current) => ({ ...current, [location.id]: text }))
              }
            />
          ))}
        </Card>
      ) : null}

      {submitError ? (
        <Text variant="body" color={colors.error} style={styles.error}>
          {submitError}
        </Text>
      ) : null}

      <Button
        label={mode === 'add' ? 'Create Product' : 'Save Changes'}
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
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
