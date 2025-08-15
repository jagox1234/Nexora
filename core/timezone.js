// Selector de timezone robusto
export const timezones = [
  'UTC', 'Europe/Madrid', 'America/New_York', 'Asia/Tokyo', 'America/Mexico_City', 'Europe/London'
];

export function setTimezone(userId, timezone) {
  return { userId, timezone };
}

export function getTimezone(userId) {
  // TODO: obtener timezone real del usuario
  return 'UTC';
}
