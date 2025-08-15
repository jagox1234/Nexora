// v2/core/availability.js — advanced availability blocks (Phase 1)

export function makeAvailability({ staffId, businessId, date, ranges }) {
  const id = `av_${Date.now()}`;
  return { id, staffId, businessId, date, ranges, createdAt:new Date().toISOString() };
}

export function addAvailabilityFn(list, payload) {
  const a = makeAvailability(payload);
  return { list:[a, ...list], created:a };
}

export function removeAvailabilityFn(list, id) { return list.filter(a=>a.id!==id); }

export function getAvailabilityFor(list, { staffId, date }) {
  const tag = new Date(date).toDateString();
  return list.filter(a => a.staffId===staffId && new Date(a.date).toDateString()===tag);
}

export function generateStaffSlots({ availabilityList, date, serviceDurationMin }) {
  const blocks = availabilityList.flatMap(a => a.ranges||[]);
  const out = [];
  const base = new Date(date); base.setHours(0,0,0,0);
  for (const r of blocks) {
    const [h1,m1,h2,m2] = r.split(/[:\-]/).map(Number);
    const start = new Date(base); start.setHours(h1,m1,0,0);
    const end = new Date(base); end.setHours(h2,m2,0,0);
    for (let t=new Date(start); t.getTime()+serviceDurationMin*60000 <= end.getTime(); t = new Date(t.getTime()+10*60000)) {
      out.push(t.toISOString());
    }
  }
  return out;
}
