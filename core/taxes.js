// Gestión de impuestos / IVA / facturas
export const invoices = [];

export function createInvoice({ bookingId, clientId, amount, taxRate }) {
  const invoice = { id: Date.now().toString(), bookingId, clientId, amount, taxRate, total: amount * (1 + taxRate), createdAt: new Date().toISOString() };
  invoices.push(invoice);
  return invoice;
}

export function listInvoices(clientId) {
  return invoices.filter(i => i.clientId === clientId);
}
