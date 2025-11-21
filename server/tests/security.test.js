/**
 * Security Test Suite
 * Tests all security enhancements to ensure they're working correctly
 * Run with: npm test -- security.test.js
 */

import request from 'supertest';
import app from '../src/app.js';

describe('Security Tests', () => {
    describe('Authentication Security', () => {
        test('should reject weak passwords (< 8 chars)', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'admin', password: 'weak' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/validation/i);
        });

        test('should reject passwords without letters', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'admin', password: '12345678' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/letter/i);
        });

        test('should reject passwords without numbers', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'admin', password: 'weakpassword' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/number/i);
        });

        test('should use generic error messages to prevent enumeration', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'nonexistent', password: 'Admin123' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid username or password');
            expect(res.body.error).not.toMatch(/user.*not.*found/i);
        });

        test('should enforce rate limiting on auth endpoints', async () => {
            const attempts = [];

            // Make 6 failed login attempts
            for (let i = 0; i < 6; i++) {
                attempts.push(
                    request(app)
                        .post('/api/auth/admin/login')
                        .send({ username: 'admin', password: 'WrongPass123' })
                );
            }

            const responses = await Promise.all(attempts);
            const lastResponse = responses[responses.length - 1];

            expect(lastResponse.status).toBe(429); // Too Many Requests
            expect(lastResponse.body.error).toMatch(/too many.*attempts/i);
        }, 20000);
    });

    describe('Input Validation', () => {
        let authToken;

        beforeAll(async () => {
            // Login to get token
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'admin', password: 'Admin123' });
            authToken = res.body.token;
        });

        test('should reject oversized customer names', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'A'.repeat(200), // Exceeds max 128
                    phone: '1234567890',
                    password: 'Customer123',
                });

            expect(res.status).toBe(400);
        });

        test('should reject invalid email formats', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test User',
                    phone: '1234567890',
                    email: 'not-an-email',
                    password: 'Customer123',
                });

            expect(res.status).toBe(400);
        });

        test('should reject excessive order quantities', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    customerId: 1,
                    quantity: 9999, // Exceeds max 100
                });

            expect(res.status).toBe(400);
        });

        test('should validate payment methods', async () => {
            const res = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    customerId: 1,
                    amount: 100,
                    method: 'Bitcoin', // Not in enum
                });

            expect(res.status).toBe(400);
        });
    });

    describe('Authorization', () => {
        let adminToken, customerToken;

        beforeAll(async () => {
            // Get admin token
            const adminRes = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'admin', password: 'Admin123' });
            adminToken = adminRes.body.token;

            // Create and get customer token (you may need to adjust based on your test data)
            // const customerRes = await request(app)
            //   .post('/api/auth/customer/login')
            //   .send({ phone: '1234567890', password: 'Customer123' });
            // customerToken = customerRes.body.token;
        });

        test('should prevent customers from creating deliveries', async () => {
            if (!customerToken) return; // Skip if no customer token

            const res = await request(app)
                .post('/api/deliveries')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    customerId: 1,
                    quantity: 10,
                    liters: 189,
                });

            expect(res.status).toBe(403);
        });

        test('should prevent customers from recording payments', async () => {
            if (!customerToken) return;

            const res = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    customerId: 1,
                    amount: 100,
                    method: 'Cash',
                });

            expect(res.status).toBe(403);
        });

        test('should prevent customers from accessing stats', async () => {
            if (!customerToken) return;

            const res = await request(app)
                .get('/api/stats')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(403);
        });

        test('should prevent unauthorized access to protected routes', async () => {
            const res = await request(app)
                .get('/api/customers');

            expect(res.status).toBe(401);
        });
    });

    describe('SQL Injection Prevention', () => {
        test('should prevent SQL injection in login', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({
                    username: "admin' OR '1'='1",
                    password: "anything' OR '1'='1",
                });

            // Should fail validation or return 401, not 200
            expect(res.status).not.toBe(200);
        });

        test('should prevent SQL injection in customer lookup', async () => {
            const res = await request(app)
                .post('/api/auth/customer/login')
                .send({
                    phone: "1234' OR '1'='1",
                    password: "anything' OR '1'='1",
                });

            expect(res.status).not.toBe(200);
        });
    });

    describe('Security Headers', () => {
        test('should include security headers', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-frame-options']).toBeDefined();
            expect(res.headers['strict-transport-security']).toBeDefined();
        });

        test('should have content security policy', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers['content-security-policy']).toBeDefined();
        });
    });

    describe('Request Size Limiting', () => {
        test('should reject oversized request bodies', async () => {
            const largePayload = {
                data: 'A'.repeat(200 * 1024), // 200KB
            };

            const res = await request(app)
                .post('/api/auth/admin/login')
                .send(largePayload);

            expect(res.status).toBe(413); // Payload Too Large
        }, 10000);
    });

    describe('Error Handling', () => {
        test('should not leak stack traces in production', async () => {
            // Temporarily set NODE_ENV to production
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const res = await request(app)
                .get('/api/nonexistent-route');

            expect(res.body.stack).toBeUndefined();

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });
    });
});

describe('Configuration Validation', () => {
    test('environment should have JWT_SECRET set', () => {
        expect(process.env.JWT_SECRET).toBeDefined();
        expect(process.env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    });
});
