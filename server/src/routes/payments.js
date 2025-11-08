import express from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { addMonth } from '../utils/date.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  let rows;
  if (role === 'customer') {
    [rows] = await pool.execute('SELECT p.*, c.name AS customer_name FROM payments p JOIN customers c ON c.id=p.customerId WHERE p.customerId = ? ORDER BY p.date DESC', [req.user.id]);
  } else {
    [rows] = await pool.execute('SELECT p.*, c.name AS customer_name FROM payments p JOIN customers c ON c.id=p.customerId ORDER BY p.date DESC');
  }
  res.json(rows);
});

const createSchema = z.object({ body: z.object({ customerId: z.number().int().positive(), amount: z.number().positive(), method: z.string().default('Cash') }) });
router.post('/', requireAuth, validate(createSchema), async (req, res) => {
  const { customerId, amount, method } = req.validated.body;
  await withTransaction(async (conn) => {
    await conn.execute('INSERT INTO payments (customerId, amount, method, date) VALUES (?, ?, ?, CURDATE())', [customerId, amount, method]);
    const [[cust]] = await conn.query('SELECT renewalDate FROM customers WHERE id=?', [customerId]);
    const nextRenewal = addMonth(cust.renewalDate || new Date().toISOString().split('T')[0]);
    await conn.execute('UPDATE customers SET isPaid=1, monthlyConsumption=0, renewalDate=? WHERE id=?', [nextRenewal, customerId]);
  });
  res.status(201).json({ ok: true });
});

export default router;