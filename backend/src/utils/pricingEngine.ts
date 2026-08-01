/**
 * TransConet Dynamic Pricing Engine
 * Formula: (Base_Rate + (Distance_Km * Per_Km_Rate) + Tonnage_Weight_Factor) * Real_Time_Demand_Surge
 */

export interface PricingFactors {
  distanceKm: number;
  weightKg: number;
  cargoType?: string;
  isUrgent?: boolean;
  surgeMultiplier?: number;
}

export function calculateDynamicFreightPrice(factors: PricingFactors): {
  baseRate: number;
  distanceCost: number;
  weightFactor: number;
  surgeMultiplier: number;
  subtotal: number;
  finalPrice: number;
  breakdownText: string;
} {
  const { distanceKm, weightKg, cargoType, isUrgent = false, surgeMultiplier = 1.0 } = factors;

  // 1. Base Rate (₦50,000 baseline dispatch fee for trucks)
  const baseRate = 50000;

  // 2. Distance Cost (₦650 per kilometer)
  const perKmRate = 650;
  const distanceCost = Math.max(0, distanceKm) * perKmRate;

  // 3. Tonnage Weight Factor (₦15 per kg above 1000kg)
  const weightTons = Math.max(0, weightKg) / 1000;
  const weightFactor = weightTons > 1 ? (weightKg - 1000) * 15 : 0;

  // 4. Special cargo surcharge adjustment
  let cargoMultiplier = 1.0;
  if (cargoType === 'PERISHABLE' || cargoType === 'HAZARDOUS_MATERIALS') {
    cargoMultiplier = 1.25;
  } else if (cargoType === 'HEAVY_EQUIPMENT') {
    cargoMultiplier = 1.35;
  }

  // 5. Surge & Urgency Multiplier
  const effectiveSurge = Math.max(1.0, (isUrgent ? 1.2 : 1.0) * surgeMultiplier * cargoMultiplier);

  const subtotal = baseRate + distanceCost + weightFactor;
  const finalPrice = Math.round(subtotal * effectiveSurge);

  const breakdownText = `Base ₦${baseRate.toLocaleString()} + Dist (${distanceKm}km x ₦${perKmRate}) ₦${Math.round(distanceCost).toLocaleString()} + Weight (${weightKg}kg) ₦${Math.round(weightFactor).toLocaleString()} x Surge (${effectiveSurge.toFixed(2)}x)`;

  return {
    baseRate,
    distanceCost,
    weightFactor,
    surgeMultiplier: effectiveSurge,
    subtotal,
    finalPrice,
    breakdownText
  };
}
