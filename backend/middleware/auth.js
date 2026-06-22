// auth.js — Admin routes protect karna
// JWT token verify karta hai. Agar token nahi ya galat, 401 return karta hai.
// Usage: router.get('/orders', protect, getAllOrders)

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
