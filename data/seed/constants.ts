export const SEED_LOCATIONS = [
  { name: 'Downtown Calgary', address: '220 8 Ave SW', city: 'Calgary' },
  { name: 'Chinook Centre', address: '6455 Macleod Trail SW', city: 'Calgary' },
  { name: 'Market Mall', address: '3625 Shaganappi Trail NW', city: 'Calgary' },
  { name: 'CrossIron Mills', address: '261055 Crossiron Blvd', city: 'Rocky View' },
  { name: 'Southcentre Mall', address: '100 Anderson Road SE', city: 'Calgary' },
  { name: 'Deerfoot City', address: '33 Heritage Meadows Way SE', city: 'Calgary' },
  { name: 'Beacon Hill', address: '11620 Sarcee Trail NW', city: 'Calgary' },
  { name: 'Strathcona Square', address: '555 Strathcona Blvd SW', city: 'Calgary' },
] as const;

export const SEED_CATEGORIES = [
  'Carry-On',
  'Checked Luggage',
  'Luggage Sets',
  'Backpacks',
  'Duffels & Weekenders',
  'Travel Accessories',
] as const;

export const SEED_BRANDS = [
  'Samsonite',
  'Travelpro',
  'Delsey',
  'Briggs & Riley',
  'Victorinox',
  'Swiss Gear',
  'American Tourister',
  'Monos',
  'Away',
  'Ricardo',
] as const;

export const SEED_COLORS = [
  'Black',
  'Navy',
  'Silver',
  'Blue',
  'Graphite',
  'Burgundy',
  'Olive',
] as const;

export const SEED_SIZES = ['20"', '22"', '24"', '26"', '28"', '30"'] as const;

export const SEED_PRODUCT_TEMPLATES = [
  { name: 'Omni PC Hardside Spinner', brand: 'Samsonite', category: 'Carry-On', baseCost: 95, baseRetail: 219 },
  { name: 'Maxlite 5 Softside Expandable', brand: 'Travelpro', category: 'Carry-On', baseCost: 78, baseRetail: 179 },
  { name: 'Chatelet Air Hardside', brand: 'Delsey', category: 'Checked Luggage', baseCost: 145, baseRetail: 329 },
  { name: 'Baseline Essential Spinner', brand: 'Briggs & Riley', category: 'Checked Luggage', baseCost: 210, baseRetail: 449 },
  { name: 'Lexicon Hardside Freighter', brand: 'Victorinox', category: 'Checked Luggage', baseCost: 185, baseRetail: 399 },
  { name: 'Wenger Diplomat Carry-On', brand: 'Swiss Gear', category: 'Carry-On', baseCost: 62, baseRetail: 149 },
  { name: 'Curio Hardside Spinner', brand: 'American Tourister', category: 'Carry-On', baseCost: 55, baseRetail: 129 },
  { name: 'Hybrid Carry-On Plus', brand: 'Monos', category: 'Carry-On', baseCost: 120, baseRetail: 275 },
  { name: 'The Bigger Carry-On', brand: 'Away', category: 'Carry-On', baseCost: 98, baseRetail: 245 },
  { name: 'Montreal 2.0 Spinner', brand: 'Ricardo', category: 'Checked Luggage', baseCost: 88, baseRetail: 199 },
  { name: 'Winfield 3 Piece Set', brand: 'Samsonite', category: 'Luggage Sets', baseCost: 260, baseRetail: 599 },
  { name: 'Platinum Elite 3-Piece', brand: 'Travelpro', category: 'Luggage Sets', baseCost: 310, baseRetail: 699 },
  { name: 'Transit Backpack Pro', brand: 'Away', category: 'Backpacks', baseCost: 72, baseRetail: 168 },
  { name: 'VX Sport Daypack', brand: 'Victorinox', category: 'Backpacks', baseCost: 58, baseRetail: 135 },
  { name: 'Feather Lite Duffel', brand: 'American Tourister', category: 'Duffels & Weekenders', baseCost: 35, baseRetail: 79 },
  { name: 'Wanderlust Weekender', brand: 'Ricardo', category: 'Duffels & Weekenders', baseCost: 42, baseRetail: 95 },
  { name: 'TSA Lock 4-Pack', brand: 'Swiss Gear', category: 'Travel Accessories', baseCost: 8, baseRetail: 24 },
  { name: 'Packing Cube Set', brand: 'Monos', category: 'Travel Accessories', baseCost: 18, baseRetail: 48 },
  { name: 'Garment Carrier Deluxe', brand: 'Briggs & Riley', category: 'Travel Accessories', baseCost: 45, baseRetail: 110 },
  { name: 'Underseat Tote', brand: 'Delsey', category: 'Backpacks', baseCost: 38, baseRetail: 89 },
  { name: 'Outline Pro Hardside', brand: 'Away', category: 'Checked Luggage', baseCost: 135, baseRetail: 295 },
  { name: 'Silhouette 16 Spinner', brand: 'Samsonite', category: 'Checked Luggage', baseCost: 175, baseRetail: 379 },
  { name: 'Crew VersaPack', brand: 'Travelpro', category: 'Backpacks', baseCost: 68, baseRetail: 159 },
  { name: 'Air Lite 2.0 Large', brand: 'Delsey', category: 'Checked Luggage', baseCost: 115, baseRetail: 259 },
  { name: 'Commuter Expandable', brand: 'Ricardo', category: 'Carry-On', baseCost: 74, baseRetail: 169 },
] as const;

export const SALES_HISTORY_DAYS = 90;

export const FORECAST_LOOKBACK_DAYS = 30;
