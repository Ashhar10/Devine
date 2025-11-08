import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  let rows;
  if (role === 'customer') {
    [rows] = await pool.execute('SELECT * FROM deliveries WHERE customerId = ? ORDER BY date DESC', [req.user.id]);
  } else {
    [rows] = await pool.execute('SELECT * FROM deliveries ORDER BY date DESC');
  }
  res.json(rows);
});

const createSchema = z.object({ body: z.object({ customerId: z.number().int().positive(), quantity: z.number().int().positive(), liters: z.number().positive().optional() }) });
router.post('/', requireAuth, validate(createSchema), async (req, res) => {
  const { customerId, quantity, liters } = req.validated.body;
  const [result] = await pool.execute(
    'INSERT INTO deliveries (customerId, quantity, liters, date, time) VALUES (?, ?, ?, CURDATE(), DATE_FORMAT(NOW(), "%h:%i %p"))',
    [customerId, quantity, liters ?? quantity * 18.9]
  );
  await pool.execute('UPDATE customers SET totalBottles = totalBottles + ?, monthlyConsumption = monthlyConsumption + ? WHERE id = ?', [quantity, quantity, customerId]);
  res.status(201).json({ id: result.insertId });
});

export default router;