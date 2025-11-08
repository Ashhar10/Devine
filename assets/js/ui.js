// Shared UI helpers: navbar rendering and simple navigation
import { state, logout } from './state.js';

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
    window.location.href = isAdmin ? './dashboard.html' : '../customer/dashboard.html';
  });
}

export function linkTo(path) { window.location.href = path; }