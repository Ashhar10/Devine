import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3001),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'devine_water',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  jwtSecret: process.env.JWT_SECRET || 'devine_secret',
  // Comma-separated list of allowed origins, default to GitHub Pages and localhost. Use '*' for wildcard.
  corsAllowedOrigins:
    (process.env.ALLOW_ORIGINS || process.env.ALLOW_ORIGIN || 'https://ashhar10.github.io,http://localhost:8000')
      .split(',')
      .map((s) => s.trim()),
};