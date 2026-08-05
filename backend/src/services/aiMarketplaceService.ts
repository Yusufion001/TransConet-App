import { CargoType } from '@prisma/client';
import { prismaRLS as prisma } from '../db/prisma';

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

function extractRoute(message: string, context: Record<string, unknown>) {
  const contextOrigin = typeof context.origin === 'string' ? context.origin.trim() : '';
  const contextDestination = typeof context.destination === 'string' ? context.destination.trim() : '';
  const match = message.match(/\bfrom\s+([^,.;!?]+?)\s+to\s+([^,.;!?]+?)(?:\s|$|[,.;!?])/i);
  return {
    origin: contextOrigin || match?.[1]?.trim() || '',
    destination: contextDestination || match?.[2]?.trim() || ''
  };
}

function extractCargoType(message: string, context: Record<string, unknown>): CargoType | undefined {
  if (typeof context.cargoType === 'string' && Object.values(CargoType).includes(context.cargoType as CargoType)) {
    return context.cargoType as CargoType;
  }
  const lower = message.toLowerCase();
  const match = Object.keys(cargoAliases).find(alias => lower.includes(alias));
  return match ? cargoAliases[match] : undefined;
}

export async function searchExistingMarketplace(message: string, context: Record<string, unknown> = {}) {
  const { origin, destination } = extractRoute(message, context);
  const cargoType = extractCargoType(message, context);

  // Mirror the existing marketplace API, while applying every route filter
  // explicitly supplied by the user. The query returns all LoadPosting scalar
  // fields so downstream AI/UI layers have the complete record available.
  const where: { status: string; origin?: string; destination?: string; cargoType?: CargoType } = { status: 'AVAILABLE' };
  if (origin) where.origin = origin;
  if (destination) where.destination = destination;
  if (cargoType) where.cargoType = cargoType;

  const loads = await prisma.loadPosting.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return {
    needsClarification: false,
    question: '',
    filters: { origin: origin || null, destination: destination || null, cargoType: cargoType || null },
    loads
  };
}
