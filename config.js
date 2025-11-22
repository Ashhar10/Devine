// Frontend runtime configuration
// Update API_BASE to your deployed backend URL when using GitHub Pages.
// Example: 'https://devine-backend.onrender.com/api'
// Update this to your deployed backend URL
// Render primary URL from your dashboard:
// e.g. https://devine-backend.onrender.com
// Auto-detect environment and use appropriate API base
const isProduction =
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('github.io');

window.__CONFIG__ = {
  API_BASE: isProduction
    ? 'https://devine-3urh.onrender.com/api'  // Production: Render backend
    : 'http://localhost:3001/api'             // Development: Local backend
};