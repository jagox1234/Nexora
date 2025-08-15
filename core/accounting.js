// Integración contable básica
export const accountingEntries = [];

export function addAccountingEntry({ invoiceId, amount, type, date }) {
  const entry = { id: Date.now().toString(), invoiceId, amount, type, date };
  accountingEntries.push(entry);
  return entry;
}

export function listAccountingEntries(invoiceId) {
  return accountingEntries.filter(e => e.invoiceId === invoiceId);
}
