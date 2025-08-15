// Reservas recurrentes / paquetes / series
export const recurringBookings = [];

export function addRecurringBooking({ clientId, serviceId, staffId, startDate, frequency, count }) {
  const booking = { id: Date.now().toString(), clientId, serviceId, staffId, startDate, frequency, count };
  recurringBookings.push(booking);
  return booking;
}

export function listRecurringBookings(clientId) {
  return recurringBookings.filter(b => b.clientId === clientId);
}
