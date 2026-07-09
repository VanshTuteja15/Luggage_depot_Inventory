import { seedDataSetSchema } from '@/schemas/retail';
import type {
  InventoryRecord,
  Product,
  ProductVariant,
  SalesHistoryRecord,
  SeedDataSet,
  SeedDataStats,
  StockMovement,
} from '@/types/domain';
import { createBarcode, createId, resetIdCounter } from '@/utils/id';

import {
  SALES_HISTORY_DAYS,
  SEED_BRANDS,
  SEED_CATEGORIES,
  SEED_COLORS,
  SEED_LOCATIONS,
  SEED_PRODUCT_TEMPLATES,
  SEED_SIZES,
} from './constants';
import { createSeededRandom } from './random';

const SUPPLIER_NAMES = [
  'Pacific Luggage Wholesale',
  'Alberta Travel Goods',
  'Northwest Bag Distributors',
  'Global Carry Co.',
  'Rocky Mountain Supply',
];

function isoDaysAgo(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function generateSeedData(): SeedDataSet {
  resetIdCounter();
  const rng = createSeededRandom(20260409);
  const now = new Date().toISOString();

  const locations = SEED_LOCATIONS.map((loc) => ({
    id: createId(),
    ...loc,
    createdAt: isoDaysAgo(365),
  }));

  const categories = SEED_CATEGORIES.map((name) => ({
    id: createId(),
    name,
    createdAt: isoDaysAgo(400),
  }));

  const brands = SEED_BRANDS.map((name) => ({
    id: createId(),
    name,
    createdAt: isoDaysAgo(400),
  }));

  const brandByName = new Map(brands.map((b) => [b.name, b]));
  const categoryByName = new Map(categories.map((c) => [c.name, c]));

  const suppliers = SUPPLIER_NAMES.map((name, index) => ({
    id: createId(),
    name,
    contactEmail: `orders+${index + 1}@supplier.example.com`,
    leadTimeDays: rng.int(7, 21),
    createdAt: isoDaysAgo(500),
  }));

  const products: Product[] = [];
  const variants: ProductVariant[] = [];
  let barcodeSeed = 1000;

  SEED_PRODUCT_TEMPLATES.forEach((template) => {
    const brand = brandByName.get(template.brand);
    const category = categoryByName.get(template.category);
    if (!brand || !category) return;

    const productId = createId();
    const supplier = suppliers[rng.int(0, suppliers.length - 1)];

    products.push({
      id: productId,
      name: template.name,
      brandId: brand.id,
      categoryId: category.id,
      supplierId: supplier.id,
      description: `${template.name} by ${template.brand} — premium ${template.category.toLowerCase()} for Calgary travellers.`,
      notes: '',
      createdAt: isoDaysAgo(rng.int(60, 300)),
      updatedAt: now,
    });

    const colorCount =
      template.category === 'Travel Accessories'
        ? 1
        : template.category === 'Backpacks' || template.category === 'Duffels & Weekenders'
          ? 2
          : 2;
    const selectedColors = [...SEED_COLORS].sort(() => rng.next() - 0.5).slice(0, colorCount);
    const sizeOptions =
      template.category === 'Travel Accessories'
        ? ['One Size']
        : template.category === 'Backpacks' || template.category === 'Duffels & Weekenders'
          ? ['Standard', 'Large']
          : [...SEED_SIZES].slice(0, 3);

    selectedColors.forEach((color) => {
      sizeOptions.forEach((size) => {
        const sizeMultiplier = size.includes('28') || size.includes('30') ? 1.18 : size.includes('24') || size.includes('26') ? 1.1 : 1;
        const colorPremium = color === 'Black' || color === 'Navy' ? 1 : 1.04;
        const landedCost = roundMoney(template.baseCost * sizeMultiplier * colorPremium);
        const retailPrice = roundMoney(template.baseRetail * sizeMultiplier * colorPremium);
        const brandCode = brand.name.slice(0, 3).toUpperCase();
        const sku = `${brandCode}-${productId.slice(-4).toUpperCase()}-${color.slice(0, 3).toUpperCase()}-${size.replace(/"/g, '')}`;

        barcodeSeed += 1;
        variants.push({
          id: createId(),
          productId,
          sku,
          barcode: createBarcode(barcodeSeed),
          color,
          size,
          landedCost,
          retailPrice,
          reorderPoint: rng.int(4, 8),
          threshold: rng.int(2, 5),
          active: rng.chance(0.97),
          createdAt: isoDaysAgo(rng.int(30, 200)),
          updatedAt: now,
        });
      });
    });
  });

  const inventory: InventoryRecord[] = [];
  const stockMovements: StockMovement[] = [];

  variants.forEach((variant) => {
    locations.forEach((location) => {
      const quantity = rng.int(0, 18);
      if (quantity === 0 && rng.chance(0.35)) return;

      const qty = quantity === 0 ? rng.int(1, 6) : quantity;
      const inventoryId = createId();

      inventory.push({
        id: inventoryId,
        variantId: variant.id,
        locationId: location.id,
        quantity: qty,
        updatedAt: isoDaysAgo(rng.int(1, 20)),
      });

      stockMovements.push({
        id: createId(),
        variantId: variant.id,
        locationId: location.id,
        change: qty,
        reason: 'Initial seed stock',
        movementType: 'initial_stock',
        createdAt: isoDaysAgo(rng.int(40, 120)),
      });
    });
  });

  // Additional transfer and adjustment movements for recent activity
  for (let i = 0; i < 40; i += 1) {
    const variant = rng.pick(variants);
    const from = rng.pick(locations);
    let to = rng.pick(locations);
    while (to.id === from.id) to = rng.pick(locations);
    const qty = rng.int(1, 4);

    stockMovements.push({
      id: createId(),
      variantId: variant.id,
      locationId: from.id,
      change: -qty,
      reason: `Transfer to ${to.name}`,
      movementType: 'transfer_out',
      relatedLocationId: to.id,
      createdAt: isoDaysAgo(rng.int(1, 14), rng.int(8, 18)),
    });
    stockMovements.push({
      id: createId(),
      variantId: variant.id,
      locationId: to.id,
      change: qty,
      reason: `Transfer from ${from.name}`,
      movementType: 'transfer_in',
      relatedLocationId: from.id,
      createdAt: isoDaysAgo(rng.int(1, 14), rng.int(8, 18)),
    });
  }

  for (let i = 0; i < 25; i += 1) {
    const variant = rng.pick(variants);
    const location = rng.pick(locations);
    const change = rng.chance(0.6) ? rng.int(1, 5) : -rng.int(1, 3);
    stockMovements.push({
      id: createId(),
      variantId: variant.id,
      locationId: location.id,
      change,
      reason: change > 0 ? 'Cycle count correction — found stock' : 'Damaged unit write-off',
      movementType: 'manual_adjustment',
      createdAt: isoDaysAgo(rng.int(0, 10), rng.int(9, 17)),
    });
  }

  const salesHistory: SalesHistoryRecord[] = [];
  const variantById = new Map(variants.map((v) => [v.id, v]));

  for (let day = 0; day < SALES_HISTORY_DAYS; day += 1) {
    locations.forEach((location) => {
      const dailySales = rng.int(3, 9);
      for (let sale = 0; sale < dailySales; sale += 1) {
        const variant = rng.pick(variants);
        const quantity = rng.int(1, 2);
        const discount = rng.chance(0.15) ? 0.9 : 1;

        salesHistory.push({
          id: createId(),
          variantId: variant.id,
          locationId: location.id,
          quantity,
          unitRetailPrice: roundMoney(variant.retailPrice * discount),
          unitLandedCost: variant.landedCost,
          soldAt: isoDaysAgo(day, rng.int(9, 20)),
          source: 'seed',
          externalOrderId: `CLOVER-SEED-${day}-${sale}`,
        });

        if (rng.chance(0.7)) {
          stockMovements.push({
            id: createId(),
            variantId: variant.id,
            locationId: location.id,
            change: -quantity,
            reason: 'POS sale',
            movementType: 'sale',
            createdAt: isoDaysAgo(day, rng.int(9, 20)),
          });
        }
      }
    });
  }

  const dataset: SeedDataSet = {
    locations,
    categories,
    brands,
    suppliers,
    products,
    variants,
    inventory,
    stockMovements,
    salesHistory,
  };

  seedDataSetSchema.parse(dataset);
  return dataset;
}

export function getSeedDataStats(dataset: SeedDataSet): SeedDataStats {
  return {
    locations: dataset.locations.length,
    categories: dataset.categories.length,
    brands: dataset.brands.length,
    suppliers: dataset.suppliers.length,
    products: dataset.products.length,
    variants: dataset.variants.length,
    inventoryRecords: dataset.inventory.length,
    stockMovements: dataset.stockMovements.length,
    salesHistoryRecords: dataset.salesHistory.length,
    salesHistoryDays: SALES_HISTORY_DAYS,
  };
}
