// Upsell in-app y referidos/códigos invitación
export function showUpsell(userId) {
  // TODO: lógica de upsell
  return { userId, shown: true };
}

export function addReferralCode(userId, code) {
  return { userId, code };
}
