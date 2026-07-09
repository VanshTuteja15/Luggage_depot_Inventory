import { generateSeedData, getSeedDataStats } from '../data/seed';

const data = generateSeedData();
const stats = getSeedDataStats(data);
console.log(JSON.stringify(stats, null, 2));
