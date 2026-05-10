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
 *     Subscription:
 *       type: object
 *       required: [serviceName, cost, renewalDate]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           readOnly: true
 *         serviceName:
 *           type: string
 *           example: Netflix
 *         category:
 *           type: string
 *           enum: [Productivity, Design, Communication, Analytics, Security, Storage, Other]
 *           example: Other
 *         cost:
 *           type: number
 *           example: 15.99
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly]
 *           example: monthly
 *         currency:
 *           type: string
 *           enum: [USD, EUR, MDL]
 *           example: USD
 *         renewalDate:
 *           type: string
 *           format: date
 *           example: "2026-06-01"
 *         status:
 *           type: string
 *           enum: [active, paused]
 *           example: active
 *         notes:
 *           type: string
 *           example: Family plan
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     Pagination:
 *       type: object
 *       properties:
 *         total:    { type: integer }
 *         limit:    { type: integer }
 *         offset:   { type: integer }
 *         hasMore:  { type: boolean }
 */

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: List subscriptions (paginated + filterable)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: limit,    schema: { type: integer, default: 20 }, description: "Max results (≤100)" }
 *       - { in: query, name: offset,   schema: { type: integer, default: 0  }, description: "Results to skip" }
 *       - { in: query, name: status,   schema: { type: string, enum: [active, paused] } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: search,   schema: { type: string }, description: "Search by service name" }
 *     responses:
 *       200:
 *         description: Paginated subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:       { type: array, items: { $ref: '#/components/schemas/Subscription' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', authenticate('READ'), wrap(async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0,  0);
  const { status, category, search } = req.query;

  const conditions = ['1=1'];
  const params     = [];

  if (status)   { params.push(status);          conditions.push(`status = $${params.length}`); }
  if (category) { params.push(category);         conditions.push(`category = $${params.length}`); }
  if (search)   { params.push(`%${search}%`);   conditions.push(`"serviceName" ILIKE $${params.length}`); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) FROM subscriptions ${where}`, params
  );

  params.push(limit, offset);
  const { rows: data } = await pool.query(
    `SELECT * FROM subscriptions ${where} ORDER BY "createdAt" DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ data, pagination: { total: parseInt(count), limit, offset, hasMore: offset + limit < parseInt(count) } });
}));

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Subscription' }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate('READ'), wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM subscriptions WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Subscription not found' });
  res.json(rows[0]);
}));

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Subscription' }
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Subscription' }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post('/', authenticate('WRITE'), wrap(async (req, res) => {
  const {
    serviceName, category = 'Other', cost, billingCycle = 'monthly',
    currency = 'USD', renewalDate, status = 'active', notes = '',
  } = req.body;

  if (!serviceName)                    return res.status(400).json({ error: 'serviceName is required' });
  if (!cost || isNaN(cost) || cost<=0) return res.status(400).json({ error: 'cost must be a positive number' });
  if (!renewalDate)                    return res.status(400).json({ error: 'renewalDate is required' });

  const id = uuidv4();
  const { rows } = await pool.query(
    `INSERT INTO subscriptions (id, "serviceName", category, cost, "billingCycle", currency, "renewalDate", status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [id, serviceName, category, cost, billingCycle, currency, renewalDate, status, notes]
  );
  res.status(201).json(rows[0]);
}));

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   put:
 *     summary: Update a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Subscription' }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Subscription' }
 *       404: { description: Not found }
 */
router.put('/:id', authenticate('WRITE'), wrap(async (req, res) => {
  const { rows: existing } = await pool.query('SELECT * FROM subscriptions WHERE id = $1', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: 'Subscription not found' });

  const e = existing[0];
  const {
    serviceName  = e.serviceName,
    category     = e.category,
    cost         = e.cost,
    billingCycle = e.billingCycle,
    currency     = e.currency,
    renewalDate  = e.renewalDate,
    status       = e.status,
    notes        = e.notes,
  } = req.body;

  if (isNaN(cost) || cost <= 0) return res.status(400).json({ error: 'cost must be a positive number' });

  const { rows } = await pool.query(
    `UPDATE subscriptions SET "serviceName"=$1, category=$2, cost=$3, "billingCycle"=$4,
     currency=$5, "renewalDate"=$6, status=$7, notes=$8 WHERE id=$9 RETURNING *`,
    [serviceName, category, cost, billingCycle, currency, renewalDate, status, notes, req.params.id]
  );
  res.json(rows[0]);
}));

/**
 * @swagger
 * /api/subscriptions/{id}/status:
 *   patch:
 *     summary: Toggle subscription status (active ↔ paused)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Subscription' }
 *       404: { description: Not found }
 */
router.patch('/:id/status', authenticate('WRITE'), wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT status FROM subscriptions WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Subscription not found' });

  const newStatus = rows[0].status === 'active' ? 'paused' : 'active';
  const { rows: updated } = await pool.query(
    'UPDATE subscriptions SET status=$1 WHERE id=$2 RETURNING *', [newStatus, req.params.id]
  );
  res.json(updated[0]);
}));

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   delete:
 *     summary: Delete a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', authenticate('DELETE'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM subscriptions WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Subscription not found' });
  res.status(204).send();
}));

module.exports = router;
