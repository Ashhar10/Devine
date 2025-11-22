// API-backed global state and operations
import { PRICE_PER_BOTTLE, LITERS_PER_BOTTLE } from './utils.js';

const API_BASE = (window.__CONFIG__ && window.__CONFIG__.API_BASE) || 'https://devine-backend.onrender.com';
const TOKEN_KEY = 'devine_token_v1';

export const state = {
  userType: null,
  currentUser: null,
  customers: [],
  deliveries: [],
  orders: [],
  payments: [],
};

function getToken() { try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; } }
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch { } }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch { } }

async function request(method, path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// Session helpers
export function setUserType(type) { state.userType = type; }
export function setCurrentUser(user) { state.currentUser = user; }
export function logout() {
  state.userType = null;
  state.currentUser = null;
  clearToken();
  // Robust relative navigation that works from any nested page
  window.location.href = new URL('../login.html', window.location.href).href;
}

// Auth
export async function loginAdmin(username, password) {
  const res = await request('POST', '/auth/admin/login', { username, password });
  setToken(res.token);
  state.userType = 'admin';
  await syncAll();
  return res.user;
}

export async function loginCustomer(phone, password) {
  const res = await request('POST', '/auth/customer/login', { phone, password });
  setToken(res.token);
  state.userType = 'customer';
  state.currentUser = res.user;
  await syncCustomer();
  return res.user;
}

export async function checkSession() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await request('GET', '/auth/me');
    state.userType = res.role;
    state.currentUser = res.user;

    if (res.role === 'admin') {
      await syncAll();
    } else {
      await syncCustomer();
    }
    return res.user;
  } catch (e) {
    console.error('Session check failed:', e);
    clearToken();
    return null;
  }
}

// Sync helpers
export async function syncAll() {
  const [customers, orders, deliveries, payments] = await Promise.all([
    request('GET', '/customers'),
    request('GET', '/orders'),
    request('GET', '/deliveries'),
    request('GET', '/payments'),
  ]);
  state.customers = customers;
  state.orders = orders;
  state.deliveries = deliveries;
  state.payments = payments;
}

export async function syncCustomer() {
  const id = state.currentUser?.id;
  if (!id) return;
  const [customer, orders, deliveries, payments] = await Promise.all([
    request('GET', `/customers/${id}`),
    request('GET', '/orders'),
    request('GET', '/deliveries'),
    request('GET', '/payments'),
  ]);
  // orders/deliveries already filtered by role
  state.customers = [customer];
  state.currentUser = customer;
  state.orders = orders;
  state.deliveries = deliveries;
  state.payments = payments;
}

// Customers
export async function addCustomer(newCustomer) {
  const res = await request('POST', '/customers', newCustomer);
  await syncAll();
  return res;
}

export async function deleteCustomer(id) {
  await request('DELETE', `/customers/${id}`);
  await syncAll();
  return true;
}

export async function updateCustomer(updated) {
  await request('PUT', `/customers/${updated.id}`, updated);
  if (state.userType === 'admin') await syncAll(); else await syncCustomer();
}

// Payments
export async function recordPayment(customerId, amount, method = 'Cash') {
  await request('POST', '/payments', { customerId, amount, method });
  if (state.userType === 'admin') await syncAll(); else await syncCustomer();
  return true;
}

// Deliveries
export async function addDelivery(customerId, quantity, liters = quantity * LITERS_PER_BOTTLE) {
  await request('POST', '/deliveries', { customerId, quantity, liters });
  if (state.userType === 'admin') await syncAll(); else await syncCustomer();
  return true;
}

// Orders
export async function placeOrder(customerId, quantity) {
  await request('POST', '/orders', { customerId, quantity });
  await syncCustomer();
  return true;
}

export async function markOrderDelivered(orderId) {
  await request('PUT', `/orders/${orderId}/delivered`);
  await syncAll();
  return true;
}

// Helpers
export function getCustomerName(id) { return state.customers.find(c => c.id === id)?.name || 'Unknown'; }
export function resetAll() { clearToken(); state.userType = null; state.currentUser = null; state.customers = []; state.deliveries = []; state.orders = []; state.payments = []; }

// Expose globally for non-module inline scripts if needed
window.__DevineState__ = { state, setUserType, setCurrentUser, logout, loginAdmin, loginCustomer, checkSession, syncAll, syncCustomer, addCustomer, deleteCustomer, updateCustomer, recordPayment, addDelivery, placeOrder, markOrderDelivered, getCustomerName, resetAll };