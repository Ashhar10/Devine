import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;

function buildDbConfig() {
  if (dbUrl) {
    const u = new URL(dbUrl);
    const sslEnabled = process.env.DB_SSL === 'true' || u.searchParams.get('ssl') === 'true';
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username || ''),
      password: decodeURIComponent(u.password || ''),
      database: u.pathname.replace(/^\//, '') || 'devine_water',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database:
      process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'devine_water',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3001),
  db: buildDbConfig(),
  jwtSecret: process.env.JWT_SECRET || 'devine_secret',
  corsAllowedOrigins:
    (process.env.ALLOW_ORIGINS || process.env.ALLOW_ORIGIN || 'https://ashhar10.github.io,http://localhost:8000')
      .split(',')
      .map((s) => s.trim()),
};