import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Stats should only be accessible by admins
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const customersResult = await pool.query('SELECT COUNT(*) AS customers FROM customers');
  const unpaidResult = await pool.query('SELECT COUNT(*) AS unpaid FROM customers WHERE isPaid=0');
  const pendingOrdersResult = await pool.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status='pending'");
  const deliveriesResult = await pool.query('SELECT COUNT(*) AS deliveries FROM deliveries');

  res.json({
    customers: Number(customersResult.rows[0].customers),
    unpaid: Number(unpaidResult.rows[0].unpaid),
    pendingOrders: Number(pendingOrdersResult.rows[0].pendingorders),
    deliveries: Number(deliveriesResult.rows[0].deliveries)
  });
});

export default router;