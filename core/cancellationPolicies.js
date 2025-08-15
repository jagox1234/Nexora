// Políticas de cancelación / no-show con reglas y penalizaciones
export const cancellationPolicies = [];

export function setCancellationPolicy({ businessId, rules }) {
  const policy = { businessId, rules };
  const idx = cancellationPolicies.findIndex(p => p.businessId === businessId);
  if (idx >= 0) cancellationPolicies[idx] = policy;
  else cancellationPolicies.push(policy);
  return policy;
}

export function getCancellationPolicy(businessId) {
  return cancellationPolicies.find(p => p.businessId === businessId) || null;
}
