// Reglas de buffers y tiempos de preparación entre reservas
export const bookingRules = [];

export function setBookingRule({ businessId, bufferMin = 0, prepMin = 0 }) {
  const rule = { businessId, bufferMin, prepMin };
  const idx = bookingRules.findIndex(r => r.businessId === businessId);
  if (idx >= 0) bookingRules[idx] = rule;
  else bookingRules.push(rule);
  return rule;
}

export function getBookingRule(businessId) {
  return bookingRules.find(r => r.businessId === businessId) || null;
}
