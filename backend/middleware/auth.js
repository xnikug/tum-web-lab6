const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lab7-super-secret-key';

const ROLE_PERMISSIONS = {
  ADMIN:   ['READ', 'WRITE', 'DELETE'],
  WRITER:  ['READ', 'WRITE'],
  VISITOR: ['READ'],
};

function authenticate(requiredPermission) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      const { role, permissions = [] } = decoded;
      const effective = role
        ? [...new Set([...permissions, ...(ROLE_PERMISSIONS[role] || [])])]
        : permissions;

      if (!effective.includes(requiredPermission)) {
        return res.status(403).json({
          error: `Forbidden: requires ${requiredPermission} permission`,
          yourPermissions: effective,
        });
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired — request a new one at POST /token' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = { authenticate, JWT_SECRET };
