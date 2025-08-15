// Rate limiting y seguridad
export const rateLimits = [];

export function setRateLimit({ userId, limit, windowMs }) {
  const entry = { userId, limit, windowMs, count: 0, lastReset: Date.now() };
  rateLimits.push(entry);
  return entry;
}

export function checkRateLimit(userId) {
  const entry = rateLimits.find(e => e.userId === userId);
  if (!entry) return true;
  const now = Date.now();
  if (now - entry.lastReset > entry.windowMs) {
    entry.count = 0;
    entry.lastReset = now;
  }
  entry.count++;
  return entry.count <= entry.limit;
}
