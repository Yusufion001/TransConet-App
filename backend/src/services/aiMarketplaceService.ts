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

const normalizeLocation = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

function extractRoute(message: string, context: Record<string, unknown>) {
  const contextOrigin = typeof context.origin === 'string' ? context.origin.trim() : '';
  const contextDestination = typeof context.destination === 'string' ? context.destination.trim() : '';
  const match = message.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:\s+(?:for|with|cargo|loads?|shipment|shipments)\b|\s*$|[,.;!?])/i);
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

  // Marketplace discovery must see the same complete AVAILABLE inventory as the
  // public marketplace endpoint. Do not use prismaRLS here: a transporter's RLS
  // context can otherwise hide loads that are intentionally public marketplace data.
  // Do not impose a 50-row limit; the AI must receive every matching available load.
  const allAvailableLoads = await marketplacePrisma.loadPosting.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' }
  });

  const normalizedOrigin = normalizeLocation(origin);
  const normalizedDestination = normalizeLocation(destination);
  const loads = allAvailableLoads.filter((load: any) => {
    if (normalizedOrigin && normalizeLocation(load.origin) !== normalizedOrigin) return false;
    if (normalizedDestination && normalizeLocation(load.destination) !== normalizedDestination) return false;
    if (cargoType && load.cargoType !== cargoType) return false;
    return true;
  });

  return {
    needsClarification: false,
    question: '',
    filters: { origin: origin || null, destination: destination || null, cargoType: cargoType || null },
    totalAvailable: allAvailableLoads.length,
    count: loads.length,
    loads
  };
}
