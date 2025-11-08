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

const upsertSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    password: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    email: z.string().email().optional(),
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