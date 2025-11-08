# Devine Water API

Base URL: `http://localhost:3001/api`

Authentication: JWT Bearer token in `Authorization` header.

## Auth
- `POST /auth/admin/login` `{ username, password }` → `{ token, user }`
- `POST /auth/customer/login` `{ phone, password }` → `{ token, user }`

## Customers
- `GET /customers` → list
- `GET /customers/:id` → customer with deliveries and payments
- `POST /customers` (admin) → create
- `PUT /customers/:id` → update
- `DELETE /customers/:id` (admin) → delete

## Orders
- `GET /orders` → list (admin sees all, customer sees own)
- `POST /orders` `{ customerId, quantity }` → create pending
- `PUT /orders/:id/delivered` → mark delivered (adds delivery)

## Deliveries
- `GET /deliveries` → list
- `POST /deliveries` `{ customerId, quantity, liters? }` → create

## Payments
- `GET /payments` → list
- `POST /payments` `{ customerId, amount, method }` → record payment (transaction)

## Stats
- `GET /stats` → `{ customers, unpaid, pendingOrders, deliveries }`

All write operations use prepared statements; transactions are used where required.