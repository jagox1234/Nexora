// v2/core/requests.js — client request lifecycle (expanded)

export function makeRequest(payload) {
  const id = `req_${Date.now()}`;
  return { id, status:'pending', createdAt:new Date().toISOString(), ...payload };
}

export function addRequestFn(list, payload) {
  const r = makeRequest(payload);
  return { list:[r, ...list], created:r };
}

export function updateRequestStatusFn(list, id, status) {
  return list.map(r => r.id===id ? { ...r, status } : r);
}

export function removeRequestFn(list, id) { return list.filter(r => r.id!==id); }
