import { describe, it, expect, vi } from 'vitest';
import { registerPin } from '../src/controllers/authController';
import { Request, Response } from 'express';

vi.mock('../src/db/prisma', () => ({
  prisma: { $executeRawUnsafe: vi.fn() },
  prismaRLS: { $executeRawUnsafe: vi.fn(), user: { findFirst: vi.fn(), create: vi.fn() } }
}));

describe('Auth Controller', () => {
  it('should require phone number and PIN', async () => {
    const req = { body: {}, headers: { origin: 'https://transconet.com' } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await registerPin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Phone number and a 6-digit PIN are required.' });
  });
});
