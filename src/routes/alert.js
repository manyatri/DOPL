// This file handles alerts (notifications shown to the user)

import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// CREATE ALERT
// POST /api/alerts (protected)
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { scanResultId } = req.body;

    if (!scanResultId) {
      return res.status(400).json({ error: 'scanResultId is required' });
    }

    const scanResult = await prisma.scanResult.findUnique({ where: { id: scanResultId } });
    if (!scanResult || scanResult.userId !== req.userId) {
      return res.status(404).json({ error: 'Scan result not found' });
    }

    const alert = await prisma.alert.upsert({
      where: { scanResultId },
      update: {},
      create: { scanResultId, userId: req.userId },
    });

    res.status(201).json({
      message: 'Alert created successfully!',
      alert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

// ============================================
// LIST ALERTS
// GET /api/alerts (protected)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { scanResult: true },
    });

    res.json({ alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

// ============================================
// MARK AS READ/UNREAD
// PATCH /api/alerts/:id (protected)
// ============================================
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== 'boolean') {
      return res.status(400).json({ error: 'isRead (true/false) is required' });
    }

    const existing = await prisma.alert.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { isRead },
    });

    res.json({ message: 'Alert updated successfully!', alert: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

export default router;