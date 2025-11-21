import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  let result;
  if (role === 'customer') {
    result = await pool.query('SELECT * FROM deliveries WHERE customerId = $1 ORDER BY date DESC', [req.user.id]);
  } else {
    result = await pool.query('SELECT * FROM deliveries ORDER BY date DESC');
  }
  res.json(result.rows);
});

const createSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100), // Max 100 bottles per delivery
    liters: z.number().positive().max(2000).optional(), // Max 2000 liters
  }),
});

router.post('/', requireAuth, requireAdmin, validate(createSchema), async (req, res) => {
  const { customerId, quantity, liters } = req.validated.body;
  const result = await pool.query(
    'INSERT INTO deliveries (customerId, quantity, liters, date, time) VALUES ($1, $2, $3, CURRENT_DATE, TO_CHAR(NOW(), \'HH12:MI AM\')) RETURNING id',
    [customerId, quantity, liters ?? quantity * 18.9]
  );
  await pool.query('UPDATE customers SET totalBottles = totalBottles + $1, monthlyConsumption = monthlyConsumption + $2 WHERE id = $3', [quantity, quantity, customerId]);
  res.status(201).json({ id: result.rows[0].id });
});

export default router;