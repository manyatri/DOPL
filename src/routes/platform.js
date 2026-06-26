// Yeh file user ke LMS/platform integration (signup step 2) ka logic handle karti hai

import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// CONNECT/UPDATE PLATFORM - LMS connect karne ke liye
// POST /api/platform/connect (protected)
// ============================================
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const { hostType, endpointUrl } = req.body;

    if (!hostType || !endpointUrl) {
      return res.status(400).json({ error: 'hostType and endpointUrl are important' });
    }

    // Upsert: agar pehle se integration hai toh update, nahi toh create
    const integration = await prisma.platformIntegration.upsert({
      where: { userId: req.userId },
      update: { hostType, endpointUrl },
      create: { userId: req.userId, hostType, endpointUrl },
    });

    res.status(200).json({
      message: 'Platform connected',
      integration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// GET CURRENT INTEGRATION - existing connection check karne ke liye
// GET /api/platform/connect (protected)
// ============================================
router.get('/connect', authMiddleware, async (req, res) => {
  try {
    const integration = await prisma.platformIntegration.findUnique({
      where: { userId: req.userId },
    });

    res.json({ integration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

export default router;