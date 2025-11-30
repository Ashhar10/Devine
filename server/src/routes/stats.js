import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Stats should only be accessible by admins
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  // Get customer count
  const customersResult = await pool.query('SELECT COUNT(*) AS count FROM customers');
  const totalCustomers = Number(customersResult.rows[0].count);

  // Get orders count
  const ordersResult = await pool.query('SELECT COUNT(*) AS count FROM orders');
  const totalOrders = Number(ordersResult.rows[0].count);

  // Get total bottles (sum of all customer totalBottles)
  const bottlesResult = await pool.query('SELECT COALESCE(SUM(totalBottles), 0) AS total FROM customers');
  const totalStock = Number(bottlesResult.rows[0].total);

  // Get customers with 0 bottles (out of stock)
  const outOfStockResult = await pool.query('SELECT COUNT(*) AS count FROM customers WHERE totalBottles = 0');
  const outOfStock = Number(outOfStockResult.rows[0].count);

  // Get pending orders count
  const pendingOrdersResult = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE status='pending'");
  const pendingOrders = Number(pendingOrdersResult.rows[0].count);

  // Get unpaid customers count
  const unpaidResult = await pool.query('SELECT COUNT(*) AS count FROM customers WHERE isPaid=0');
  const unpaid = Number(unpaidResult.rows[0].count);

  // Get deliveries count
  const deliveriesResult = await pool.query('SELECT COUNT(*) AS count FROM deliveries');
  const totalDeliveries = Number(deliveriesResult.rows[0].count);

  res.json({
    totalCustomers,
    totalOrders,
    totalStock,
    outOfStock,
    pendingOrders,
    unpaid,
    totalDeliveries
  });
});

export default router;