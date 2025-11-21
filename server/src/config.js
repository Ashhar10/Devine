import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
function validateConfig() {
  const errors = [];
  
  // JWT_SECRET is critical for security
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable is required');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  }
  
  // In production, ensure critical vars are set
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_PASSWORD && !process.env.DATABASE_URL) {
      errors.push('DB_PASSWORD or DATABASE_URL must be set in production');
    }
    if (!process.env.ALLOW_ORIGINS && !process.env.ALLOW_ORIGIN) {
      errors.push('ALLOW_ORIGINS must be configured in production');
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n📝 Please check your .env file and refer to .env.example for guidance.\n');
    process.exit(1);
  }
}

// Run validation
validateConfig();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3001),
  db: {
    // Support DATABASE_URL for cloud providers (Render, Railway, etc.)
    ...(process.env.DATABASE_URL 
      ? { uri: process.env.DATABASE_URL }
      : {
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'devine_water',
        }
    ),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: Number(process.env.DB_QUEUE_LIMIT || 0),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  jwtSecret: process.env.JWT_SECRET, // No fallback - must be set!
  // Comma-separated list of allowed origins, default to GitHub Pages and localhost.
  corsAllowedOrigins:
    (process.env.ALLOW_ORIGINS || process.env.ALLOW_ORIGIN || 'https://ashhar10.github.io,http://localhost:8000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
};