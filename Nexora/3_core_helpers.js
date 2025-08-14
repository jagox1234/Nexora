// nexora/3_core_helpers.js — time & slots helpers
const weekdayKey = (d) => ["sun","mon","tue","wed","thu","fri","sat"][d.getDay()];
const mmFromHHMM = (s) => { const [h,m] = s.split(":").map(Number); return h*60 + (m || 0); };
const isoAtMinutes = (date, minutes) => {
  const d = new Date(date); d.setHours(0,0,0,0);
  return new Date(d.getTime() + minutes * 60000).toISOString();
};
const overlap = (aS, aE, bS, bE) => aS < bE && aE > bS;

export const generateSlotsForDay = ({ clinic, bookings, services, date, serviceId }) => {
  const blocks = clinic.openingHours[weekdayKey(date)] || [];
  const durationMin = services.find(s => s.id === serviceId)?.durationMin || 0;
  if (!durationMin || !blocks.length) return [];

  const dayStr = date.toDateString();
  const sameDay = bookings
    .filter(b => b.status !== "cancelled" && new Date(b.startsAt).toDateString() === dayStr)
    .map(b => {
      const d = services.find(s => s.id === b.serviceId)?.durationMin || 30;
      const start = new Date(b.startsAt).getTime();
      return [start, start + d * 60000];
    });

  const out = [];
  const step = 15; // minutes
  for (const block of blocks) {
    const [startHH, endHH] = block.split("-");
    const startMin = mmFromHHMM(startHH);
    const endMin = mmFromHHMM(endHH);
    for (let m = startMin; m <= endMin - durationMin; m += step) {
      const startISO = isoAtMinutes(date, m);
      const endISO = isoAtMinutes(date, m + durationMin);
      const s = new Date(startISO).getTime();
      const e = new Date(endISO).getTime();
      const busy = sameDay.some(([bs, be]) => overlap(s, e, bs, be));
      if (!busy) out.push(startISO);
    }
  }
  return out;
};
