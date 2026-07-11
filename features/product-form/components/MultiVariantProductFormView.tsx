import { useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button, Card, Header, Input, ScreenContainer, Select, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getDataStore } from '@/repositories';
import {
  multiVariantProductFormSchema,
  parseVariantEntry,
  validateVariantEntriesForForm,
  type MultiVariantProductFormValues,
} from '@/schemas/forms';
import {
  createProductWithVariants,
  getCatalogFormOptions,
} from '@/services/catalog';

import { createEmptyVariantEntry, VariantEntryFields } from './VariantEntryFields';

function route(path: string): Href {
  return path as Href;
}

export function MultiVariantProductFormView() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formOptions = useMemo(() => {
    getDataStore();
    return getCatalogFormOptions();
  }, []);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MultiVariantProductFormValues>({
    resolver: zodResolver(multiVariantProductFormSchema),
    defaultValues: {
      name: '',
      brandId: '',
      categoryId: '',
      supplierId: '',
      description: '',
      notes: '',
      variants: [createEmptyVariantEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const uniquenessErrors = validateVariantEntriesForForm(values.variants);
    Object.entries(uniquenessErrors).forEach(([path, message]) => {
      const [root, index, field] = path.split('.');
      if (root === 'variants' && index && field) {
        setError(`variants.${Number(index)}.${field}` as keyof MultiVariantProductFormValues, {
          message,
        });
      }
    });
    if (Object.keys(uniquenessErrors).length > 0) return;

    try {
      const parsedVariants = values.variants.map(parseVariantEntry);
      const result = createProductWithVariants(
        {
          name: values.name,
          brandId: values.brandId,
          categoryId: values.categoryId,
          supplierId: values.supplierId,
          description: values.description,
          notes: values.notes,
        },
        parsedVariants
      );
      router.replace(route(`/inventory/${result.firstVariantId}`));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create product');
    }
  });

  return (
    <ScreenContainer>
      <Header
        title="Add Product"
        subtitle="Create one product with multiple color/size variants"
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
              options={formOptions.brands.map((b) => ({ label: b.name, value: b.id }))}
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
              options={formOptions.categories.map((c) => ({ label: c.name, value: c.id }))}
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
              options={formOptions.suppliers.map((s) => ({ label: s.name, value: s.id }))}
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

      <View style={styles.variantHeader}>
        <Text variant="h3">Variants</Text>
        <Button
          label="Add variant"
          variant="outline"
          onPress={() => append(createEmptyVariantEntry())}
        />
      </View>

      {fields.map((field, index) => (
        <VariantEntryFields
          key={field.id}
          index={index}
          control={control}
          errors={errors}
          locations={formOptions.locations}
          canRemove={fields.length > 1}
          onRemove={() => remove(index)}
        />
      ))}

      {submitError ? (
        <Text variant="body" color={colors.error} style={styles.error}>
          {submitError}
        </Text>
      ) : null}

      <Button
        label="Create Product"
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
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  error: {
    marginBottom: spacing.md,
  },
});
