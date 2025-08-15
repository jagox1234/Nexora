// Panel admin global, flags de fraude/abuso, sistema de tickets soporte
export const adminFlags = [];
export const supportTickets = [];

export function addAdminFlag({ entityId, type, reason }) {
  const flag = { id: Date.now().toString(), entityId, type, reason, createdAt: new Date().toISOString() };
  adminFlags.push(flag);
  return flag;
}

export function listAdminFlags(entityId) {
  return adminFlags.filter(f => f.entityId === entityId);
}

export function createSupportTicket({ userId, subject, message }) {
  const ticket = { id: Date.now().toString(), userId, subject, message, status: 'open', createdAt: new Date().toISOString() };
  supportTickets.push(ticket);
  return ticket;
}

export function listSupportTickets(userId) {
  return supportTickets.filter(t => t.userId === userId);
}
