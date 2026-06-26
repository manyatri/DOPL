// Yeh file scan targets (public telegram channels/groups jo scan honge) ka logic handle karti hai

import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// ADD SCAN TARGET - Naya telegram source add karne ke liye
// POST /api/scan-targets (protected)
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sourceUrl, sourceType } = req.body;

    if (!sourceUrl) {
      return res.status(400).json({ error: 'sourceUrl required' });
    }

    const target = await prisma.scanTarget.create({
      data: {
        userId: req.userId,
        sourceUrl,
        sourceType: sourceType || 'public_telegram',
      },
    });

    res.status(201).json({
      message: 'Scan target added!',
      target,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// LIST SCAN TARGETS - Sab targets dekhne ke liye
// GET /api/scan-targets (protected)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const targets = await prisma.scanTarget.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ targets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// DELETE SCAN TARGET - Target hatane ke liye
// DELETE /api/scan-targets/:id (protected)
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.scanTarget.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Scan target not found' });
    }

    await prisma.scanTarget.delete({ where: { id } });

    res.json({ message: 'Scan target deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

export default router;