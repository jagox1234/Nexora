// v2/core/logic.js — pure booking & domain logic extracted for testability

export const minutesBetween = (aISO, bISO) => (new Date(bISO).getTime() - new Date(aISO).getTime()) / 60000;

export const bookingOverlaps = (existing, next, durationGet) => {
  const nextDur = durationGet(next.serviceId);
  const nextStart = new Date(next.startsAt).getTime();
  const nextEnd = nextStart + nextDur * 60000;
  return existing.some(b => {
    if (b.status === 'cancelled') return false;
    const dur = durationGet(b.serviceId);
    const start = new Date(b.startsAt).getTime();
    const end = start + dur * 60000;
    return start < nextEnd && end > nextStart; // overlap condition
  });
};

export const validateBooking = (booking) => {
  const required = ['id','clientId','serviceId','startsAt','status'];
  for (const f of required) if (!booking[f]) return `Missing field ${f}`;
  if (!['scheduled','cancelled'].includes(booking.status)) return 'Invalid status';
  return null;
};
