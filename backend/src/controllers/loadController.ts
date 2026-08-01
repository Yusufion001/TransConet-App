import { Request, Response, NextFunction } from 'express';
import { prismaRLS } from '../db/prismaRLS';
import { prisma as standardPrisma } from '../db/prisma';
import { enqueueLoadEmbedding } from '../services/aiQueue';
import { sanitizeInput } from '../utils/sanitize';

export const getLoadPostings = async (req: Request, res: Response): Promise<any> => {
  try {
    const loads = await (standardPrisma as any).loadPosting.findMany({
      where: {
        status: 'AVAILABLE'
      },
      include: {
        user: {
          select: {
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedLoads = loads.map((load: any) => ({
      ...load,
      customer: load.user || { phoneNumber: '08030000000' }
    }));

    return res.status(200).json(mappedLoads);
  } catch (error) {
    console.error('Marketplace query failure:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

export const getAllLoads = getLoadPostings;

export const createLoad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, origin, destination, weight, cargoType, weightKg, suggestedBudget, isEscrowEnabled } = req.body;
    const customerId = (req as any).user?.id ?? 'dev-default-shipper';
    const tenantId = (req as any).user?.tenantId ?? customerId;

    // 1. Core Transaction (Must Succeed)
    const newLoad = await (standardPrisma as any).loadPosting.create({
      data: {
        title: title ? sanitizeInput(title).trim() : 'Cargo Freight',
        cargoType: cargoType || 'GENERAL',
        weightKg: weightKg ? Number(weightKg) : (weight ? Number(weight) : 1000),
        origin: origin ? sanitizeInput(origin).trim() : 'Lagos',
        destination: destination ? sanitizeInput(destination).trim() : 'Abuja',
        suggestedBudget: suggestedBudget ? Number(suggestedBudget) : null,
        isEscrowEnabled: !!isEscrowEnabled,
        customerId
      },
    });

    // 2. Return success to the client IMMEDIATELY.
    res.status(201).json({
      status: 'success',
      data: newLoad,
    });

    // 3. Fire-and-Forget the AI Queue (Does not block the response)
    (async () => {
      try {
        const text = `Load: ${newLoad.title}. Cargo type: ${newLoad.cargoType}. Weight: ${newLoad.weightKg}kg. Origin: ${newLoad.origin}. Destination: ${newLoad.destination}. ${description || ''}`;
        await enqueueLoadEmbedding(newLoad.id, text);
      } catch (queueError: any) {
        console.error(`[AI Queue Error] Failed to enqueue load ${newLoad.id}:`, queueError.message);
      }
    })();

  } catch (error) {
    next(error); // Only DB or validation errors end up here
  }
};

export const createLoadPosting = createLoad;

export const getMyLoads = async (req: Request, res: Response): Promise<any> => {
  try {
    const customerId = (req as any).user?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const loads = await (standardPrisma as any).loadPosting.findMany({
      where: {
        customerId
      },
      include: {
        bids: {
          include: {
            driver: {
              select: {
                phoneNumber: true,
                email: true,
                verificationLevel: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(loads);
  } catch (error: any) {
    console.error('Get my loads error:', error);
    return res.status(500).json({ error: 'Failed to retrieve your loads.' });
  }
};

export const getLoadById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const load = await (standardPrisma as any).loadPosting.findUnique({
      where: { id },
      include: {
        user: { select: { phoneNumber: true, email: true } },
        bids: true
      }
    });
    if (!load) {
      return res.status(404).json({ error: 'Load posting not found.' });
    }
    return res.status(200).json(load);
  } catch (error: any) {
    console.error('Get load by ID error:', error);
    return res.status(500).json({ error: 'Failed to retrieve load details.' });
  }
};

export const updateLoad = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, cargoType, weightKg, origin, destination, suggestedBudget, status, paymentStatus, isEscrowEnabled } = req.body;

    const existingLoad = await (standardPrisma as any).loadPosting.findUnique({ where: { id } });
    if (!existingLoad) {
      return res.status(404).json({ error: 'Load posting not found for update.' });
    }

    if (existingLoad.customerId !== (req as any).user?.id && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this load.' });
    }

    const updateData: any = {};
    if (title) updateData.title = sanitizeInput(title).trim();
    if (cargoType) updateData.cargoType = cargoType;
    if (weightKg) updateData.weightKg = Number(weightKg);
    if (origin) updateData.origin = sanitizeInput(origin).trim();
    if (destination) updateData.destination = sanitizeInput(destination).trim();
    if (suggestedBudget !== undefined) updateData.suggestedBudget = suggestedBudget ? Number(suggestedBudget) : null;
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (isEscrowEnabled !== undefined) updateData.isEscrowEnabled = !!isEscrowEnabled;

    const updatedLoad = await (standardPrisma as any).loadPosting.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      message: 'Load status and parameters updated successfully.',
      load: updatedLoad
    });
  } catch (error: any) {
    console.error('Update load error:', error);
    return res.status(500).json({ error: 'Failed to update load details in database.' });
  }
};
