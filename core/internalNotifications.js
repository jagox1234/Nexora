// Panel de notificaciones internas
export const internalNotifications = [];

export function addInternalNotification({ to, message, type }) {
  const notification = { id: Date.now().toString(), to, message, type, createdAt: new Date().toISOString() };
  internalNotifications.push(notification);
  return notification;
}

export function listInternalNotifications(to) {
  return internalNotifications.filter(n => n.to === to);
}
