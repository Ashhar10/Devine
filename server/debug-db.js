import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration logic from config.js
const sslConfig = dbSSL === 'false' ? false : { rejectUnauthorized: false };
console.log('Derived SSL Config:', sslConfig);

const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: sslConfig,
});

console.log('\nAttempting to connect...');

try {
    const client = await pool.connect();
    console.log('✅ Connected to database!');

    const res = await client.query('SELECT NOW() as now, current_database() as db');
    console.log(`📅 Server Time: ${res.rows[0].now}`);
    console.log(`🗄️  Database: ${res.rows[0].db}`);

    client.release();
} catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);

    if (err.message.includes('received invalid response: 4a')) {
        console.log('\n💡 Tip: This error often means SSL is required but not being handled correctly, or the port is wrong.');
        console.log('   If using Supabase Transaction Pooler (port 6543), ensure SSL is enabled.');
        console.log('   Try removing "?sslmode=require" from the connection string if it exists, as we handle SSL in code.');
    }
} finally {
    await pool.end();
}
