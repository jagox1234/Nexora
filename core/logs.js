// Logs estructurados + métricas
export const logs = [];

export function logEvent({ type, message, meta }) {
  const entry = { id: Date.now().toString(), type, message, meta, timestamp: new Date().toISOString() };
  logs.push(entry);
  return entry;
}

export function listLogs(type) {
  return logs.filter(l => l.type === type);
}
