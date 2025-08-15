// Modelo y lógica de negocios y sucursales
export const businesses = [];

export function addBusiness({ name, branches = [] }) {
  const business = { id: Date.now().toString(), name, branches };
  businesses.push(business);
  return business;
}

export function addBranch(businessId, branch) {
  const business = businesses.find(b => b.id === businessId);
  if (business) {
    business.branches.push(branch);
    return branch;
  }
  return null;
}

export function getBusiness(id) {
  return businesses.find(b => b.id === id);
}

export function listBusinesses() {
  return businesses;
}
