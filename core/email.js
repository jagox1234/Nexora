// Emails transaccionales
export function sendEmail({ to, subject, body }) {
  // TODO: integración real con servicio de email
  return { to, subject, body, sent: true };
}
