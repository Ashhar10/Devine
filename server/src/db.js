import mysql from 'mysql2/promise';
import { config } from './config.js';

export const pool = mysql.createPool(config.db);

export async function withTransaction(run) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const res = await run(conn);
    await conn.commit();
    return res;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}