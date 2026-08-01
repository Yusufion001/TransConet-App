import { describe, it, expect, vi } from 'vitest';
import { placeBid } from '../src/controllers/bidController';
import { Request, Response } from 'express';

vi.mock('../src/db/prisma', () => ({
  prisma: {
    $executeRawUnsafe: vi.fn(),
  },
  prismaRLS: {
    $executeRawUnsafe: vi.fn(),

    bid: {
      create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    loadPosting: {
      findUnique: vi.fn().mockResolvedValue({ id: 'load1', status: 'AVAILABLE' })
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'user1' })
    }
  }
}));

describe('Bid Controller', () => {
  it('should place a bid', async () => {
    const req = {
      body: {
        loadId: 'load1',
        amount: 500
      },
      user: {
        id: 'user1'
      }
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
