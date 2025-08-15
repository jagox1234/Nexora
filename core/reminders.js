// Recordatorios (push/email/SMS) antes de la cita
export const reminders = [];

export function addReminder({ bookingId, type, sendAt }) {
  const reminder = { id: Date.now().toString(), bookingId, type, sendAt, sent: false };
  reminders.push(reminder);
  return reminder;
}

export function markReminderSent(reminderId) {
  const r = reminders.find(rem => rem.id === reminderId);
  if (r) r.sent = true;
}

export function listReminders(bookingId) {
  return reminders.filter(r => r.bookingId === bookingId);
}
