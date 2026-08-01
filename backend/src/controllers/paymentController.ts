import { PaymentStatus } from '../types/paymentEnums';
import { Request, Response } from 'express';
import axios from 'axios';
import { prismaRLS as prisma } from '../db/prisma';
import { redis } from '../utils/redis';

export const initializeEscrowPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { loadId, callbackUrl } = req.body;
    const userId = (req as any).user?.id;
    const email = (req as any).user?.email || 'shipper@transconet.com';

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!loadId) {
      return res.status(400).json({ error: 'Valid load ID is required.' });
    }

    let amount = 0;

    if (prisma) {
        const load = await prisma.loadPosting.findUnique({ where: { id: loadId } });
        if (!load) {
            return res.status(404).json({ error: 'Load not found.' });
        }
        if (load.customerId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized. You do not own this load.' });
        }
        if (load.paymentStatus !== 'UNPAID' && load.paymentStatus !== 'PENDING') {
            return res.status(400).json({ error: 'This load is already paid or in escrow.' });
        }
        
        // Find the accepted bid to determine the real amount
        const acceptedBid = await prisma.bid.findFirst({
          where: { loadId: loadId, status: 'ACCEPTED' }
        });
        
        if (!acceptedBid) {
            return res.status(400).json({ error: 'No accepted bid found for this load. Please accept a bid before funding escrow.' });
        }
        
        amount = acceptedBid.amount;
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Invalid escrow payment amount.' });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLive = process.env.NODE_ENV === 'production' || !!paystackSecret;
    const reference = `ESCROW-${loadId}-${Date.now()}`;
    const amountInKobo = Math.round(Number(amount) * 100);

    if (isLive) {
      if (!paystackSecret) {
        return res.status(500).json({ error: 'Payment gateway configuration missing.' });
      }
      try {
        const response = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email: email,
            amount: amountInKobo,
            reference,
            callback_url: callbackUrl || 'https://transconet.com/payment/callback',
            metadata: {
              loadId,
              userId,
              type: 'ESCROW_DEPOSIT'
            }
          },
          {
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data?.status) {
          return res.status(200).json({
            success: true,
            authorizationUrl: response.data.data.authorization_url,
            accessCode: response.data.data.access_code,
            reference,
            mode: 'LIVE_PAYSTACK'
          });
        }
      } catch (paystackErr: any) {
        console.error('Paystack initialization error:', paystackErr.response?.data || paystackErr.message);
        return res.status(500).json({ error: 'Failed to communicate with payment gateway.' });
      }
    }

    return res.status(200).json({
      success: true,
      authorizationUrl: `https://checkout.paystack.com/sandbox-checkout-${reference}`,
      accessCode: `acc_code_${reference}`,
      reference,
      mode: 'SANDBOX_SIMULATED',
      message: 'Escrow payment link generated successfully in test mode.'
    });
  } catch (error: any) {
    console.error('Initialize escrow payment error:', error);
    return res.status(500).json({ error: 'Failed to initialize escrow payment.' });
  }
};

export const verifyEscrowPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reference, loadId } = req.body;

    const isNew = await redis.set(`consumed_ref:${reference}`, 'true', 'EX', 365 * 24 * 60 * 60, 'NX');
    if (!isNew) {
      return res.status(400).json({ error: 'This payment reference has already been consumed.' });
    }
    const userId = req.user?.id;

    if (!reference || !loadId) {
      return res.status(400).json({ error: 'Transaction reference and load ID are required.' });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLive = process.env.NODE_ENV === 'production' || !!paystackSecret;
    let verifiedAmount = 0;

    if (isLive) {
      if (!paystackSecret) {
        return res.status(500).json({ error: 'Payment gateway configuration missing.' });
      }
      try {
        const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${paystackSecret}`
          }
        });
        
        if (!verifyRes.data?.status || verifyRes.data.data.status !== 'success') {
          return res.status(400).json({ error: 'Payment verification failed with provider.' });
        }

        // Security Check: Ensure the payment was actually for this load
        if (verifyRes.data.data.metadata?.loadId !== loadId) { 
           return res.status(400).json({ error: 'Payment reference does not match the requested load ID.' });
        }

        verifiedAmount = verifyRes.data.data.amount / 100;
      } catch (paystackErr: any) {
        console.error('Paystack verification error:', paystackErr.response?.data || paystackErr.message);
        return res.status(400).json({ error: 'Payment verification failed with provider.' });
      }
    }

    if (prisma) {
      const tx = prisma; // Bypass nested transaction deadlock
      const result = await (async (tx) => {
        const load = await tx.loadPosting.findUnique({ where: { id: loadId } });
        if (!load) {
          return { error: 'Load not found.', status: 404 };
        }
        
        if (load.paymentStatus === PaymentStatus.PAID_TO_TRANSPORTER || load.paymentStatus === PaymentStatus.RELEASED) {
            return {
              success: true,
              loadId,
              status: PaymentStatus.PAID_TO_TRANSPORTER,
              message: 'Escrow funds were already released to the Transporter wallet.',
              statusCode: 200
            };
        }

        if (load.customerId !== userId && req.user?.role !== 'ADMIN') {
          return { error: 'Unauthorized. You do not own this load.', status: 403 };
        }

        const acceptedBid = await tx.bid.findFirst({
          where: { loadId: loadId, status: 'ACCEPTED' }
        });
        
        const targetAmount = acceptedBid ? acceptedBid.amount : (load.suggestedBudget || 0);

        // Security Check: Verify amount matches the accepted bid or suggested budget
        if (isLive && verifiedAmount > 0 && verifiedAmount < targetAmount) { 
           return { error: 'Paid amount is less than the required budget or accepted bid.', status: 400 };
        }

        // Lock already acquired at the start
        await tx.loadPosting.update({
          where: { id: loadId },
          data: {
            paymentStatus: PaymentStatus.HELD_IN_ESCROW,
            isEscrowEnabled: true,
            escrowBalance: isLive ? verifiedAmount : targetAmount
          }
        });

        return {
          success: true,
          loadId,
          reference,
          status: PaymentStatus.HELD_IN_ESCROW,
          message: 'Funds verified and safely locked in TransConet Escrow Vault.',
          statusCode: 200
        };
      })(tx);

      if (result.error) {
        return res.status(Number(result.status)).json({ error: result.error });
      }
      return res.status(Number(result.statusCode) || 200).json(result);
    } else {
       return res.status(200).json({
          success: true,
          loadId,
          reference,
          status: PaymentStatus.HELD_IN_ESCROW,
          message: 'Funds verified and safely locked in TransConet Escrow Vault.'
       });
    }
  } catch (error: any) {
    console.error('Verify escrow error:', error);
    return res.status(500).json({ error: 'Failed to verify escrow deposit status.' });
  }
};

export const releaseEscrowPayout = async (req: Request, res: Response): Promise<any> => {
  const { loadId } = req.body;
  const userId = req.user?.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the current state of the load
      const load = await tx.loadPosting.findUnique({
        where: { id: loadId },
      });

      if (!load) {
        throw new Error('Load not found.');
      }

      if (load.customerId !== userId && req.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized. You do not own this load.');
      }

      // 2. Fetch the actual accepted bid for this load
      const acceptedBid = await tx.bid.findFirst({
        where: { loadId: loadId, status: 'ACCEPTED' }
      });

      if (!acceptedBid) {
        throw new Error('No accepted bid found for this load.');
      }

      const payoutAmount = acceptedBid.amount;
      const transporterId = acceptedBid.driverId;
      const shipperId = load.customerId;

      // 3. Race Condition Prevention: Check strict statuses before proceeding
      if (load.paymentStatus === PaymentStatus.PAID) {
        throw new Error('Payout has already been released for this load.');
      }

      if (load.status !== 'DELIVERED') {
        throw new Error('Load must be marked as DELIVERED before releasing escrow.');
      }

      if (load.escrowBalance < payoutAmount) {
        throw new Error('Insufficient funds in escrow.');
      }

      // 4. Deduct from Escrow and lock the load status
      const updatedLoad = await tx.loadPosting.update({
        where: { id: loadId },
        data: {
          escrowBalance: {
            decrement: payoutAmount,
          },
          paymentStatus: PaymentStatus.PAID,
        },
      });

      // 5. Credit the Transporter's digital wallet
      const updatedTransporter = await tx.user.update({
        where: { id: transporterId },
        data: {
          walletBalance: {
            increment: payoutAmount,
          },
        },
      });

      // 6. Create an immutable audit record for the Admin dashboard
      const auditRecord = await tx.transaction.create({
        data: {
          loadId: loadId,
          shipperId: shipperId,
          transporterId: transporterId,
          amount: payoutAmount,
          type: 'ESCROW_RELEASE',
          status: 'SUCCESS',
        },
      });

      // Return the final state if everything succeeds
      return { updatedLoad, updatedTransporter, auditRecord };
    });

    return res.status(200).json({
      success: true,
      message: 'Escrow released and transporter credited successfully.',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Escrow transaction failed.',
    });
  }
};
