import { Request, Response } from 'express';
import { PrismaClient, CargoType } from '@prisma/client';

import { prismaRLS as prisma } from '../db/prisma';

export const getMarketplaceLoads = async (req: Request, res: Response) => {
  try {
    const { origin, cargoType } = req.query;
    const queryConditions: any = { status: 'AVAILABLE' };

    // Filter match layers
    if (origin) {
      queryConditions.origin = String(origin);
    }
    if (cargoType && Object.values(CargoType).includes(cargoType as CargoType)) {
      queryConditions.cargoType = cargoType as CargoType;
    }

    // High-Resilience Fallback for Offline/Local Testing
    

    const loads = await prisma.loadPosting.findMany({
      where: queryConditions,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.status(200).json(loads);
  } catch (error: any) {
    console.error('🚨 [MARKETPLACE CRASH ESCAPED]:', error.message);
    return res.status(500).json({ error: 'Failed to synchronize live marketplace metrics.' });
  }
};
