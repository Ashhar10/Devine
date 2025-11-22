import express from 'express';
import { pool, withTransaction } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { addMonth } from '../utils/date.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  const query = 'SELECT p.id, p.customerId AS "customerId", p.amount, p.method, p.date, c.name AS "customerName" FROM payments p JOIN customers c ON c.id=p.customerId';
  let result;
  if (role === 'customer') {
    result = await pool.query(`${query} WHERE p.customerId = $1 ORDER BY p.date DESC`, [req.user.id]);
  } else {
    result = await pool.query(`${query} ORDER BY p.date DESC`);
  }
  res.json(result.rows);
});

const createSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    amount: z.number().positive().max(1000000), // Max 1 million per payment
    method: z.enum(['Cash', 'Card', 'Bank Transfer', 'Online']).default('Cash'),
  }),
});

// Price per bottle constant (should match frontend)
const PRICE_PER_BOTTLE = 50;

router.post('/', requireAuth, requireAdmin, validate(createSchema), async (req, res) => {
  const { customerId, amount, method } = req.validated.body;

  await withTransaction(async (client) => {
    // 1. Insert the payment
    await client.query(
      'INSERT INTO payments (customerId, amount, method, date) VALUES ($1, $2, $3, CURRENT_DATE)',
      [customerId, amount, method]
    );

    // 2. Get customer data
    const custResult = await client.query(
      'SELECT monthlyConsumption, renewalDate FROM customers WHERE id=$1',
      [customerId]
    );
    const customer = custResult.rows[0];

    // 3. Calculate monthly bill
    const monthlyBill = customer.monthlyConsumption * PRICE_PER_BOTTLE;

    // 4. Sum all payments since last renewal (current billing period)
    const paymentsResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM payments 
       WHERE customerId=$1 
       AND date >= (SELECT renewalDate - INTERVAL '1 month' FROM customers WHERE id=$1)`,
      [customerId]
    );
    const totalPaid = parseFloat(paymentsResult.rows[0].total);

    // 5. Calculate balance
    const balance = monthlyBill - totalPaid;

    // 6. Update customer status
    if (balance <= 0) {
      // Fully paid - mark as paid and set next renewal
      const nextRenewal = addMonth(customer.renewalDate || new Date().toISOString().split('T')[0]);
      await client.query(
        'UPDATE customers SET isPaid=1, monthlyConsumption=0, renewalDate=$1 WHERE id=$2',
        [nextRenewal, customerId]
      );
    } else {
      // Partial payment - mark as unpaid
      await client.query(
        'UPDATE customers SET isPaid=0 WHERE id=$1',
        [customerId]
      );
    }
  });

  res.status(201).json({ ok: true });
});

export default router;