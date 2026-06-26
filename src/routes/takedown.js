// Yeh file takedown requests (violation pe action) ka logic handle karti hai

import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// FILE/UPDATE TAKEDOWN - Violation pe takedown file karne ke liye
// POST /api/takedowns (protected)
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { scanResultId, notes } = req.body;

    if (!scanResultId) {
      return res.status(400).json({ error: 'scanResultId required' });
    }

    // Confirm karo yeh scan result isi user ka hai
    const scanResult = await prisma.scanResult.findUnique({ where: { id: scanResultId } });
    if (!scanResult || scanResult.userId !== req.userId) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const takedown = await prisma.takedownRequest.upsert({
      where: { scanResultId },
      update: { notes },
      create: { scanResultId, userId: req.userId, notes },
    });

    res.status(201).json({
      message: 'Takedown request file done',
      takedown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// LIST TAKEDOWNS - Sab takedown requests dekhne ke liye
// GET /api/takedowns (protected)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const takedowns = await prisma.takedownRequest.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { scanResult: true },
    });

    res.json({ takedowns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// UPDATE STATUS - Takedown ka status badalne ke liye (e.g. "resolved")
// PATCH /api/takedowns/:id (protected)
// ============================================
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status required' });
    }

    const existing = await prisma.takedownRequest.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Takedown request not found' });
    }

    const updated = await prisma.takedownRequest.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      },
    });

    res.json({ message: 'Status updated successfully', takedown: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

export default router;