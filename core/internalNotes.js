// Notas internas en clientes / reservas
export const internalNotes = [];

export function addNote({ entityId, entityType, note }) {
  const n = { id: Date.now().toString(), entityId, entityType, note, createdAt: new Date().toISOString() };
  internalNotes.push(n);
  return n;
}

export function listNotes(entityId, entityType) {
  return internalNotes.filter(n => n.entityId === entityId && n.entityType === entityType);
}
