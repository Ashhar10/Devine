import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

// Create PostgreSQL connection pool
export const pool = new Pool(config.db);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function withTransaction(run) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await run(client);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}