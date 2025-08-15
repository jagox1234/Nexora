// v2/core/staff.js — staff domain scaffold

export function makeStaff(payload) {
  const id = `stf_${Date.now()}`;
  return { id, name:'Staff', active:true, skills:[], ...payload };
}

export function addStaffFn(list, payload) {
  const s = makeStaff(payload);
  return { list:[s, ...list], created:s };
}

export function removeStaffFn(list, id) { return list.filter(s => s.id!==id); }

export function attachSkillFn(list, id, skill) {
  return list.map(s => s.id===id ? { ...s, skills: Array.from(new Set([...(s.skills||[]), skill])) } : s);
}
