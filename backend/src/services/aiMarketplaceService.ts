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

function extractOrigin(message: string, context: Record<string, unknown>) {
  if (typeof context.origin === 'string' && context.origin.trim()) return context.origin.trim();
  const match = message.match(/\bfrom\s+([^,.;!?]+?)(?:\s+to\s+|\s*$)/i);
  return match?.[1]?.trim() || '';
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
  const origin = extractOrigin(message, context);
  const cargoType = extractCargoType(message, context);

  if (!origin && !cargoType) {
    return {
      needsClarification: true,
      question: 'What origin or cargo type should I use for the marketplace search?',
      loads: []
    };
  }

  const where: { status: string; origin?: string; cargoType?: CargoType } = { status: 'AVAILABLE' };
  if (origin) where.origin = origin;
  if (cargoType) where.cargoType = cargoType;

  const loads = await prisma.loadPosting.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return {
    needsClarification: false,
    question: '',
    filters: { origin: origin || null, cargoType: cargoType || null },
    loads
  };
}
