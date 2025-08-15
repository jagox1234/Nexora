// Precios dinámicos / promociones / cupones
export const promotions = [];

export function addPromotion({ businessId, serviceId, type, value, startDate, endDate }) {
  const promo = { id: Date.now().toString(), businessId, serviceId, type, value, startDate, endDate };
  promotions.push(promo);
  return promo;
}

export function listPromotions(businessId) {
  return promotions.filter(p => p.businessId === businessId);
}
