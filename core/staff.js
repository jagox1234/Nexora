// Modelo y lógica de staff (personal)
export const staff = [];

export function addStaff({ name, role, businessId, services = [] }) {
  const member = { id: Date.now().toString(), name, role, businessId, services, agenda: [] };
  staff.push(member);
  return member;
}

export function assignServiceToStaff(staffId, serviceId) {
  const member = staff.find(s => s.id === staffId);
  if (member) {
    member.services.push(serviceId);
    return true;
  }
  return false;
}

export function getStaffAgenda(staffId) {
  const member = staff.find(s => s.id === staffId);
  return member ? member.agenda : [];
}

export function listStaff(businessId) {
  return staff.filter(s => s.businessId === businessId);
}
