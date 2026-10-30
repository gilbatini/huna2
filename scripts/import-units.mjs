// Builds lib/huna-heights-units.json from a scraped demo.json (see gilbatini/drmich,
// data/demo.json). Keeps only unit facts: number, floor, type, size, beds, baths
// and status. No names, copy, prices or image URLs are carried over.
//
// Run: node scripts/import-units.mjs path/to/demo.json
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) throw Error('Usage: node scripts/import-units.mjs path/to/demo.json');
const demo = JSON.parse(readFileSync(src, 'utf8'));

const units = demo.apartments.flatMap((t) =>
  t.units.map((u) => ({
    unit: u.apartment,
    floor: Number(u.floor),
    beds: Number(u.bedrooms),
    baths: Number(u.bathrooms),
    sizeSqm: u.size_sqm,
    sizeSqft: u.size_sqft,
    status: u.status,
  })),
);
const allowed = new Set(['available', 'reserved', 'let']);
for (const u of units) if (!allowed.has(u.status)) throw Error(`Unexpected status ${u.status} for unit ${u.unit}`);

writeFileSync(new URL('../lib/huna-heights-units.json', import.meta.url), JSON.stringify(units, null, 1) + '\n');
console.log(`Wrote ${units.length} units to lib/huna-heights-units.json`);
