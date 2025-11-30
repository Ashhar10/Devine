// Utility functions - converted from devine-old/assets/js/utils.js
export const PRICE_PER_BOTTLE = 80
export const LITERS_PER_BOTTLE = 19

export function calculateMonthlyBill(deliveries, payments) {
    const totalDelivered = deliveries.reduce((sum, d) => sum + (d.quantity || 0), 0)
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalDue = totalDelivered * PRICE_PER_BOTTLE
    return { totalDelivered, totalPaid, totalDue, balance: totalDue - totalPaid }
}

export function calculateBalance(customer, deliveries, payments) {
    const customerDeliveries = deliveries.filter(d => d.customerId === customer.id)
    const customerPayments = payments.filter(p => p.customerId === customer.id)
    return calculateMonthlyBill(customerDeliveries, customerPayments)
}

export function checkRenewalStatus(customer) {
    // Check if customer needs renewal based on subscription
    const renewalDate = new Date(customer.renewalDate || customer.createdAt)
    const today = new Date()
    return renewalDate < today && !customer.isPaid
}

export function formatCurrency(amount) {
    return `PKR ${amount.toLocaleString()}`
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
