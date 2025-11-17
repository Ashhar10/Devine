import app from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

app.listen(config.port, () => {
  console.log(`Devine backend running on http://localhost:${config.port}`);
});

pool.query('SELECT 1').then(() => {
  console.log('Database connection ok');
}).catch((e) => {
  console.error('Database connection failed', e.code || e.message);
});