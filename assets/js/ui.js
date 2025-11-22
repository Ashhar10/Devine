// Shared UI helpers: navbar rendering and simple navigation
import { state, logout } from './state.js';
import { initInteractions } from './animations.js';
export { showAlert, showConfirm, showFormDialog, showMessagingOptions } from './dialog.js';
export { setButtonLoading, getSkeletonLoader } from './animations.js';

export function renderNavbar({ isAdmin = false }) {
  const el = document.getElementById('navbar');
  if (!el) return;

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  el.innerHTML = `
    <nav class="navbar">
      <div class="navbar-inner flex justify-between items-center">
        <div class="navbar-brand" id="brandLink">
          <span class="text-2xl font-bold">Devine Water${isAdmin ? ' - Admin' : ''}</span>
        </div>
        <div class="navbar-actions">
          <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">
            <!-- Moon Icon (for Light Mode) -->
            <svg class="icon-moon" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <!-- Sun Icon (for Dark Mode) -->
            <svg class="icon-sun" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>
          ${!isAdmin && state.currentUser ? `<span class="text-sm hidden-mobile">Welcome, ${state.currentUser.name}</span>` : ''}
          <button id="logoutBtn" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  `;

  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('brandLink')?.addEventListener('click', () => {
    const target = isAdmin ? './dashboard.html' : '../customer/dashboard.html';
    window.location.href = new URL(target, window.location.href).href;
  });

  // Theme Toggle Event Listener
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

export function linkTo(path) { window.location.href = new URL(path, window.location.href).href; }

export async function initPage({ requireAdmin = false, requireCustomer = false } = {}) {
  const { checkSession, state } = await import('./state.js');

  // Initialize animations and interactions
  initInteractions();

  // Create global loader if it doesn't exist
  let loading = document.getElementById('global-loader');
  if (!loading) {
    loading = document.createElement('div');
    loading.id = 'global-loader';
    loading.innerHTML = `
      <div class="loader-content">
        <div class="water-drop"></div>
        <h3 style="color: var(--color-primary); font-weight: bold; margin-bottom: 8px;">Devine Water</h3>
        <p style="color: var(--color-text-muted); font-size: 14px;">Loading...</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  try {
    await checkSession();

    if (requireAdmin && state.userType !== 'admin') {
      window.location.href = new URL('../../login.html', window.location.href).href;
      return false;
    }

    if (requireCustomer && state.userType !== 'customer') {
      window.location.href = new URL('../../login.html', window.location.href).href;
      return false;
    }

    // If on login page but already logged in
    if (!requireAdmin && !requireCustomer && state.userType) {
      if (state.userType === 'admin') {
        window.location.href = new URL('./pages/admin/dashboard.html', window.location.href).href;
      } else {
        window.location.href = new URL('./pages/customer/dashboard.html', window.location.href).href;
      }
      return false;
    }

    renderNavbar({ isAdmin: state.userType === 'admin' });
    return true;
  } catch (e) {
    console.error('Init failed:', e);
    return false;
  } finally {
    // Fade out loader
    setTimeout(() => {
      loading.style.opacity = '0';
      setTimeout(() => {
        loading.style.display = 'none';
      }, 500);
    }, 500);
  }
}