// Huna Heights, Nairobi — sample unit list shared by the homepage and the dashboard demo.
// Units come from lib/huna-heights-units.json (scripts/import-units.mjs). All figures are
// sample data: rents are indicative and to confirm; availability is not verified.
import rawUnits from './huna-heights-units.json';

export const BUILDING = 'Huna Heights';

// Indicative monthly rent in KES by bedroom count, to confirm. null = on request.
export const INDICATIVE_RENT_KES: Record<number, number | null> = { 1: null, 2: 140000, 3: 190000 };

// USD shown alongside KES. Rate from open.er-api.com, 30 Oct 2026.
export const KES_PER_USD = 129.65;

export type UnitStatus = 'available' | 'reserved' | 'let';
export type Unit = { unit: string; floor: number; beds: number; baths: number; sizeSqm: number; sizeSqft: number; status: UnitStatus };

export const units = rawUnits as Unit[];

export const rentKes = (beds: number) => INDICATIVE_RENT_KES[beds] ?? null;
export const rentUsd = (kes: number) => Math.round(kes / KES_PER_USD / 10) * 10;
export const typeLabel = (beds: number) => `${beds} Bedroom`;
export const statusLabel = (s: UnitStatus) => s[0].toUpperCase() + s.slice(1);

const order: Record<UnitStatus, number> = { available: 0, reserved: 1, let: 2 };
// Available first, then higher floors.
export const byAvailability = (a: Unit, b: Unit) => order[a.status] - order[b.status] || b.floor - a.floor;

export const counts = {
  total: units.length,
  available: units.filter((u) => u.status === 'available').length,
  reserved: units.filter((u) => u.status === 'reserved').length,
  let: units.filter((u) => u.status === 'let').length,
};

// Generic amenities and services, each to confirm with the client.
export const amenities: [string, string][] = [
  ['Fitness room', 'A residents’ gym with cardio and strength equipment.'],
  ['Residents’ lounge', 'A shared space to relax, work or meet guests.'],
  ['Concierge', 'Front-desk help with visitors and deliveries.'],
  ['Housekeeping', 'Optional cleaning and laundry.'],
  ['Security', 'Controlled access, CCTV and staff on site.'],
  ['Parking', 'Gated parking for residents.'],
  ['Backup power', 'Standby generator for common areas and apartments.'],
  ['Water', 'Borehole supply backed by county water.'],
];
