import { z } from 'zod';

export const initializeEscrowSchema = z.object({
  body: z.object({
    loadId: z.string().min(1, "Load ID is required"),
    amount: z.number().positive("Amount must be greater than 0").or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
    email: z.string().email().optional(),
    callbackUrl: z.string().url().optional()
  })
});

export const verifyEscrowSchema = z.object({
  body: z.object({
    reference: z.string().min(1, "Reference is required"),
    loadId: z.string().min(1, "Load ID is required")
  })
});

export const releaseEscrowSchema = z.object({
  body: z.object({
    loadId: z.string().min(1, "Load ID is required"),
    transporterId: z.string().min(1),
    shipperId: z.string().min(1),
    payoutAmount: z.number().positive()
  })
});
