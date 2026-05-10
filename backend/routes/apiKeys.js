const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool }  = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const wrap   = fn => (req, res, next) => fn(req, res, next).catch(next);

const mask = key => key && key.length > 8
  ? key.slice(0, 4) + '...' + key.slice(-4)
  : '****';

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiKey:
 *       type: object
 *       required: [provider, name, key]
 *       properties:
 *         id:         { type: string, format: uuid, readOnly: true }
 *         provider:   { type: string, example: OpenAI }
 *         name:       { type: string, example: Production key }
 *         key:        { type: string, example: "sk-op...1234", description: "Masked in responses" }
 *         projectTag: { type: string, example: prod }
 */

/**
 * @swagger
 * /api/api-keys:
 *   get:
 *     summary: List API keys (key values masked)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: limit,    schema: { type: integer, default: 20 } }
 *       - { in: query, name: offset,   schema: { type: integer, default: 0 } }
 *       - { in: query, name: provider, schema: { type: string }, description: "Filter by provider" }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:       { type: array, items: { $ref: '#/components/schemas/ApiKey' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', authenticate('READ'), wrap(async (req, res) => {
  const limit    = Math.min(parseInt(req.query.limit)  || 20, 100);
  const offset   = Math.max(parseInt(req.query.offset) || 0,  0);
  const { provider } = req.query;

  const conditions = ['1=1'];
  const params     = [];

  if (provider) { params.push(`%${provider}%`); conditions.push(`provider ILIKE $${params.length}`); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM api_keys ${where}`, params);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT * FROM api_keys ${where} ORDER BY name LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    data: rows.map(r => ({ ...r, key: mask(r.key) })),
    pagination: { total: parseInt(count), limit, offset, hasMore: offset + limit < parseInt(count) },
  });
}));

/**
 * @swagger
 * /api/api-keys/{id}:
 *   get:
 *     summary: Get an API key by ID (key masked)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiKey' }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate('READ'), wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM api_keys WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'API key not found' });
  res.json({ ...rows[0], key: mask(rows[0].key) });
}));

/**
 * @swagger
 * /api/api-keys:
 *   post:
 *     summary: Register a new API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiKey' }
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiKey' }
 *       400: { description: Validation error }
 */
router.post('/', authenticate('WRITE'), wrap(async (req, res) => {
  const { provider, name, key, projectTag = '' } = req.body;

  if (!provider) return res.status(400).json({ error: 'provider is required' });
  if (!name)     return res.status(400).json({ error: 'name is required' });
  if (!key)      return res.status(400).json({ error: 'key is required' });

  const id = uuidv4();
  const { rows } = await pool.query(
    `INSERT INTO api_keys (id, provider, name, key, "projectTag") VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, provider, name, key, projectTag]
  );
  res.status(201).json({ ...rows[0], key: mask(rows[0].key) });
}));

/**
 * @swagger
 * /api/api-keys/{id}:
 *   put:
 *     summary: Update an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiKey' }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiKey' }
 *       404: { description: Not found }
 */
router.put('/:id', authenticate('WRITE'), wrap(async (req, res) => {
  const { rows: existing } = await pool.query('SELECT * FROM api_keys WHERE id = $1', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: 'API key not found' });

  const e = existing[0];
  const {
    provider   = e.provider,
    name       = e.name,
    key        = e.key,
    projectTag = e.projectTag,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE api_keys SET provider=$1, name=$2, key=$3, "projectTag"=$4 WHERE id=$5 RETURNING *`,
    [provider, name, key, projectTag, req.params.id]
  );
  res.json({ ...rows[0], key: mask(rows[0].key) });
}));

/**
 * @swagger
 * /api/api-keys/{id}:
 *   delete:
 *     summary: Delete an API key (cascades to usage logs)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', authenticate('DELETE'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM api_keys WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'API key not found' });
  res.status(204).send();
}));

module.exports = router;
