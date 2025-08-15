// Reviews / ratings de servicios o negocios
export const reviews = [];

export function addReview({ entityId, entityType, userId, rating, comment }) {
  const review = { id: Date.now().toString(), entityId, entityType, userId, rating, comment, createdAt: new Date().toISOString() };
  reviews.push(review);
  return review;
}

export function listReviews(entityId, entityType) {
  return reviews.filter(r => r.entityId === entityId && r.entityType === entityType);
}
