// v2/core/bookings.js — booking domain logic (pure functions) (migrated)

export function makeBooking({ serviceId, clientId, whenISO }) {
	const id = `bkg_${Date.now()}`;
	return { id, serviceId, clientId, startsAt: whenISO, status: 'pending', source: 'app' };
}

export function isOverlappingFn({ bookings, services, whenISO, serviceId, excludeId }) {
	const srv = services.find(s => s.id === serviceId);
	if (!srv) return false;
	const start = new Date(whenISO).getTime();
	const end = start + srv.durationMin * 60000;
	return bookings.some(b => {
		if (excludeId && b.id === excludeId) return false;
		if (b.serviceId !== serviceId || b.status === 'cancelled') return false;
		const srvB = services.find(s => s.id === b.serviceId);
		if (!srvB) return false;
		const s = new Date(b.startsAt).getTime();
		const e = s + srvB.durationMin * 60000;
		return Math.max(s, start) < Math.min(e, end);
	});
}

export function createBookingFn({ bookings, services, serviceId, clientId, whenISO, now = Date.now() }) {
	if (!serviceId || !clientId || !whenISO) return { ok: false, error: 'missing_fields' };
	const starts = new Date(whenISO).getTime();
	if (isNaN(starts)) return { ok:false, error:'invalid_date' };
	if (starts < now - 60 * 1000) return { ok:false, error:'in_past' }; // allow 1m grace
	if (isOverlappingFn({ bookings, services, whenISO, serviceId })) return { ok: false, error: 'overlap' };
	const booking = makeBooking({ serviceId, clientId, whenISO });
	return { ok: true, booking };
}

export function confirmBookingFn(bookings, id) {
	return bookings.map(b => (b.id === id ? { ...b, status: 'confirmed' } : b));
}

export function cancelBookingFn(bookings, id) {
	return bookings.map(b => (b.id === id ? { ...b, status: 'cancelled' } : b));
}

export function getBookingsByDateFn(bookings, date) {
	const d = new Date(date); const tag = d.toDateString();
	return bookings
		.filter(b => new Date(b.startsAt).toDateString() === tag)
		.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
}
