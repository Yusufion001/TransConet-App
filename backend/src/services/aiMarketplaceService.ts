import { CargoType } from '@prisma/client';
import { prisma as marketplacePrisma } from '../db/prisma';

const cargoAliases: Record<string, CargoType> = {
  agricultural: 'AGRICULTURAL_GOODS',
  'agricultural goods': 'AGRICULTURAL_GOODS',
  construction: 'CONSTRUCTION_MATERIALS',
  'construction materials': 'CONSTRUCTION_MATERIALS',
  'general merchandise': 'GENERAL_MERCHANDISE',
  merchandise: 'GENERAL_MERCHANDISE',
  pharmaceutical: 'PHARMACEUTICALS_MEDICAL',
  pharmaceuticals: 'PHARMACEUTICALS_MEDICAL',
  medical: 'PHARMACEUTICALS_MEDICAL',
  electronics: 'ELECTRONICS_APPLIANCES',
  appliances: 'ELECTRONICS_APPLIANCES',
  petroleum: 'PETROLEUM_CHEMICALS',
  chemicals: 'PETROLEUM_CHEMICALS',
  machinery: 'HEAVY_MACHINERY',
  'heavy machinery': 'HEAVY_MACHINERY'
};

const normalizeLocation = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/[,_-]+/g, ' ').replace(/\s+/g, ' ');

function extractRoute(message: string, context: Record<string, unknown>) {
  const contextOrigin = typeof context.origin === 'string' ? context.origin.trim() : '';
  const contextDestination = typeof context.destination === 'string' ? context.destination.trim() : '';
  if (contextOrigin || contextDestination) return { origin: contextOrigin, destination: contextDestination };

  const normalizedMessage = message.replace(/\s+/g, ' ').trim();
  // Support the natural route forms users actually use in the assistant, including
  // "from Lagos to Abuja", "Lagos -> Abuja", and comma-separated place names.
  const arrow = normalizedMessage.match(/(.+?)\s*(?:->|→|\bto\b)\s*(.+)$/i);
  if (!arrow) return { origin: '', destination: '' };

  const left = arrow[1].replace(/^.*?\bfrom\s+/i, '').trim().replace(/[,.!?]+$/, '').trim();
  const right = arrow[2].trim().replace(/[.!?]+$/, '').trim();
  return { origin: left, destination: right };
}

function extractCargoType(message: string, context: Record<string, unknown>): CargoType | undefined {
  if (typeof context.cargoType === 'string' && Object.values(CargoType).includes(context.cargoType as CargoType)) return context.cargoType as CargoType;
  const lower = message.toLowerCase();
  const match = Object.keys(cargoAliases).find(alias => lower.includes(alias));
  return match ? cargoAliases[match] : undefined;
}

function locationMatches(recordValue: unknown, requestedValue: string) {
  if (!requestedValue) return true;
  const record = normalizeLocation(recordValue);
  const requested = normalizeLocation(requestedValue);
  return record === requested || record.includes(requested) || requested.includes(record);
}

export async function searchExistingMarketplace(message: string, context: Record<string, unknown> = {}) {
  const { origin, destination } = extractRoute(message, context);
  const cargoType = extractCargoType(message, context);

  // Read every currently AVAILABLE posting. There is intentionally no AI-specific
  // LIMIT, pagination cap, or take() here: the assistant must search the complete
  // marketplace dataset before applying route/cargo filters.
  const allAvailableLoads = await marketplacePrisma.loadPosting.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
  });

  const loads = allAvailableLoads.filter((load: any) =>
    locationMatches(load.origin, origin) &&
    locationMatches(load.destination, destination) &&
    (!cargoType || load.cargoType === cargoType)
  );

  return {
    needsClarification: false,
    question: '',
    filters: { origin: origin || null, destination: destination || null, cargoType: cargoType || null },
    totalAvailable: allAvailableLoads.length,
    count: loads.length,
    loads
  };
}
