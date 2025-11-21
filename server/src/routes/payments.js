import express from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { addMonth } from '../utils/date.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  let result;
  if (role === 'customer') {
    result = await pool.query('SELECT p.*, c.name AS customer_name FROM payments p JOIN customers c ON c.id=p.customerId WHERE p.customerId = $1 ORDER BY p.date DESC', [req.user.id]);
  } else {
    result = await pool.query('SELECT p.*, c.name AS customer_name FROM payments p JOIN customers c ON c.id=p.customerId ORDER BY p.date DESC');
  }
  res.json(result.rows);
});

const createSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    amount: z.number().positive().max(1000000), // Max 1 million per payment
    method: z.enum(['Cash', 'Card', 'Bank Transfer', 'Online']).default('Cash'),
  }),
});

router.post('/', requireAuth, requireAdmin, validate(createSchema), async (req, res) => {
  const { customerId, amount, method } = req.validated.body;
  await withTransaction(async (client) => {
    await client.query('INSERT INTO payments (customerId, amount, method, date) VALUES ($1, $2, $3, CURRENT_DATE)', [customerId, amount, method]);
    const custResult = await client.query('SELECT renewalDate FROM customers WHERE id=$1', [customerId]);
    const cust = custResult.rows[0];
    const nextRenewal = addMonth(cust.renewaldate || new Date().toISOString().split('T')[0]);
    await client.query('UPDATE customers SET isPaid=1, monthlyConsumption=0, renewalDate=$1 WHERE id=$2', [nextRenewal, customerId]);
  });
  res.status(201).json({ ok: true });
});

export default router;