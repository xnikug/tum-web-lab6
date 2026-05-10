const express = require('express');
const jwt     = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const VALID_ROLES = ['ADMIN', 'WRITER', 'VISITOR'];
const VALID_PERMS = ['READ', 'WRITE', 'DELETE'];

function buildToken(role, permissions) {
  if (role && !VALID_ROLES.includes(role)) {
    return { error: `Invalid role. Valid values: ${VALID_ROLES.join(', ')}` };
  }
  if (permissions) {
    const bad = permissions.filter(p => !VALID_PERMS.includes(p));
    if (bad.length) return { error: `Invalid permissions: ${bad.join(', ')}. Valid: ${VALID_PERMS.join(', ')}` };
  }
  if (!role && (!permissions || permissions.length === 0)) {
    return { error: 'Provide a "role" (ADMIN|WRITER|VISITOR) or a "permissions" array (READ, WRITE, DELETE)' };
  }

  const payload = {};
  if (role)        payload.role        = role;
  if (permissions) payload.permissions = permissions;

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '60s' });
  return { token, expiresIn: '60s', ...payload };
}

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Generate a JWT access token
 *     description: |
 *       Returns a JWT that expires in **60 seconds** (demo mode).
 *
 *       **Roles** (expand to permissions automatically):
 *       | Role    | Permissions         |
 *       |---------|---------------------|
 *       | ADMIN   | READ, WRITE, DELETE |
 *       | WRITER  | READ, WRITE         |
 *       | VISITOR | READ                |
 *
 *       Or pass a custom `permissions` array instead.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, WRITER, VISITOR]
 *                 example: ADMIN
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [READ, WRITE, DELETE]
 *                 example: ["READ", "WRITE"]
 *     responses:
 *       200:
 *         description: JWT generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:      { type: string }
 *                 expiresIn:  { type: string, example: 60s }
 *                 role:       { type: string }
 *                 permissions:
 *                   type: array
 *                   items: { type: string }
 *       400:
 *         description: Missing or invalid role / permissions
 */
router.post('/', (req, res) => {
  const { role, permissions } = req.body || {};
  const result = buildToken(
    role ? role.toUpperCase() : undefined,
    Array.isArray(permissions) ? permissions.map(p => p.toUpperCase()) : undefined
  );
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Generate a JWT via query parameters (quick test)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, WRITER, VISITOR] }
 *       - in: query
 *         name: permissions
 *         schema: { type: string }
 *         description: Comma-separated, e.g. READ,WRITE
 *     responses:
 *       200:  { description: JWT generated }
 *       400:  { description: Invalid input }
 */
router.get('/', (req, res) => {
  const role        = req.query.role ? req.query.role.toUpperCase() : undefined;
  const permissions = req.query.permissions
    ? req.query.permissions.split(',').map(p => p.trim().toUpperCase())
    : undefined;

  const result = buildToken(role, permissions);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

module.exports = router;
