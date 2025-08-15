// Planes de suscripción y límites en plan free
export const subscriptions = [];

export function setSubscription({ userId, plan, limits }) {
  const sub = { userId, plan, limits };
  subscriptions.push(sub);
  return sub;
}

export function getSubscription(userId) {
  return subscriptions.find(s => s.userId === userId) || null;
}
