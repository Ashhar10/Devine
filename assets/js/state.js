// Global application state and operations (frontend-only)
import { PRICE_PER_BOTTLE, LITERS_PER_BOTTLE, calculateRenewalDate } from './utils.js';

const STORAGE_KEY = 'devine_state_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // default seed
  const seedCustomer = {
    id: 1,
    name: 'Ahmed Khan',
    phone: '03001234567',
    password: 'ahmed123',
    address: 'House 123, Block A, Gulshan',
    city: 'Karachi',
    email: 'ahmed@email.com',
    joinDate: '2025-01-15',
    renewalDate: '2025-02-15',
    totalBottles: 8,
    monthlyConsumption: 8,
    isPaid: false,
    deliveries: [
      { id: 1, customerId: 1, quantity: 8, liters: 151.2, date: '2025-01-20', time: '10:30 AM' }
    ],
    payments: []
  };
  return {
    userType: null,
    currentUser: null,
    adminCredentials: { username: 'admin', password: 'admin' },
    customers: [seedCustomer],
    deliveries: [
      { id: 1, customerId: 1, quantity: 8, liters: 151.2, date: '2025-01-20', time: '10:30 AM' }
    ],
    orders: [],
    payments: []
  };
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export const state = loadState();

// Session helpers
export function setUserType(type) { state.userType = type; saveState(); }
export function setCurrentUser(user) { state.currentUser = user; saveState(); }
export function logout() {
  state.userType = null;
  state.currentUser = null;
  saveState();
  // Robust relative navigation that works from any nested page
  window.location.href = new URL('../login.html', window.location.href).href;
}

// Customers
export function addCustomer(newCustomer) {
  const customer = {
    id: Date.now(),
    ...newCustomer,
    renewalDate: calculateRenewalDate(newCustomer.joinDate || new Date().toISOString().split('T')[0]),
    totalBottles: 0,
    monthlyConsumption: 0,
    isPaid: true,
    deliveries: [],
    payments: []
  };
  state.customers.push(customer);
  saveState();
  return customer;
}

export function deleteCustomer(id) {
  state.customers = state.customers.filter(c => c.id !== id);
  state.deliveries = state.deliveries.filter(d => d.customerId !== id);
  state.orders = state.orders.filter(o => o.customerId !== id);
  saveState();
  return true;
}

export function updateCustomer(updated) {
  state.customers = state.customers.map(c => c.id === updated.id ? updated : c);
  if (state.currentUser?.id === updated.id) state.currentUser = updated;
  saveState();
}

// Payments
export function recordPayment(customerId, amount, method = 'cash') {
  const payment = {
    id: Date.now(), amount: Number(amount), date: new Date().toISOString().split('T')[0], method,
    customerId
  };
  state.payments.unshift({ ...payment, customer_name: getCustomerName(customerId) });
  state.customers = state.customers.map(c => {
    if (c.id === customerId) {
      const renewalDate = new Date(c.renewalDate); renewalDate.setMonth(renewalDate.getMonth() + 1);
      return { ...c, isPaid: true, monthlyConsumption: 0, renewalDate: renewalDate.toISOString().split('T')[0], payments: [payment, ...(c.payments || [])] };
    }
    return c;
  });
  if (state.currentUser?.id === customerId) {
    const renewalDate = new Date(state.currentUser.renewalDate); renewalDate.setMonth(renewalDate.getMonth() + 1);
    state.currentUser = { ...state.currentUser, isPaid: true, monthlyConsumption: 0, renewalDate: renewalDate.toISOString().split('T')[0], payments: [payment, ...(state.currentUser.payments || [])] };
  }
  saveState();
  return true;
}

// Deliveries
export function addDelivery(customerId, quantity, liters = quantity * LITERS_PER_BOTTLE) {
  const delivery = { id: Date.now(), customerId, quantity: Number(quantity), liters, date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString() };
  state.deliveries.unshift(delivery);
  state.customers = state.customers.map(c => {
    if (c.id === customerId) {
      const upd = { ...c, totalBottles: (c.totalBottles || 0) + delivery.quantity, monthlyConsumption: (c.monthlyConsumption || 0) + delivery.quantity, deliveries: [delivery, ...(c.deliveries || [])] };
      if (state.currentUser?.id === customerId) state.currentUser = upd;
      return upd;
    }
    return c;
  });
  saveState();
  return true;
}

// Orders
export function placeOrder(customerId, quantity) {
  const customer = state.customers.find(c => c.id === customerId);
  if (!customer) return false;
  const order = { id: Date.now(), customerId, customerName: customer.name, customerPhone: customer.phone, quantity: Number(quantity), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString(), status: 'pending' };
  state.orders.unshift(order);
  saveState();
  return true;
}

export function markOrderDelivered(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return false;
  addDelivery(order.customerId, order.quantity);
  state.orders = state.orders.map(o => o.id === orderId ? { ...o, status: 'delivered', deliveredDate: new Date().toISOString().split('T')[0] } : o);
  saveState();
  return true;
}

// Helpers
export function getCustomerName(id) { return state.customers.find(c => c.id === id)?.name || 'Unknown'; }
export function resetAll() { localStorage.removeItem(STORAGE_KEY); Object.assign(state, loadState()); }

// Expose globally for non-module inline scripts if needed
window.__DevineState__ = { state, setUserType, setCurrentUser, logout, addCustomer, deleteCustomer, updateCustomer, recordPayment, addDelivery, placeOrder, markOrderDelivered, getCustomerName, resetAll };