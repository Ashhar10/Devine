import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { signToken } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const adminSchema = z.object({ body: z.object({ username: z.string().min(3), password: z.string().min(4) }) });
router.post('/admin/login', validate(adminSchema), async (req, res, next) => {
  try {
    const { username, password } = req.validated.body;
    const [rows] = await pool.execute('SELECT id, username, password_hash FROM admins WHERE username = ?', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, role: 'admin' });
    res.json({ token, user: { id: user.id, username } });
  } catch (err) {
    next(err);
  }
});

const custSchema = z.object({ body: z.object({ phone: z.string().min(5), password: z.string().min(4) }) });
router.post('/customer/login', validate(custSchema), async (req, res, next) => {
  try {
    const { phone, password } = req.validated.body;
    const [rows] = await pool.execute('SELECT id, name, phone, password_hash FROM customers WHERE phone = ?', [phone]);
    const c = rows[0];
    if (!c) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, c.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: c.id, role: 'customer' });
    res.json({ token, user: { id: c.id, name: c.name, phone: c.phone } });
  } catch (err) {
    next(err);
  }
});

export default router;