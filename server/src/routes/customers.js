import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT id, name, phone, address, city, email, joinDate, renewalDate, totalBottles, monthlyConsumption, isPaid FROM customers ORDER BY id DESC');
  res.json(result.rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const custResult = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  const customer = custResult.rows[0];
  if (!customer) return res.status(404).json({ error: 'Not found' });
  const delResult = await pool.query('SELECT * FROM deliveries WHERE customerId = $1 ORDER BY date DESC', [id]);
  const payResult = await pool.query('SELECT * FROM payments WHERE customerId = $1 ORDER BY date DESC', [id]);
  customer.deliveries = delResult.rows;
  customer.payments = payResult.rows;
  res.json(customer);
});

// Password validation: min 8 chars, must contain letter and number (same as auth.js)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const upsertSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(128),
    phone: z.string().min(5).max(32),
    password: passwordSchema.optional(),
    address: z.string().max(255).optional(),
    city: z.string().max(64).optional(),
    email: z.string().email().max(128).optional().or(z.literal('')),
    joinDate: z.string().optional(),
    renewalDate: z.string().optional(),
  }),
});

router.post('/', requireAuth, requireAdmin, validate(upsertSchema), async (req, res) => {
  const { name, phone, password, address, city, email, joinDate, renewalDate } = req.validated.body;
  const password_hash = password ? await bcrypt.hash(password, 10) : null;
  const result = await pool.query(
    'INSERT INTO customers (name, phone, password_hash, address, city, email, joinDate, renewalDate, totalBottles, monthlyConsumption, isPaid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 1) RETURNING id',
    [name, phone, password_hash, address || null, city || null, email || null, joinDate || null, renewalDate || null]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id', requireAuth, validate(upsertSchema), async (req, res) => {
  const id = Number(req.params.id);

  // Authorization: customers can only update their own data, admins can update any
  if (req.user.role === 'customer' && req.user.id !== id) {
    return res.status(403).json({ error: 'You can only update your own profile' });
  }

  const { name, phone, address, city, email } = req.validated.body;
  const result = await pool.query(
    'UPDATE customers SET name=$1, phone=$2, address=$3, city=$4, email=$5 WHERE id=$6',
    [name, phone, address || null, city || null, email || null, id]
  );
  res.json({ affectedRows: result.rowCount });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM deliveries WHERE customerId=$1', [id]);
  await pool.query('DELETE FROM payments WHERE customerId=$1', [id]);
  const result = await pool.query('DELETE FROM customers WHERE id=$1', [id]);
  res.json({ affectedRows: result.rowCount });
});

export default router;