// Pagos in-app (Stripe/PayPal) y facturación
export const payments = [];

export function addPayment({ bookingId, amount, method, status }) {
  const payment = { id: Date.now().toString(), bookingId, amount, method, status, createdAt: new Date().toISOString() };
  payments.push(payment);
  return payment;
}

export function listPayments(bookingId) {
  return payments.filter(p => p.bookingId === bookingId);
}
