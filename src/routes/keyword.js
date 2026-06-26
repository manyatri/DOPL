// Yeh file monitored keywords (signup step 3) ka logic handle karti hai

import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// ADD KEYWORD - Naya keyword add karne ke liye
// POST /api/keywords (protected)
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'keyword required' });
    }

    const newKeyword = await prisma.monitoredKeyword.create({
      data: { userId: req.userId, keyword },
    });

    res.status(201).json({
      message: 'Keyword added',
      keyword: newKeyword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// LIST KEYWORDS - Sab keywords dekhne ke liye
// GET /api/keywords (protected)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const keywords = await prisma.monitoredKeyword.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ keywords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// DELETE KEYWORD - Keyword hatane ke liye
// DELETE /api/keywords/:id (protected)
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Pehle check karo yeh keyword isi user ka hai
    const existing = await prisma.monitoredKeyword.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    await prisma.monitoredKeyword.delete({ where: { id } });

    res.json({ message: 'Keyword deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

export default router;