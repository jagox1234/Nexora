// API backend real (REST/GraphQL) con auth tokens
export function callApi({ endpoint, method = 'GET', data, token }) {
  // TODO: integración real con backend
  return { ok: true, endpoint, method, data, token };
}
