// Core pure logic extracted for testing & scalability roadmap.
// This isolates slot generation & overlap checks from React state.

export function openingRangesForDay(openingHours, jsDate) {
  const key = ["sun","mon","tue","wed","thu","fri","sat"][jsDate.getDay()];
  return openingHours?.[key] || [];
}

export function computeServiceSlots({ openingHours, dateISO, serviceDurationMin }) {
  if (!openingHours || !dateISO || !serviceDurationMin) return [];
  const base = new Date(dateISO);
  base.setHours(0,0,0,0);
  const ranges = openingRangesForDay(openingHours, base);
  const out = [];
  for (const r of ranges) {
    const [a,b] = r.split("-");
    if(!a||!b) continue;
    const mk = (hhmm) => { const [h,m] = hhmm.split(":").map(Number); const d = new Date(base); d.setHours(h,m,0,0); return d; };
    const start = mk(a);
    const end   = mk(b);
    // shrink end so last slot starts with full duration inside range
    const endMs = end.getTime() - serviceDurationMin*60*1000;
    for (let t = new Date(start); t.getTime() <= endMs; t = new Date(t.getTime() + 10*60*1000)) {
      out.push(t.toISOString());
    }
  }
  return out;
}

export function isBookingOverlapping({ bookings, services, whenISO, serviceId, excludeId }) {
  const srv = services.find(s=>s.id===serviceId);
  if(!srv) return false;
  const start = new Date(whenISO).getTime();
  const end = start + srv.durationMin*60*1000;
  return bookings.some(b=>{
    if (excludeId && b.id===excludeId) return false;
    if (b.serviceId !== serviceId || b.status === 'cancelled') return false;
    const srvB = services.find(s=>s.id===b.serviceId);
    if(!srvB) return false;
    const s = new Date(b.startsAt).getTime();
    const e = s + srvB.durationMin*60*1000;
    return Math.max(s,start) < Math.min(e,end);
  });
}

export function createBookingLogic({ bookings, services, serviceId, clientId, whenISO }) {
  const srv = services.find(s=>s.id===serviceId);
  if(!srv) return { ok:false, error:"service_not_found" };
  if(!clientId) return { ok:false, error:"client_required" };
  if(!whenISO) return { ok:false, error:"time_required" };
  const overlap = isBookingOverlapping({ bookings, services, whenISO, serviceId });
  if(overlap) return { ok:false, error:"overlap" };
  const id = `bkg_${Date.now()}`;
  const row = { id, serviceId, clientId, startsAt: whenISO, status:"pending", source:"app" };
  return { ok:true, booking: row };
}

// Roadmap notes (scalability):
// - Replace linear searches with indexed maps (serviceId->service, bookingId->booking).
// - Introduce time-bucket indexing for faster overlap queries (bucket by day/hour).
// - Add timezone normalization using luxon or date-fns-tz when backend sync implemented.
