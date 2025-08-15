// Confirmaciones automáticas por email/SMS
export const notifications = [];

export function sendNotification({ to, type, message }) {
  const notification = { id: Date.now().toString(), to, type, message, sentAt: new Date().toISOString() };
  notifications.push(notification);
  // TODO: integración real con email/SMS
  return notification;
}

export function listNotifications(to) {
  return notifications.filter(n => n.to === to);
}
