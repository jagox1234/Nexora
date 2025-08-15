// Protección contra brute force / lockout
export const loginAttempts = [];

export function recordLoginAttempt({ userId, success }) {
  loginAttempts.push({ userId, success, timestamp: Date.now() });
}

export function isLockedOut(userId, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const attempts = loginAttempts.filter(a => a.userId === userId && !a.success && now - a.timestamp < windowMs);
  return attempts.length >= maxAttempts;
}
