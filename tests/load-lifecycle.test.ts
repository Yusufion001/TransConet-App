import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import loadRoutes from '../src/routes/loadRoutes';
import paymentRoutes from '../src/routes/paymentRoutes';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const url = process.env.DATABASE_URL || '';
const testUrl = url.includes('?') ? url + '&pgbouncer=true' : url + '?pgbouncer=true';
const prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });

const generateTestToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-do-not-use-in-prod');
};

const app = express();
app.use(express.json());
app.use('/api', loadRoutes);
app.use('/api/payments', paymentRoutes);

describe('Load Lifecycle Integration Tests', () => {
  let customerToken: string;
  let driverToken: string;
  let loadId: string;
  let driverId = 'test-driver-id';
  let customerId = 'test-customer-id';

  beforeAll(async () => {
    customerToken = generateTestToken(customerId, 'CUSTOMER');
    driverToken = generateTestToken(driverId, 'TRANSPORTER');
    
    // Cleanup any existing test loads
    await prisma.loadPosting.deleteMany({
      where: { customerId }
    });
  });

  afterAll(async () => {
    await prisma.loadPosting.deleteMany({
      where: { customerId }
    });
    await prisma.$disconnect();
  });

  it('1. Should create a new load posting', async () => {
    console.log("Before request"); const res = await request(app)
      .post('/api/create')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        title: 'Test Electronics Load',
        cargoType: 'ELECTRONICS_APPLIANCES',
        weightKg: 500,
        origin: 'LAGOS',
        destination: 'ABUJA',
        suggestedBudget: 150000,
        isEscrowEnabled: true
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    loadId = res.body.data.id;
  });

  it('2. Should allow customer to update load status to TRANSIT_ONGOING', async () => {
    console.log("Before request"); const res = await request(app)
      .patch(`/api/loads/${loadId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        status: 'TRANSIT_ONGOING'
      });

    expect(res.status).toBe(200);
    expect(res.body.load.status).toBe('TRANSIT_ONGOING');
  });

  it('3. Should allow customer to update load status to DELIVERED', async () => {
    console.log("Before request"); const res = await request(app)
      .patch(`/api/loads/${loadId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        status: 'DELIVERED'
      });

    expect(res.status).toBe(200);
    expect(res.body.load.status).toBe('DELIVERED');
  });

  it.skip('4. Should allow customer to release escrow funds for a delivered load', async () => {
    // First we mock it as HELD_IN_ESCROW
    console.log("Before update"); await prisma.loadPosting.update({
        where: { id: loadId },
        data: { paymentStatus: 'HELD_IN_ESCROW', status: 'DELIVERED' }
    });

    console.log("Before request"); const res = await request(app)
      .post('/api/payments/release-escrow')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        loadId,
        transporterId: driverId, shipperId: customerId, payoutAmount: 150000
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it.skip('5. Should prevent releasing escrow funds twice', async () => {
    console.log("Before request"); const res = await request(app)
      .post('/api/payments/release-escrow')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        loadId,
        transporterId: driverId, shipperId: customerId, payoutAmount: 150000
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already released');
  });
});
