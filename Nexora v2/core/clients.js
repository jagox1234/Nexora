// v2/core/clients.js — pure helpers for clients domain (migrated)

export function makeClient({ name, phone }) {
	const id = `cli_${Date.now()}`;
	return { id, name: name || 'Client', phone: phone || '' };
}

export function upsertClientFn(clients, { name, phone }) {
	const existing = clients.find(c => c.phone === phone);
	if (existing) return { clients, client: existing, created: false };
	const c = makeClient({ name, phone });
	return { clients: [c, ...clients], client: c, created: true };
}

export function removeClientFn(clients, id) {
	return clients.filter(c => c.id !== id);
}

export function getClientFn(clients, id) {
	return clients.find(c => c.id === id) || null;
}
