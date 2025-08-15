// Inteligencia: recomendación huecos óptimos, forecasting demanda
export function recommendOptimalSlots({ bookings, services, staff }) {
  // Recomendación básica: buscar huecos libres de 1h entre 9:00 y 18:00 para cada staff
  const slots = [];
  const dayStart = 9;
  const dayEnd = 18;
  const duration = 60; // minutos
  const today = new Date();
  const dayStr = today.toISOString().slice(0, 10);
  staff.forEach(person => {
    for (let h = dayStart; h <= dayEnd - 1; h++) {
      const slotStart = new Date(dayStr + 'T' + String(h).padStart(2, '0') + ':00:00');
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      const overlap = bookings.some(b => {
        if (b.staffId !== person.id) return false;
        const bStart = new Date(b.startsAt || b.date);
        const bEnd = new Date(bStart.getTime() + (b.durationMin || duration) * 60000);
        return (slotStart < bEnd && slotEnd > bStart);
      });
      if (!overlap) {
        slots.push({ staffId: person.id, start: slotStart.toISOString(), end: slotEnd.toISOString() });
      }
    }
  });
  return slots;
}

export function forecastDemand({ bookings, period }) {
  // Forecasting básico: conteo de reservas por día en el periodo
  if (!Array.isArray(bookings) || !period || !period.start || !period.end) return [];
  const start = new Date(period.start);
  const end = new Date(period.end);
  const result = {};
  for (let i = 0; i <= (end - start) / (1000 * 60 * 60 * 24); i++) {
    const currentDay = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayStr = currentDay.toISOString().slice(0, 10);
    result[dayStr] = bookings.filter(b => {
      const dateStr = b.startsAt || b.date;
      if (!dateStr) return false;
      const bDate = new Date(dateStr);
      if (isNaN(bDate.getTime())) return false;
      return bDate.toISOString().slice(0, 10) === dayStr;
    }).length;
  }
  return result;
}
