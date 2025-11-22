// Shared UI helpers: navbar rendering and simple navigation
import { state, logout } from './state.js';
import { initInteractions } from './animations.js';
export { showAlert, showConfirm, showFormDialog, showMessagingOptions } from './dialog.js';
export { setButtonLoading, getSkeletonLoader } from './animations.js';

export function renderNavbar({ isAdmin = false }) {
  const el = document.getElementById('navbar');
  if (!el) return;
  el.innerHTML = `
    <nav class="navbar">
      <div class="navbar-inner flex justify-between items-center">
        <div class="navbar-brand" id="brandLink">
          <span class="text-2xl font-bold">Devine Water${isAdmin ? ' - Admin' : ''}</span>
        </div>
        <div class="navbar-actions">
          ${!isAdmin && state.currentUser ? `<span class="text-sm">Welcome, ${state.currentUser.name}</span>` : ''}
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