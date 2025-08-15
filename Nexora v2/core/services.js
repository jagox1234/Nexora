// v2/core/services.js — pure helpers for services domain (migrated from original Nexora/core/services.js)
// All functions are pure (no side effects) and return new arrays or entities.

export function makeService(payload) {
	const id = `srv_${Date.now()}`;
	return { id, active: true, ...payload };
}

export function addServiceFn(services, payload) {
	const s = makeService(payload);
	return { services: [s, ...services], created: s };
}

export function validateServicePayload(p){
	if(!p) return false;
	if(!p.name || typeof p.name !== 'string') return false;
	if(!Number.isFinite(p.price) || p.price < 0) return false;
	if(!Number.isFinite(p.durationMin) || p.durationMin <= 0) return false;
	return true;
}

export function removeServiceFn(services, id) {
	return services.filter(s => s.id !== id);
}

export function getServiceFn(services, id) {
	return services.find(s => s.id === id) || null;
}
