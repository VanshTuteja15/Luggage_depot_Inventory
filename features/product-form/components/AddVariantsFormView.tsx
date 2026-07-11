import { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button, Header, ScreenContainer, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getDataStore } from '@/repositories';
import {
  addVariantsFormSchema,
  parseVariantEntry,
  validateVariantEntriesForForm,
  type AddVariantsFormValues,
} from '@/schemas/forms';
import { addVariantsToProduct, getCatalogFormOptions } from '@/services/catalog';
import type { VariantDetail } from '@/types/domain';

import { createEmptyVariantEntry, VariantEntryFields } from './VariantEntryFields';

type AddVariantsFormViewProps = {
  productDetail: VariantDetail;
};

function route(path: string): Href {
  return path as Href;
}

export function AddVariantsFormView({ productDetail }: AddVariantsFormViewProps) {
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
  } = useForm<AddVariantsFormValues>({
    resolver: zodResolver(addVariantsFormSchema),
    defaultValues: {
      variants: [createEmptyVariantEntry()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const uniquenessErrors = validateVariantEntriesForForm(values.variants, {
      productId: productDetail.product.id,
    });
    Object.entries(uniquenessErrors).forEach(([path, message]) => {
      const [, index, field] = path.split('.');
      if (index && field) {
        setError(`variants.${Number(index)}.${field}` as `variants.${number}.${keyof AddVariantsFormValues['variants'][number]}`, {
          message,
        });
      }
    });
    if (Object.keys(uniquenessErrors).length > 0) return;

    try {
      const variantIds = addVariantsToProduct(
        productDetail.product.id,
        values.variants.map(parseVariantEntry)
      );
      router.replace(route(`/inventory/${variantIds[0]}`));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to add variants');
    }
  });

  return (
    <ScreenContainer>
      <Header
        title="Add Variants"
        subtitle={`${productDetail.product.name} · ${productDetail.brand.name}`}
        showBack
      />

      <View style={styles.variantHeader}>
        <Text variant="body" color={colors.textSecondary}>
          Add new color/size combinations to this product.
        </Text>
        <Button
          label="Add another"
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
        label="Save Variants"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        fullWidth
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  variantHeader: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: spacing.md,
  },
});
