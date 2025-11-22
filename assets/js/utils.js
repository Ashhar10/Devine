// Shared constants and calculations
export const PRICE_PER_BOTTLE = 50;
export const LITERS_PER_BOTTLE = 18.9;

export function calculateMonthlyBill(customer) {
  return (customer?.monthlyConsumption || 0) * PRICE_PER_BOTTLE;
}

export function calculateBalance(customer, payments) {
  if (!customer) return 0;

  const monthlyBill = calculateMonthlyBill(customer);

  // Ensure payments is an array
  if (!Array.isArray(payments)) {
    console.warn('calculateBalance: payments is not an array', payments);
    return monthlyBill;
  }

  // Calculate total paid, ensuring both IDs are numbers for comparison
  const customerId = Number(customer.id);
  const totalPaid = payments
    .filter(p => Number(p.customerId) === customerId)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const balance = monthlyBill - totalPaid;

  // Ensure we never return NaN
  return isNaN(balance) ? monthlyBill : balance;
}

export function checkRenewalStatus(customer) {
  if (!customer?.renewalDate) return false;
  const today = new Date();
  const renewal = new Date(customer.renewalDate);
  return renewal < today;
}

export function calculateRenewalDate(joinDate) {
  const renewal = new Date(joinDate);
  renewal.setMonth(renewal.getMonth() + 1);
  return renewal.toISOString().split('T')[0];
}