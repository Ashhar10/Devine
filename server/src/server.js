import app from './app.js';
import { config } from './config.js';
import { pool } from './db.js';
import bcrypt from 'bcryptjs';

app.listen(config.port, () => {
  console.log(`Devine backend running on http://localhost:${config.port}`);
});

pool.query('SELECT 1').then(() => {
  console.log('Database connection ok');
  return seedAdminIfEmpty();
}).catch((e) => {
  console.error('Database connection failed', e.code || e.message);
});

async function seedAdminIfEmpty() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM admins');
    const cnt = rows[0]?.cnt || 0;
    if (cnt === 0) {
      const hash = await bcrypt.hash('admin', 10);
      await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hash]);
      console.log('Seeded default admin user');
    }
  } catch (err) {
    console.error('Admin seed failed', err.code || err.message);
  }
}