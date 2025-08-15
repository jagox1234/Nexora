// v2/core/businesses.js — multi-business domain scaffold (Phase 1)

export function defaultOpeningHours() {
  return { mon:['10:00-18:00'], tue:['10:00-18:00'], wed:['10:00-18:00'], thu:['10:00-18:00'], fri:['10:00-18:00'], sat:[], sun:[] };
}

export function makeBusiness(payload) {
  const id = `biz_${Date.now()}`;
  return { id, name:'New Business', timezone:'UTC', openingHours:defaultOpeningHours(), services:[], staff:[], ...payload };
}

export function addBusinessFn(list, payload) {
  const b = makeBusiness(payload);
  return { list:[b, ...list], created:b };
}

export function updateBusinessFn(list, id, patch) {
  return list.map(b => b.id===id ? { ...b, ...patch } : b);
}

export function removeBusinessFn(list, id) { return list.filter(b => b.id!==id); }

export function attachServiceToBusiness(list, businessId, service) {
  return list.map(b => b.id===businessId ? { ...b, services:[service, ...(b.services||[])] } : b);
}

export function addStaffToBusiness(list, businessId, staffMember) {
  return list.map(b => b.id===businessId ? { ...b, staff:[staffMember, ...(b.staff||[])] } : b);
}
