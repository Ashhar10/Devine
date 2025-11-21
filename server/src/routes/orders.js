import express from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  const query = 'SELECT id, customerId AS "customerId", quantity, status, date, time, deliveredDate AS "deliveredDate" FROM orders';
  let result;
  if (role === 'customer') {
    result = await pool.query(`${query} WHERE customerId = $1 ORDER BY date DESC`, [req.user.id]);
  } else {
    result = await pool.query(`${query} ORDER BY date DESC`);
  }
  res.json(result.rows);
});

const createSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100), // Max 100 bottles per order
  }),
});

router.post('/', requireAuth, validate(createSchema), async (req, res) => {
  const { customerId, quantity } = req.validated.body;

  // Authorization: customers can only create orders for themselves
  if (req.user.role === 'customer' && req.user.id !== customerId) {
    return res.status(403).json({ error: 'You can only create orders for yourself' });
  }

  const result = await pool.query(
    'INSERT INTO orders (customerId, quantity, status, date, time) VALUES ($1, $2, $3, CURRENT_DATE, TO_CHAR(NOW(), \'HH12:MI AM\')) RETURNING id',
    [customerId, quantity, 'pending']
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id/delivered', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await withTransaction(async (client) => {
    const orderResult = await client.query('SELECT * FROM orders WHERE id=$1', [id]);
    const order = orderResult.rows[0];
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    await client.query('UPDATE orders SET status=$1, deliveredDate=CURRENT_DATE WHERE id=$2', ['delivered', id]);
    await client.query(
      'INSERT INTO deliveries (customerId, quantity, liters, date, time) VALUES ($1, $2, $3, CURRENT_DATE, TO_CHAR(NOW(), \'HH12:MI AM\'))',
      [order.customerid, order.quantity, order.quantity * 18.9]
    );
  });
  res.json({ ok: true });
});

export default router;