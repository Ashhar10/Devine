export function errorHandler(err, req, res, next) {
  // Log full error details server-side (including stack trace)
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  const status = err.status || 500;

  // In production, sanitize error messages to prevent information leakage
  if (process.env.NODE_ENV === 'production') {
    // Don't expose internal error details to clients
    const safeMessage = status < 500 ? err.message : 'Internal Server Error';
    return res.status(status).json({ error: safeMessage });
  }

  // In development, return full error details for debugging
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}