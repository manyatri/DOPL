// Yeh middleware check karta hai ki request ke saath valid token aaya hai ya nahi
// Isko hum aage protected routes (jaise dashboard data) pe use karenge

import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  // Token "Authorization" header mein aata hai: "Bearer xxxxx"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // ab aage ke route mein req.userId use kar sakte hain
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

export default authMiddleware;
