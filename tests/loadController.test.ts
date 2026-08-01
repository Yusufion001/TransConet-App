import { describe, it, expect, vi } from 'vitest';
import { createLoad, getLoadPostings } from '../src/controllers/loadController';
import { Request, Response } from 'express';
import { CargoType } from '@prisma/client';

vi.mock('@google/genai', () => ({ GoogleGenAI: vi.fn().mockImplementation(() => ({ models: { embedContent: vi.fn().mockResolvedValue({ embeddings: [{ values: new Array(768).fill(0.1) }] }) } })) }));
vi.mock('../src/db/prisma', () => ({
  prisma: { loadPosting: { create: vi.fn().mockResolvedValue({ id: "1" }), findMany: vi.fn().mockResolvedValue([]) },
    $executeRawUnsafe: vi.fn(),
  },
  prismaRLS: {
    $executeRawUnsafe: vi.fn(),

    loadPosting: {
      create: vi.fn().mockResolvedValue({ id: '1', title: 'Test Load', cargoType: 'AGRICULTURAL_GOODS', weightKg: 1000, origin: 'Lagos', destination: 'Abuja' }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'user1' }),
      findFirst: vi.fn().mockResolvedValue({ id: 'user1' }),
      create: vi.fn().mockResolvedValue({ id: 'user1' }),
    }
  }
}));

describe('Load Controller', () => {
  it('should create a new load', async () => {
    const req = {
      body: {
        title: 'Test Load',
        origin: 'Lagos',
        destination: 'Abuja',
        weightKg: 1000,
        cargoType: "AGRICULTURAL_GOODS",
        userPhone: '1234567890'
      },
      user: {
        id: 'user1'
      }
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    await createLoad(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should get load postings', async () => {
    const req = {
      query: {
        origin: 'Lagos',
      }
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    await getLoadPostings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
