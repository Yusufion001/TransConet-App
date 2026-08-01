import { getIO } from '../socket';
// src/controllers/bidController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { prismaRLS as prisma } from '../db/prisma';


const emitToLoad = (loadId: string, event: string, data: any) => {
  try {
    getIO().to(`load_${loadId}`).emit(event, data);
  } catch(e) { console.error('Socket emit failed:', e.message); }
};

export const getMyBids = async (req: Request, res: Response) => {
  try {
    const driverId = (req as any).user?.id;
    if (!driverId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bids = await prisma.bid.findMany({
      where: { driverId },
      include: {
        load: {
          include: {
            user: {
              select: { phoneNumber: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json(bids);
  } catch (error: any) {
    console.error('Failed to get transporter bids:', error);
    return res.status(500).json({ error: 'Failed to retrieve your bids.' });
  }
};

export const placeBid = async (req: Request, res: Response) => {
  try {
    const { loadId, amount, notes } = req.body;
    const driverId = (req as any).user?.id; // Protected by auth middleware
    if (!driverId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!loadId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please specify a valid offer budget amount.' });
    }

    

    // 1. Verify the load exists and isn't locked down or completed
    const load = await prisma.loadPosting.findUnique({ where: { id: loadId } });
    if (!load) {
      return res.status(404).json({ error: 'The requested shipment cargo listing was not found.' });
    }
    if (load.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'This load is no longer open for active negotiation bids.' });
    }

    // 2. Prevent duplicate active bids from the same carrier
    const existingBid = await prisma.bid.findFirst({
      where: { loadId, driverId, status: 'PENDING' }
    });
    if (existingBid) {
      return res.status(400).json({ error: 'You already have an active negotiation pending review for this shipment.' });
    }

    // 3. Insert the brand new negotiation offering record
    const newBid = await prisma.bid.create({
      data: {
        loadId,
        driverId,
        amount: Number(amount),
        notes: notes?.trim() || null,
      },
    });

    return res.status(201).json(newBid);
  } catch (error: any) {
    console.error('🚨 [NEGOTIATION PIPELINE ERROR]:', error.message);
    return res.status(500).json({ error: 'Failed to broadcast pricing offer to the shipper network.' });
  }
};

export const acceptBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.body;
    const customerId = req.user?.id;

    if (!bidId) {
      return res.status(400).json({ error: 'Bid ID is required to accept an offer.' });
    }

    

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { load: true }
    });

    if (!bid) {
      return res.status(404).json({ error: 'The specified bid was not found.' });
    }

    console.log("acceptBid auth check:", { bidLoadCustomerId: bid.load.customerId, customerId, userRole: req.user?.role });
    if (bid.load.customerId !== customerId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to accept bids for this load.' });
    }

    if (bid.load.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'This load is no longer available for new assignments.' });
    }

    // Execute in transaction to ensure atomicity
    await prisma.$transaction([
      // Accept this bid
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' }
      }),
      // Reject all other bids for this load
      prisma.bid.updateMany({
        where: { loadId: bid.loadId, id: { not: bidId } },
        data: { status: 'REJECTED' }
      }),
      // Update load status
      prisma.loadPosting.update({
        where: { id: bid.loadId },
        data: { status: 'QUOTE_ACCEPTED' }
      })
    ]);

    return res.status(200).json({ success: true, message: 'Bid accepted. Load status updated to QUOTE_ACCEPTED.' });
  } catch (error: any) {
    console.error('🚨 [BID ACCEPTANCE ERROR]:', error);
    return res.status(500).json({ error: 'Failed to accept bid and assign load.', details: String(error) });
  }
};
