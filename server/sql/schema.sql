-- Devine Water MySQL schema (initial)

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
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
  totalBottles INT DEFAULT 0,
  monthlyConsumption INT DEFAULT 0,
  isPaid TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  quantity INT NOT NULL,
  liters DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(16),
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  quantity INT NOT NULL,
  status VARCHAR(16) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(16),
  deliveredDate DATE,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Seed admin (password 'admin')
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$Fv7tG3WbCzH2I6QwA6O/tebT1JmYHj1Rr8a0C3yHcu4lE8o6lP9QG')
ON DUPLICATE KEY UPDATE username=username;