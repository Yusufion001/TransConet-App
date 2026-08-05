import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  $queryRawUnsafe: vi.fn(),
  loadPosting: { findUnique: vi.fn(), create: vi.fn() },
  bid: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../src/db/prisma', () => ({ prismaBypass: mockPrisma }));

import { approveAction, processAutomationMessage, rejectAction } from '../src/services/aiAutomationService';

describe('AI automation approval protection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores a transporter bid as PENDING_APPROVAL and does not submit it during preparation', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
      id: 'action-1', user_id: 'transporter-1', role: 'TRANSPORTER', action_name: 'place_bid',
      status: 'PENDING_APPROVAL', payload: { loadId: 'load-1', amount: 400000 },
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    }]);

    const result = await processAutomationMessage('transporter-1', 'TRANSPORTER', 'Can I bid on that one? ₦400,000', { loadId: 'load-1' });

    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].action_name).toBe('place_bid');
    expect(result.actions[0].status).toBe('PENDING_APPROVAL');
    expect(mockPrisma.bid.create).not.toHaveBeenCalled();
  });

  it('does not execute a pending action until approveAction is explicitly called', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
      id: 'action-2', user_id: 'transporter-1', role: 'TRANSPORTER', action_name: 'place_bid',
      status: 'PENDING_APPROVAL', payload: { loadId: 'load-2', amount: 400000 },
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    }]);

    const prepared = await processAutomationMessage('transporter-1', 'TRANSPORTER', 'Place the bid', { loadId: 'load-2', amount: 400000 });
    expect(prepared.actions[0].status).toBe('PENDING_APPROVAL');
    expect(mockPrisma.bid.create).not.toHaveBeenCalled();

    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
      id: 'action-2', user_id: 'transporter-1', role: 'TRANSPORTER', action_name: 'place_bid',
      status: 'PENDING_APPROVAL', payload: { loadId: 'load-2', amount: 400000 },
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    }]);
    mockPrisma.loadPosting.findUnique.mockResolvedValue({ id: 'load-2', status: 'AVAILABLE' });
    mockPrisma.bid.findFirst.mockResolvedValue(null);
    mockPrisma.bid.create.mockResolvedValue({ id: 'bid-2', loadId: 'load-2', driverId: 'transporter-1', amount: 400000 });
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
      id: 'action-2', user_id: 'transporter-1', role: 'TRANSPORTER', action_name: 'place_bid',
      status: 'COMPLETED', payload: { loadId: 'load-2', amount: 400000 },
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    }]);

    const approved = await approveAction('transporter-1', 'action-2');
    expect(mockPrisma.bid.create).toHaveBeenCalledTimes(1);
    expect(approved?.status).toBe('COMPLETED');
  });

  it('rejects a pending action without executing the business operation', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
      id: 'action-3', user_id: 'transporter-1', role: 'TRANSPORTER', action_name: 'place_bid',
      status: 'REJECTED', payload: { loadId: 'load-3', amount: 400000 },
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    }]);

    const rejected = await rejectAction('transporter-1', 'action-3');
    expect(rejected?.status).toBe('REJECTED');
    expect(mockPrisma.bid.create).not.toHaveBeenCalled();
    expect(mockPrisma.loadPosting.create).not.toHaveBeenCalled();
  });
});
