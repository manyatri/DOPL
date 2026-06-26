// Yeh main file hai jo server start karti hai

import scanTargetRoutes from './routes/scanTarget.js';
import keywordRoutes from './routes/keyword.js';
import platformRoutes from './routes/platform.js';
import 'dotenv/config';
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO - undefined!');
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import scanResultRoutes from './routes/scanResult.js';
import takedownRoutes from './routes/takedown.js';
import alertRoutes from './routes/alert.js';
import startTelegramScanner from './scanner/telegramScanner.js';

const app = express();

// Middleware
app.use(cors());           // frontend se request allow karne ke liye
app.use(express.json());   // JSON data parse karne ke liye

// Test route - check karne ke liye server chal raha hai
app.get('/', (req, res) => {
  res.json({ message: 'DOPL running' });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/scan-targets', scanTargetRoutes);
app.use('/api/scan-results', scanResultRoutes);
app.use('/api/takedowns', takedownRoutes);
app.use('/api/alerts', alertRoutes);

// ← YAHAN ADD KARO
app.post('/api/scan/run-now', async (req, res) => {
  res.json({ message: 'Scan started.' });
  startTelegramScanner().catch(err => console.error('[Scanner] Manual run failed:', err.message));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
  startTelegramScanner();
});
