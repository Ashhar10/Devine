// Shared constants and calculations
export const PRICE_PER_BOTTLE = 45;
export const LITERS_PER_BOTTLE = 18.9;

export function calculateMonthlyBill(customer) {
  return (customer?.monthlyConsumption || 0) * PRICE_PER_BOTTLE;
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