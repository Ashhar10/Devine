import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [[{ customers }]] = await pool.query('SELECT COUNT(*) AS customers FROM customers');
  const [[{ unpaid }]] = await pool.query('SELECT COUNT(*) AS unpaid FROM customers WHERE isPaid=0');
  const [[{ pendingOrders }]] = await pool.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status='pending'");
  const [[{ deliveries }]] = await pool.query('SELECT COUNT(*) AS deliveries FROM deliveries');
  res.json({ customers, unpaid, pendingOrders, deliveries });
});

export default router;