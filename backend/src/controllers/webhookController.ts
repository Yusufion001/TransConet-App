import { PaymentStatus } from '../types/paymentEnums';
import { Request, Response } from 'express';
import { prismaRLS as prisma } from '../db/prisma';
import crypto from 'crypto';
import { redis } from '../utils/redis';

export const paystackWebhook = async (req: Request, res: Response): Promise<any> => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return res.status(500).send('Configuration error');

    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const loadId = event.data.metadata?.loadId;
      const amount = event.data.amount / 100;

      if (!loadId) return res.status(200).send('No loadId in metadata, ignoring');

      const isNew = await redis.set(`consumed_ref:${reference}`, 'true', 'EX', 365 * 24 * 60 * 60, 'NX');
      if (!isNew) {
        return res.status(200).send('Already processed');
      }

      const load = await prisma.loadPosting.findUnique({ where: { id: loadId } });
      if (load && load.paymentStatus !== PaymentStatus.PAID_TO_TRANSPORTER && load.paymentStatus !== PaymentStatus.RELEASED && load.paymentStatus !== PaymentStatus.HELD_IN_ESCROW) {
        
        const acceptedBid = await prisma.bid.findFirst({
          where: { loadId: loadId, status: 'ACCEPTED' }
        });
        
        const targetAmount = acceptedBid ? acceptedBid.amount : (load.suggestedBudget || 0);

        if (amount >= targetAmount) {
          // Setnx done at the beginning
          
          await prisma.loadPosting.update({
            where: { id: loadId },
            data: {
              paymentStatus: PaymentStatus.HELD_IN_ESCROW,
              isEscrowEnabled: true,
              escrowBalance: amount
            }
          });
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Server Error');
  }
};
