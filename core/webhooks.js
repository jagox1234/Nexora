// Webhooks para integraciones externas
export function triggerWebhook({ url, payload }) {
  // TODO: integración real con webhook externo
  return { ok: true, url, payload };
}
