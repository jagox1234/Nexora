// GDPR: export / delete data user
export function exportUserData(userId) {
  // TODO: exportar datos reales del usuario
  return { userId, data: {} };
}

export function deleteUserData(userId) {
  // TODO: borrar datos reales del usuario
  return { userId, deleted: true };
}
