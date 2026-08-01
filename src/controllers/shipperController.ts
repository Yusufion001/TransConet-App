import { scanFileForMalware } from '../utils/malwareScanner';
// src/controllers/shipperController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { prismaRLS as prisma } from '../db/prisma';

// 1. Fetch all pending negotiation bids for the shipper's active cargo postings
export const getShipperInboundBids = async (req: Request, res: Response) => {
  try {
    const shipperId = (req as any).user?.id ?? 'dev-default-shipper';

    

    const inboundBids = await prisma.bid.findMany({
      where: {
        load: { customerId: shipperId },
        status: 'PENDING'
      },
      include: {
        load: { select: { id: true, title: true, suggestedBudget: true, origin: true, destination: true } },
        driver: { select: { phoneNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(inboundBids);
  } catch (error: any) {
    console.error('🚨 [SHIPPER FETCH ERROR]:', error.message);
    return res.status(500).json({ error: 'Failed to synchronize incoming negotiation streams.' });
  }
};

// 2. Transactional endpoint to Accept a Bid and close out the load listing
export const updateBidStatus = async (req: Request, res: Response) => {
  try {
    const { bidId, action } = req.body; // action can be 'ACCEPT' or 'REJECT'
    const shipperId = (req as any).user?.id;
    
    if (!bidId || !['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Invalid parameters. Specify bidId and action context.' });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { load: true }
    });

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found.' });
    }

    if (bid.load.customerId !== shipperId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to modify bids for this load.' });
    }


    

    if (action === 'ACCEPT') {
      // Execute a relational transaction: Accept the winning bid, reject the rest, lock the load.
      await prisma.$transaction(async (tx) => {
        const winningBid = await tx.bid.update({
          where: { id: bidId },
          data: { status: 'ACCEPTED' }
        });

        await tx.loadPosting.update({
          where: { id: winningBid.loadId },
          data: { status: 'BOOKED' }
        });

        await tx.bid.updateMany({
          where: { loadId: winningBid.loadId, id: { not: bidId } },
          data: { status: 'REJECTED' }
        });
      });
    } else {
      await prisma.bid.update({
        where: { id: bidId },
        data: { status: 'REJECTED' }
      });
    }

    return res.status(200).json({ message: `Successfully executed negotiation: ${action}ED.` });
  } catch (error: any) {
    console.error('🚨 [TRANSACTION STATUS FAILURE]:', error.message);
    return res.status(500).json({ error: 'Transactional failure updating manifest status.' });
  }
};

export const uploadShipperDocuments = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const cacCert = files?.['cacCertificate']?.[0];
    const cacStatus = files?.['cacStatusReport']?.[0];

    // Malware Scanning
    if (cacCert) {
      const isSafe = await scanFileForMalware({ buffer: cacCert.buffer });
      if (!isSafe) {
        return res.status(400).json({ error: 'Malware detected or invalid file signature in CAC Certificate.' });
      }
    }
    if (cacStatus) {
      const isSafe = await scanFileForMalware({ buffer: cacStatus.buffer });
      if (!isSafe) {
        return res.status(400).json({ error: 'Malware detected or invalid file signature in CAC Status Report.' });
      }
    }

    // Dummy successful response to handle the request properly in dev
    // In production, this would save to a cloud bucket like Supabase Storage
    return res.status(200).json({
      message: 'Documents uploaded successfully (Simulated).',
      files: {
        cacCertificate: cacCert ? cacCert.originalname : null,
        cacStatusReport: cacStatus ? cacStatus.originalname : null
      }
    });
  } catch (error: any) {
    console.error('🚨 [DOCUMENT UPLOAD FAILURE]:', error.message);
    return res.status(500).json({ error: 'Failed to upload shipper documents.' });
  }
};
