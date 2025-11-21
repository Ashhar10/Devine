import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test DB connection
try {
  await pool.query('SELECT 1');
  console.log('✅ Database connected successfully');
} catch (err) {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
