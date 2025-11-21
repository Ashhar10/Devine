-- Devine Water MySQL schema
-- Enhanced with indexes for performance and constraints for data integrity

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(32) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NULL,
  address VARCHAR(255),
  city VARCHAR(64),
  email VARCHAR(128),
  joinDate DATE,
  renewalDate DATE,
  totalBottles INT DEFAULT 0 CHECK (totalBottles >= 0),
  monthlyConsumption INT DEFAULT 0 CHECK (monthlyConsumption >= 0),
  isPaid TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for phone lookups (used in login)
CREATE INDEX idx_customers_phone ON customers(phone);
-- Index for payment status queries
CREATE INDEX idx_customers_isPaid ON customers(isPaid);

CREATE TABLE IF NOT EXISTS deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  liters DECIMAL(10,2) NOT NULL CHECK (liters > 0),
  date DATE NOT NULL,
  time VARCHAR(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Index for customer deliveries lookup
CREATE INDEX idx_deliveries_customerId ON deliveries(customerId);
-- Index for date-based queries
CREATE INDEX idx_deliveries_date ON deliveries(date DESC);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Index for customer payments lookup
CREATE INDEX idx_payments_customerId ON payments(customerId);
-- Index for date-based queries
CREATE INDEX idx_payments_date ON payments(date DESC);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'delivered', 'cancelled')),
  date DATE NOT NULL,
  time VARCHAR(16),
  deliveredDate DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Index for customer orders lookup
CREATE INDEX idx_orders_customerId ON orders(customerId);
-- Index for status-based queries (pending orders)
CREATE INDEX idx_orders_status ON orders(status);
-- Compound index for date and status queries
CREATE INDEX idx_orders_date_status ON orders(date DESC, status);

-- Seed default admin account
-- Password: 'Admin123' (meets new 8-char requirement with letter + number)
-- To generate a new password hash, use: bcrypt.hash('your_password', 10)
-- The hash below is for 'Admin123'
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa')
ON DUPLICATE KEY UPDATE username=username;

-- Note: Change the admin password immediately after first deployment
-- New passwords must be at least 8 characters with both letters and numbers