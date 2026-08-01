import { Request, Response } from 'express';
import { enqueueEmail as sendEmailAlert } from '../services/queueService';
import { PrismaClient } from '@prisma/client';

import { prismaRLS as prisma } from '../db/prisma';

export const triggerHaulageNotification = async (req: Request, res: Response): Promise<any> => {
  try {
    const { driverPhone, loadDetails = {} } = req.body;
    
    // We will attempt to lookup driver email by phone number
    let toEmail = 'yusufjimoh969@gmail.com'; // Default to user email for testing
    
    if (prisma && driverPhone) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phoneNumber: driverPhone },
              { phone: driverPhone }
            ]
          }
        });
        if (user && user.email) {
          toEmail = user.email;
        }
      } catch (dbErr) {
        console.warn('[NotificationController] User lookup warning:', dbErr);
      }
    }
    
    const commodity = loadDetails.commodity || loadDetails.cargoType || 'General Cargo';
    const origin = loadDetails.origin || loadDetails.pickupLocation || 'Nigeria Origin Hub';
    const destination = loadDetails.destination || loadDetails.deliveryLocation || 'Destination Terminal';
    const payout = loadDetails.payout || loadDetails.suggestedBudget || loadDetails.price || '0';

    const subject = `Haulage Request Accepted - TransConet`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">Haulage Request Accepted</h2>
        <p>A new haulage request has been accepted by the transporter.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
          <h3 style="margin-top: 0; color: #0f172a;">Trip Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li style="margin-bottom: 8px;"><strong>Commodity:</strong> ${commodity}</li>
            <li style="margin-bottom: 8px;"><strong>Pickup Origin:</strong> ${origin}</li>
            <li style="margin-bottom: 8px;"><strong>Dropoff Destination:</strong> ${destination}</li>
            <li style="margin-bottom: 8px;"><strong>Payout / Budget:</strong> ₦${payout}</li>
            <li style="margin-bottom: 8px;"><strong>Driver Phone:</strong> ${driverPhone || 'N/A'}</li>
          </ul>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
          TransConet Logistics Inc.<br/>
          This is an automated notification.
        </p>
      </div>
    `;
    
    await sendEmailAlert(toEmail, subject, html);
    
    return res.status(200).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error: any) {
    console.error('Error in notification controller:', error);
    return res.status(500).json({ error: 'Failed to send notification.' });
  }
};
