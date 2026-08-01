import { z } from 'zod';
import { CargoType } from '@prisma/client';

export const createLoadSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    cargoType: z.nativeEnum(CargoType),
    weightKg: z.number().positive("Weight must be greater than 0").or(z.string().regex(/^\d+$/).transform(Number)),
    origin: z.string().min(1, "Origin is required"),
    destination: z.string().min(1, "Destination is required"),
    suggestedBudget: z.number().positive().optional().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional()),
    isEscrowEnabled: z.boolean().optional().or(z.string().transform(val => val === 'true').optional())
  })
});

export const updateLoadSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    cargoType: z.nativeEnum(CargoType).optional(),
    weightKg: z.number().positive().or(z.string().regex(/^\d+$/).transform(Number)).optional(),
    origin: z.string().min(1).optional(),
    destination: z.string().min(1).optional(),
    suggestedBudget: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).optional(),
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    isEscrowEnabled: z.boolean().or(z.string().transform(val => val === 'true')).optional()
  })
});
