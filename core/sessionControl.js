// Control de sesión múltiple, logout remoto
export const sessions = [];

export function createSession({ userId, device }) {
  const session = { id: Date.now().toString(), userId, device, active: true };
  sessions.push(session);
  return session;
}

export function logoutSession(sessionId) {
  const session = sessions.find(s => s.id === sessionId);
  if (session) session.active = false;
}

export function listSessions(userId) {
  return sessions.filter(s => s.userId === userId);
}
