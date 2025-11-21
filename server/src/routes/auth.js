import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { signToken } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Password validation: min 8 chars, must contain letter and number
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const adminSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(64),
    password: passwordSchema,
  }),
});

router.post('/admin/login', validate(adminSchema), async (req, res) => {
  const { username, password } = req.validated.body;
  const result = await pool.query('SELECT id, username, password_hash FROM admins WHERE username = $1', [username]);
  const user = result.rows[0];

  // Generic error message to prevent username enumeration
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = signToken({ id: user.id, role: 'admin' });
  res.json({ token, user: { id: user.id, username } });
});

const custSchema = z.object({
  body: z.object({
    phone: z.string().min(5).max(32),
    password: passwordSchema,
  }),
});

router.post('/customer/login', validate(custSchema), async (req, res) => {
  const { phone, password } = req.validated.body;
  const result = await pool.query('SELECT id, name, phone, password_hash FROM customers WHERE phone = $1', [phone]);
  const c = result.rows[0];

  // Generic error message to prevent phone enumeration
  if (!c) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const ok = await bcrypt.compare(password, c.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const token = signToken({ id: c.id, role: 'customer' });
  res.json({ token, user: { id: c.id, name: c.name, phone: c.phone } });
});

export default router;