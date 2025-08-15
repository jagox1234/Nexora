// Histórico de cambios (audit trail)
export const auditTrail = [];

export function logChange({ entityId, entityType, action, userId, details }) {
  const entry = { id: Date.now().toString(), entityId, entityType, action, userId, details, timestamp: new Date().toISOString() };
  auditTrail.push(entry);
  return entry;
}

export function getAuditTrail(entityId, entityType) {
  return auditTrail.filter(e => e.entityId === entityId && e.entityType === entityType);
}
