import express from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  let rows;
  if (role === 'customer') {
    [rows] = await pool.execute('SELECT * FROM orders WHERE customerId = ? ORDER BY date DESC', [req.user.id]);
  } else {
    [rows] = await pool.execute('SELECT * FROM orders ORDER BY date DESC');
  }
  res.json(rows);
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

  const [result] = await pool.execute(
    'INSERT INTO orders (customerId, quantity, status, date, time) VALUES (?, ?, ?, CURDATE(), DATE_FORMAT(NOW(), "%h:%i %p"))',
    [customerId, quantity, 'pending']
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id/delivered', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await withTransaction(async (conn) => {
    const [[order]] = await conn.query('SELECT * FROM orders WHERE id=?', [id]);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    await conn.execute('UPDATE orders SET status=?, deliveredDate=CURDATE() WHERE id=?', ['delivered', id]);
    await conn.execute(
      'INSERT INTO deliveries (customerId, quantity, liters, date, time) VALUES (?, ?, ?, CURDATE(), DATE_FORMAT(NOW(), "%h:%i %p"))',
      [order.customerId, order.quantity, order.quantity * 18.9]
    );
  });
  res.json({ ok: true });
});

export default router;