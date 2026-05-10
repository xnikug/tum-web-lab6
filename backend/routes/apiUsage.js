const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool }  = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const wrap   = fn => (req, res, next) => fn(req, res, next).catch(next);

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiUsage:
 *       type: object
 *       required: [keyId, date, tokens]
 *       properties:
 *         id:            { type: string, format: uuid, readOnly: true }
 *         keyId:         { type: string, description: "ID of the associated API key" }
 *         date:          { type: string, format: date, example: "2026-05-11" }
 *         tokens:        { type: integer, example: 10000 }
 *         estimatedCost: { type: number, example: 0.15 }
 *         provider:      { type: string, readOnly: true, description: "Joined from api_keys" }
 */

/**
 * @swagger
 * /api/api-usage:
 *   get:
 *     summary: List API usage logs (paginated)
 *     tags: [API Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: limit,  schema: { type: integer, default: 20 } }
 *       - { in: query, name: offset, schema: { type: integer, default: 0 } }
 *       - { in: query, name: keyId,  schema: { type: string }, description: "Filter by API key ID" }
 *       - { in: query, name: from,   schema: { type: string, format: date }, description: "From date (inclusive)" }
 *       - { in: query, name: to,     schema: { type: string, format: date }, description: "To date (inclusive)" }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:       { type: array, items: { $ref: '#/components/schemas/ApiUsage' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalTokens: { type: integer }
 *                     totalCost:   { type: number }
 */
router.get('/', authenticate('READ'), wrap(async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0,  0);
  const { keyId, from, to } = req.query;

  const conditions = ['1=1'];
  const params     = [];

  if (keyId) { params.push(keyId); conditions.push(`u."keyId" = $${params.length}`); }
  if (from)  { params.push(from);  conditions.push(`u.date >= $${params.length}`); }
  if (to)    { params.push(to);    conditions.push(`u.date <= $${params.length}`); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows: [countRow] } = await pool.query(
    `SELECT COUNT(*) as count,
            COALESCE(SUM(u.tokens), 0) as "totalTokens",
            COALESCE(SUM(u."estimatedCost"), 0) as "totalCost"
     FROM api_usage u ${where}`, params
  );

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT u.*, k.provider
     FROM api_usage u
     LEFT JOIN api_keys k ON u."keyId" = k.id
     ${where}
     ORDER BY u.date DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    data: rows,
    pagination: {
      total: parseInt(countRow.count), limit, offset,
      hasMore: offset + limit < parseInt(countRow.count),
    },
    summary: {
      totalTokens: parseInt(countRow.totalTokens),
      totalCost:   parseFloat(countRow.totalCost),
    },
  });
}));

/**
 * @swagger
 * /api/api-usage/{id}:
 *   get:
 *     summary: Get a usage log by ID
 *     tags: [API Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiUsage' }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate('READ'), wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.*, k.provider FROM api_usage u LEFT JOIN api_keys k ON u."keyId" = k.id WHERE u.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Usage log not found' });
  res.json(rows[0]);
}));

/**
 * @swagger
 * /api/api-usage:
 *   post:
 *     summary: Log API usage
 *     tags: [API Usage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiUsage' }
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiUsage' }
 *       400: { description: Validation error }
 *       404: { description: API key not found }
 */
router.post('/', authenticate('WRITE'), wrap(async (req, res) => {
  const { keyId, date, tokens, estimatedCost = 0 } = req.body;

  if (!keyId)                              return res.status(400).json({ error: 'keyId is required' });
  if (!date)                               return res.status(400).json({ error: 'date is required' });
  if (tokens === undefined || tokens < 0)  return res.status(400).json({ error: 'tokens must be a non-negative integer' });

  const { rows: key } = await pool.query('SELECT id FROM api_keys WHERE id = $1', [keyId]);
  if (!key[0]) return res.status(404).json({ error: 'API key not found' });

  const id = uuidv4();
  await pool.query(
    `INSERT INTO api_usage (id, "keyId", date, tokens, "estimatedCost") VALUES ($1,$2,$3,$4,$5)`,
    [id, keyId, date, parseInt(tokens), parseFloat(estimatedCost)]
  );

  const { rows } = await pool.query(
    `SELECT u.*, k.provider FROM api_usage u LEFT JOIN api_keys k ON u."keyId" = k.id WHERE u.id = $1`,
    [id]
  );
  res.status(201).json(rows[0]);
}));

/**
 * @swagger
 * /api/api-usage/{id}:
 *   put:
 *     summary: Update a usage log
 *     tags: [API Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiUsage' }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiUsage' }
 *       404: { description: Not found }
 */
router.put('/:id', authenticate('WRITE'), wrap(async (req, res) => {
  const { rows: existing } = await pool.query('SELECT * FROM api_usage WHERE id = $1', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: 'Usage log not found' });

  const e = existing[0];
  const {
    date          = e.date,
    tokens        = e.tokens,
    estimatedCost = e.estimatedCost,
  } = req.body;

  await pool.query(
    `UPDATE api_usage SET date=$1, tokens=$2, "estimatedCost"=$3 WHERE id=$4`,
    [date, parseInt(tokens), parseFloat(estimatedCost), req.params.id]
  );

  const { rows: full } = await pool.query(
    `SELECT u.*, k.provider FROM api_usage u LEFT JOIN api_keys k ON u."keyId" = k.id WHERE u.id = $1`,
    [req.params.id]
  );
  res.json(full[0]);
}));

/**
 * @swagger
 * /api/api-usage/{id}:
 *   delete:
 *     summary: Delete a usage log
 *     tags: [API Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', authenticate('DELETE'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM api_usage WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Usage log not found' });
  res.status(204).send();
}));

module.exports = router;
