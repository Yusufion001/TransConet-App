import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
import { prismaRLS as prisma } from '../db/prisma';

// Get all broadcasts
router.get('/', async (req, res) => {
  try {
    if (prisma) {
      const broadcasts = await prisma.broadcast.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, broadcasts });
    } else {
      res.json({ success: true, broadcasts: [] });
    }
  } catch (err) {
    console.error('Error fetching broadcasts:', err);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

// Create a new broadcast
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req: any, res) => {
  try {
    const { title, content, category, severity } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (prisma) {
      const broadcast = await prisma.broadcast.create({
        data: {
          title,
          content,
          category: category || 'ALL',
          severity: severity || 'INFO',
          source: 'Admin'
        }
      });
      res.json({ success: true, broadcast });
    } else {
      res.json({ success: true, broadcast: { title, content, category, severity, source: 'Admin', createdAt: new Date() } });
    }
  } catch (err) {
    console.error('Error creating broadcast:', err);
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

export default router;