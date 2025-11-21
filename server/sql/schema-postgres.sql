-- PostgreSQL Schema for Devine Water
-- Compatible with Supabase and other PostgreSQL providers

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Admin accounts table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(32) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(64),
  email VARCHAR(128),
  joinDate DATE,
  renewalDate DATE,
  totalBottles INT DEFAULT 0 CHECK (totalBottles >= 0),
  monthlyConsumption INT DEFAULT 0 CHECK (monthlyConsumption >= 0),
  isPaid SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for customers
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_isPaid ON customers(isPaid);

-- Deliveries table
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  customerId INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  liters DECIMAL(10,2) NOT NULL CHECK (liters > 0),
  date DATE NOT NULL,
  time VARCHAR(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for deliveries
CREATE INDEX idx_deliveries_customerId ON deliveries(customerId);
CREATE INDEX idx_deliveries_date ON deliveries(date DESC);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  customerId INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payments
CREATE INDEX idx_payments_customerId ON payments(customerId);
CREATE INDEX idx_payments_date ON payments(date DESC);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customerId INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'delivered', 'cancelled')),
  date DATE NOT NULL,
  time VARCHAR(16),
  deliveredDate DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for orders
CREATE INDEX idx_orders_customerId ON orders(customerId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date_status ON orders(date DESC, status);

-- Create default admin user
-- Username: admin
-- Password: Admin123
-- Password hash was generated with bcrypt (10 rounds)
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '   Default admin credentials:';
  RAISE NOTICE '   Username: admin';
  RAISE NOTICE '   Password: Admin123';
  RAISE NOTICE '   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!';
END $$;
