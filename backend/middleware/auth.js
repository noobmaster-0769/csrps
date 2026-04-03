const jwt = require('jsonwebtoken');

/**
 * authenticate — verifies Bearer JWT from Authorization header
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, email, role, student_id }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * authorize(...roles) — role-based access control middleware
 * Usage: router.post('/...', authenticate, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. Required role(s): ${roles.join(', ')}`
    });
  }
  next();
};

module.exports = { authenticate, authorize };
