const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(48).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set in environment - using a random secret generated at startup.');
  console.warn('Sessions will not survive a server restart. Set JWT_SECRET in a .env file for production use.');
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
