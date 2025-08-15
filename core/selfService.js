// Reprogramación y cancelación self-service
export function rescheduleBooking({ bookingId, newDate }) {
  // TODO: validar solapamientos y reglas
  return { ok: true, bookingId, newDate };
}

export function cancelBookingSelfService({ bookingId, reason }) {
  // TODO: aplicar políticas de cancelación
  return { ok: true, bookingId, reason };
}
