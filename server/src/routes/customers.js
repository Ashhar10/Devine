import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.execute('SELECT id, name, phone, address, city, email, joinDate, renewalDate, totalBottles, monthlyConsumption, isPaid FROM customers ORDER BY id DESC');
  res.json(rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [custRows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
  const customer = custRows[0];
  if (!customer) return res.status(404).json({ error: 'Not found' });
  const [delRows] = await pool.execute('SELECT * FROM deliveries WHERE customerId = ? ORDER BY date DESC', [id]);
  const [payRows] = await pool.execute('SELECT * FROM payments WHERE customerId = ? ORDER BY date DESC', [id]);
  customer.deliveries = delRows;
  customer.payments = payRows;
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
  const [result] = await pool.execute(
    'INSERT INTO customers (name, phone, password_hash, address, city, email, joinDate, renewalDate, totalBottles, monthlyConsumption, isPaid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)',
    [name, phone, password_hash, address || null, city || null, email || null, joinDate || null, renewalDate || null]
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', requireAuth, validate(upsertSchema), async (req, res) => {
  const id = Number(req.params.id);

  // Authorization: customers can only update their own data, admins can update any
  if (req.user.role === 'customer' && req.user.id !== id) {
    return res.status(403).json({ error: 'You can only update your own profile' });
  }

  const { name, phone, address, city, email } = req.validated.body;
  const [result] = await pool.execute(
    'UPDATE customers SET name=?, phone=?, address=?, city=?, email=? WHERE id=?',
    [name, phone, address || null, city || null, email || null, id]
  );
  res.json({ affectedRows: result.affectedRows });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await pool.execute('DELETE FROM deliveries WHERE customerId=?', [id]);
  await pool.execute('DELETE FROM payments WHERE customerId=?', [id]);
  const [result] = await pool.execute('DELETE FROM customers WHERE id=?', [id]);
  res.json({ affectedRows: result.affectedRows });
});

export default router;