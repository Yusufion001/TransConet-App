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
  const match = message.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:\s+(?:for|with|cargo|loads?|shipments?)\b|\s*$|[,.;!?])/i);
  return {
    origin: contextOrigin || match?.[1]?.trim() || '',
    destination: contextDestination || match?.[2]?.trim() || ''
  };
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

  // This is a read-only marketplace discovery query. Use the standard Prisma
  // client so the authenticated transporter's RLS context cannot hide public loads.
  // Fetch every AVAILABLE posting; do not impose an AI-specific 20/50 row cap.
  const allAvailableLoads = await marketplacePrisma.loadPosting.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' }
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
