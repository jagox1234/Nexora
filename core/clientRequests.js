// Peticiones de clientes completas: creación, aprobación, mensajería
export const clientRequests = [];

export function addClientRequest({ clientId, businessId, serviceId, message }) {
  const request = { id: Date.now().toString(), clientId, businessId, serviceId, message, status: 'pending', messages: [] };
  clientRequests.push(request);
  return request;
}

export function approveClientRequest(requestId) {
  const req = clientRequests.find(r => r.id === requestId);
  if (req) req.status = 'approved';
}

export function addMessageToRequest(requestId, message) {
  const req = clientRequests.find(r => r.id === requestId);
  if (req) req.messages.push(message);
}
