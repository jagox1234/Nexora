// Disponibilidad configurable (horarios, días cerrados, vacaciones)
export const availability = [];

export function setAvailability({ staffId, ranges, closedDays = [], vacations = [] }) {
  const entry = { staffId, ranges, closedDays, vacations };
  const idx = availability.findIndex(a => a.staffId === staffId);
  if (idx >= 0) availability[idx] = entry;
  else availability.push(entry);
  return entry;
}

export function getAvailability(staffId) {
  return availability.find(a => a.staffId === staffId) || null;
}
