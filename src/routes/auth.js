// Yeh file signup aur login ka logic handle karti hai

import authMiddleware from '../middleware/authMiddleware.js';
import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// ============================================
// SIGNUP - Naya user account banane ke liye
// POST /api/auth/signup
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Step 1: Check karo saari fields aayi hain ya nahi
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Every field required' });
    }

    // Step 2: Check karo yeh email already use toh nahi ho rahi
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Mail already registered' });
    }

    // Step 3: Password ko hash karo (plain text mein kabhi save nahi karte)
    const passwordHash = await bcrypt.hash(password, 10);

    // Step 4: User ko database mein save karo
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash },
    });

    // Step 5: Login token bana ke bhej do
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Account created',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// LOGIN - Existing user ke liye
// POST /api/auth/login
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password both required' });
    }

    // Step 1: User ko email se dhundo
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email/password is incorrect' });
    }

    // Step 2: Password check karo (hash compare hota hai)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email/password is incorrect' });
    }

    // Step 3: Token bana ke bhej do
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// GET CURRENT USER - Test route for middleware
// GET /api/auth/me (protected — needs token)
// ============================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, fullName: true, email: true, plan: true },
    });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong,try again' });
  }
});

export default router;
