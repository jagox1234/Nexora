// v2/core/index.js — core store & domain composition (migrated from 3_core_index.js)
// Imports adjusted to use v2 paths and local domain helpers.
import { React, createContext, useContext, useEffect, useMemo, useState, useCallback, AsyncStorage } from '../app/dependencies.js';
import { KEYS } from './persistenceKeys.js';
import { schedulePersist } from './batchPersist.js';
import { useLocation } from '../providers/location.js';

// Domain modules (alphabetical after utils requirement in rule groups)
import { createBookingFn, confirmBookingFn, cancelBookingFn, getBookingsByDateFn, isOverlappingFn } from './bookings.js';
import { createAuthState, registerUser, loginUser, logoutUser, grantRole } from './auth.js';
import { addBusinessFn, updateBusinessFn, removeBusinessFn, attachServiceToBusiness, addStaffToBusiness } from './businesses.js';
import { addStaffFn, removeStaffFn, attachSkillFn } from './staff.js';
import { addAvailabilityFn, removeAvailabilityFn, getAvailabilityFor, generateStaffSlots } from './availability.js';
import { addRequestFn, updateRequestStatusFn, removeRequestFn } from './requests.js';
import { upsertClientFn, removeClientFn, getClientFn } from './clients.js';
import { initLocale } from './i18n.js';
import { SCHEMA_VERSION, SCHEMA_VERSION_KEY, runMigrations } from './persistence.js';
import { addServiceFn, removeServiceFn, validateServicePayload } from './services.js';
import { startSyncWorker } from './sync.js';
import { mark, measure, globalSyncQueue, loadSyncQueue, persistSyncQueue } from './utils.js';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ----- local persist -----
const saveJSON = async (k, v) => {
	try {
		await AsyncStorage.setItem(k, JSON.stringify(v));
	} catch {
		// ignore persist error
	}
};
const loadJSON = async (k, fb) => {
	try {
		const r = await AsyncStorage.getItem(k);
		return r ? JSON.parse(r) : fb;
	} catch {
		return fb;
	}
};

// ----- defaults -----
const defaultClinic = {
	name: "Nexora — Demo Clinic",
	timezone: "Europe/Madrid",
	openingHours: {
		mon: ["10:00-14:00", "16:00-20:00"],
		tue: ["10:00-14:00", "16:00-20:00"],
		wed: ["10:00-14:00", "16:00-20:00"],
		thu: ["10:00-14:00", "16:00-20:00"],
		fri: ["10:00-14:00", "16:00-20:00"],
		sat: ["10:00-14:00"],
		sun: [],
	},
};

const nowPlus = (m) => new Date(Date.now() + m * 60 * 1000).toISOString();

export function AppProvider({ children }) {
	const loc = useLocation?.();
	// ----- role -----
	const [role, setRole] = useState(null); // "business" | "client" | null
	const ROLE_KEY = KEYS.ROLE;

	// ----- business state -----
	const [clinic, setClinic] = useState(defaultClinic);
	// Advanced multi-business scaffolding
	const [businessesAdvanced, setBusinessesAdvanced] = useState([]);
	const [staff, setStaff] = useState([]);
	const [availability, setAvailability] = useState([]);
	const [services, setServices] = useState([
		{ id: "srv_1", name: "Facial Clean", price: 40, durationMin: 45, active: true, businessId: null },
		{ id: "srv_2", name: "Hyaluronic", price: 180, durationMin: 60, active: true, businessId: null },
	]);
	const [clients, setClients] = useState([{ id: "cli_1", name: "María López", phone: "600123123" }]);
	const [bookings, setBookings] = useState([
		{ id: "bkg_1", serviceId: "srv_1", clientId: "cli_1", startsAt: nowPlus(60), status: "confirmed", source: "app" },
	]);

	// ----- requests (advanced only, legacy migrated on load) -----
	const [requestsAdvanced, setRequestsAdvanced] = useState([]);

	// Auth scaffold
	const [auth, setAuth] = useState(createAuthState());
	const hasRole = useCallback((r) => !!auth.currentUser?.roles?.includes(r), [auth.currentUser]);
	const [currentBusinessId, setCurrentBusinessId] = useState(null);
	const CURRENT_BIZ_KEY = KEYS.CURRENT_BIZ;

	const [ready, setReady] = useState(false);

	// Auto-select first business on load if none selected yet
	useEffect(()=> { if(ready && !currentBusinessId && businessesAdvanced.length) setCurrentBusinessId(businessesAdvanced[0].id); }, [ready, currentBusinessId, businessesAdvanced.length]);

	// load
	useEffect(() => {
		(async () => {
			await initLocale();
			const [r, c, s, cl, b, cr, storedVersionRaw, advBizRaw, staffRaw, availRaw, advReqRaw, authRaw, curBizRaw] = await Promise.all([
				AsyncStorage.getItem(ROLE_KEY),
				loadJSON(KEYS.CLINIC, defaultClinic),
				loadJSON(KEYS.SERVICES, null),
				loadJSON(KEYS.CLIENTS, null),
				loadJSON(KEYS.BOOKINGS, null),
				loadJSON(KEYS.CLIENT_REQUESTS_LEGACY, []),
				AsyncStorage.getItem(SCHEMA_VERSION_KEY),
				loadJSON(KEYS.BUSINESSES_ADV, []),
				loadJSON(KEYS.STAFF, []),
				loadJSON(KEYS.AVAILABILITY, []),
				loadJSON(KEYS.REQUESTS_ADV, []),
						loadJSON(KEYS.AUTH, null),
						AsyncStorage.getItem(CURRENT_BIZ_KEY)
			]);
			let data = { services: s || [], clients: cl || [], bookings: b || [] };
			const storedVersion = storedVersionRaw ? parseInt(storedVersionRaw, 10) : 0;
			const { migrated, version, data: migratedData } = await runMigrations(SCHEMA_VERSION, storedVersion, data);
			if (migrated) {
				try { await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(version)); } catch {}
				try { await AsyncStorage.setItem(KEYS.BOOKINGS, JSON.stringify(migratedData.bookings)); } catch {}
			}
			if (r === "business" || r === "client") setRole(r);
			if (c) setClinic(c);
			if (s) setServices(migratedData.services || s || []);
			if (cl) setClients(migratedData.clients || cl || []);
			if (b) setBookings(migratedData.bookings || b || []);
			// legacy clientRequests loaded into variable cr for migration only
			if (advBizRaw) setBusinessesAdvanced(advBizRaw);
			if (staffRaw) setStaff(staffRaw);
			if (availRaw) setAvailability(availRaw);
			if (advReqRaw) setRequestsAdvanced(advReqRaw);
			if (authRaw) setAuth(authRaw);
			if (curBizRaw) setCurrentBusinessId(curBizRaw);
			// --- migration legacy clientRequests -> requestsAdvanced if advanced empty OR merge ---
				if ((cr?.length || 0) > 0) {
				setRequestsAdvanced(prev => {
					if (!prev.length) {
						return cr.map(x => ({ id: x.id || `req_${Date.now()}`, clientName: x.clientName, clientPhone: x.clientPhone, serviceName: x.serviceName, whenISO: x.whenISO || null, status: x.status || 'pending', businessId: x.businessId || null, createdAt: x.createdAt || new Date().toISOString() }));
					}
					// merge non-duplicated ids
					const existingIds = new Set(prev.map(p=>p.id));
					const migrated = cr.filter(x=> !existingIds.has(x.id)).map(x => ({ id: x.id || `req_${Date.now()}`, clientName: x.clientName, clientPhone: x.clientPhone, serviceName: x.serviceName, whenISO: x.whenISO || null, status: x.status || 'pending', businessId: x.businessId || null, createdAt: x.createdAt || new Date().toISOString() }));
					return migrated.length ? [...migrated, ...prev] : prev;
				});
				// clear legacy after migration (best-effort)
					try { await AsyncStorage.setItem(KEYS.CLIENT_REQUESTS_LEGACY, JSON.stringify([])); } catch {}
			}
			await loadSyncQueue(async (k)=> JSON.parse(await AsyncStorage.getItem(k) || '[]'));
			startSyncWorker();
			setReady(true);
			if (!storedVersionRaw) {
					try { await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION)); } catch {}
			}
		})();
	}, []);

	// autosave sections
	useEffect(() => { if (!ready) return; schedulePersist(ROLE_KEY, role || ""); }, [role, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.CLINIC, clinic); }, [clinic, ready]);

	// auto-enrich clinic location (city/region) once when GPS fresh & role business
	useEffect(() => {
		if (!ready) return;
		if (!loc || loc.status !== 'granted' || loc.isStale || !loc.address) return;
		// only update if missing fields to avoid overwriting manual edits
		setClinic(c => {
			if (!c) return c;
			const needsCity = !c.city && loc.address.city;
			const needsRegion = !c.region && loc.address.region;
			if (!needsCity && !needsRegion) return c;
			return { ...c, city: needsCity ? loc.address.city : c.city, region: needsRegion ? loc.address.region : c.region };
		});
	}, [loc?.status, loc?.isStale, loc?.address?.city, loc?.address?.region, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.SERVICES, services); }, [services, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.CLIENTS, clients); }, [clients, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.BOOKINGS, bookings); }, [bookings, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.BUSINESSES_ADV, businessesAdvanced); }, [businessesAdvanced, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.STAFF, staff); }, [staff, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.AVAILABILITY, availability); }, [availability, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.REQUESTS_ADV, requestsAdvanced); }, [requestsAdvanced, ready]);
	useEffect(() => { if (!ready) return; schedulePersist(KEYS.AUTH, auth); }, [auth, ready]);
	useEffect(() => { if (!ready) return; if(currentBusinessId) schedulePersist(CURRENT_BIZ_KEY, currentBusinessId); }, [currentBusinessId, ready]);
	useEffect(() => { if (!ready) return; const t = setTimeout(() => persistSyncQueue(async (k,v)=> AsyncStorage.setItem(k, JSON.stringify(v))), 400); return () => clearTimeout(t); }, [services, bookings, ready]);

	// helpers
	const dayKey = useCallback((d) => ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(d).getDay()], []);
	const parseRange = useCallback((rng) => (baseISO, minutes = 0) => {
		const base = new Date(baseISO);
		const [a, b] = rng.split("-");
		const mk = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); const x = new Date(base); x.setHours(h, m, 0, 0); return x; };
		const start = mk(a); const end = mk(b); end.setMinutes(end.getMinutes() - minutes); return [start, end];
	}, []);

	const generateSlots = useCallback((dateBase, serviceId) => {
		const srv = services.find((s) => s.id === serviceId);
		if (!srv) return [];
		const d = new Date(dateBase); d.setHours(0, 0, 0, 0);
		const key = dayKey(d); const ranges = clinic.openingHours[key] || []; const out = [];
		for (const r of ranges) {
			const toRange = parseRange(r); const [start, end] = toRange(d.toISOString(), srv.durationMin);
			for (let t = new Date(start); t <= end; t = new Date(t.getTime() + 10 * 60 * 1000)) { out.push(t.toISOString()); }
		}
		return out;
	}, [services, clinic, dayKey, parseRange]);

	// Staff-specific availability slots
	const generateStaffSlotsForService = useCallback(({ dateBase, serviceId, staffId }) => {
		const srv = services.find(s=>s.id===serviceId); if(!srv) return [];
		const av = getAvailabilityFor(availability, { staffId, date:dateBase });
		if(!av.length) return [];
		return generateStaffSlots({ availabilityList: av, date: dateBase, serviceDurationMin: srv.durationMin });
	}, [availability, services]);

	const isOverlapping = useCallback((whenISO, serviceId, excludeId = null) => (
		isOverlappingFn({ bookings, services, whenISO, serviceId, excludeId })
	), [bookings, services]);

	// clients
	const upsertClient = useCallback(({ name, phone }) => {
		const res = upsertClientFn(clients, { name, phone });
		if (res.created) setClients(res.clients);
		return res.client;
	}, [clients]);
	const removeClient = useCallback((id) => { setClients((c) => removeClientFn(c, id)); }, []);

	// services
	const addService = useCallback((payload) => {
		if(!validateServicePayload(payload)) return { ok:false, error:'invalid_service_payload' };
		mark('addService');
		let created;
		setServices((s) => { const { services: next, created: c } = addServiceFn(s, { ...payload, businessId: currentBusinessId }); created = c; return next; });
		measure('addService_duration','addService');
		globalSyncQueue.enqueue('service_added', { payload: created });
		return { ok:true, created };
	}, [currentBusinessId]);
	const removeService = useCallback((id) => { setServices((s) => removeServiceFn(s, id)); }, []);

	// bookings
	const createBooking = useCallback(({ serviceId, clientName, clientPhone, whenISO }) => {
		mark('createBooking');
		const client = upsertClient({ name: clientName, phone: clientPhone });
		const res = createBookingFn({ bookings, services, serviceId, clientId: client.id, whenISO });
		if (res.ok) {
			setBookings((b) => [{ ...res.booking, businessId: currentBusinessId || null, createdAt: new Date().toISOString() }, ...b]);
			globalSyncQueue.enqueue('booking_created', { id: res.booking.id, serviceId, clientId: client.id, whenISO });
		}
		measure('createBooking_duration','createBooking');
		return res.ok ? { ok: true, id: res.booking.id } : res;
	}, [bookings, services, upsertClient, currentBusinessId]);

	// Advanced requests actions
	const addAdvancedRequest = useCallback((payload) => { const { list, created } = addRequestFn(requestsAdvanced, payload); setRequestsAdvanced(list); return created; }, [requestsAdvanced]);
	const updateRequestStatus = useCallback((id, status) => { setRequestsAdvanced(r => updateRequestStatusFn(r,id,status)); }, []);
	const removeAdvancedRequest = useCallback((id) => { setRequestsAdvanced(r => removeRequestFn(r,id)); }, []);

	// Auth actions
	const register = useCallback(async ({ email, password, name }) => { const r = await registerUser(auth, { email, password, name }); if(r.ok) setAuth(r.state); return r; }, [auth]);
	const login = useCallback(async ({ email, password }) => { const r = await loginUser(auth, { email, password }); if(r.ok) setAuth(r.state); return r; }, [auth]);
	const logout = useCallback(() => { const r = logoutUser(auth); if(r.ok) setAuth(r.state); return r; }, [auth]);
	const grant = useCallback(({ userId, role }) => { setAuth(a => grantRole(a, { userId, role })); }, []);

	// Businesses & staff management
	const addBusiness = useCallback((payload) => { const { list, created } = addBusinessFn(businessesAdvanced, payload); setBusinessesAdvanced(list); if(!currentBusinessId) setCurrentBusinessId(created.id); return created; }, [businessesAdvanced, currentBusinessId]);
	const updateBusiness = useCallback((id, patch) => { setBusinessesAdvanced(list => updateBusinessFn(list,id,patch)); }, []);
	const removeBusiness = useCallback((id) => { setBusinessesAdvanced(list => removeBusinessFn(list,id)); }, []);
	const addStaff = useCallback((payload) => { const { list, created } = addStaffFn(staff, { ...payload, businessId: currentBusinessId }); setStaff(list); return created; }, [staff, currentBusinessId]);
	const removeStaff = useCallback((id) => { setStaff(list => removeStaffFn(list,id)); }, []);
	const attachSkill = useCallback((id, skill) => { setStaff(list => attachSkillFn(list,id,skill)); }, []);
	const addAvailability = useCallback((payload) => { const { list, created } = addAvailabilityFn(availability, { ...payload, businessId: currentBusinessId }); setAvailability(list); return created; }, [availability, currentBusinessId]);
	const removeAvailability = useCallback((id) => { setAvailability(list => removeAvailabilityFn(list,id)); }, []);
	const confirmBooking = useCallback((id) => { setBookings((b) => confirmBookingFn(b, id)); }, []);
	const cancelBooking = useCallback((id) => { setBookings((b) => cancelBookingFn(b, id)); }, []);

	// queries
	const visibleBookings = useMemo(() => bookings.filter(b => !currentBusinessId || b.businessId===currentBusinessId || b.businessId==null), [bookings, currentBusinessId]);
	const getBookingsByDate = useCallback((date) => getBookingsByDateFn(visibleBookings, date), [visibleBookings]);
	const getClient = useCallback((id) => getClientFn(clients, id), [clients]);
	const filteredServices = useMemo(() => services.filter(s => !currentBusinessId || s.businessId===currentBusinessId || s.businessId==null), [services, currentBusinessId]);
	const getService = useCallback((id) => filteredServices.find((s) => s.id === id) || null, [filteredServices]);

	// client flow mock
	const businesses = useMemo(() => [
		{ id: "biz_1", name: "Shinobi Aesthetics", category: "Clinic", city: "Madrid", lat: 40.4168, lng: -3.7038, services: [ { name: "Facial Clean", durationMin: 45, price: 40 }, { name: "Hyaluronic", durationMin: 60, price: 180 } ] },
		{ id: "biz_2", name: "Zen Cuts & Spa", category: "Spa", city: "Barcelona", lat: 41.3874, lng: 2.1686, services: [ { name: "Relax Massage", durationMin: 60, price: 55 }, { name: "Deep Massage", durationMin: 90, price: 80 } ] },
		{ id: "biz_3", name: "Valencia Glow", category: "Clinic", city: "Valencia", lat: 39.4699, lng: -0.3763, services: [ { name: "Peeling", durationMin: 40, price: 65 } ] },
	], []);

	// legacy clientRequests API removed after migration
	const addClientRequest = useCallback(() => ({ ok:false, error:'deprecated' }), []);
	const removeClientRequest = useCallback(() => {}, []);

	// role controls
	const pickRole = useCallback((r) => setRole(r), []);
	const clearRole = useCallback(() => setRole(null), []);

	const value = useMemo(() => ({
		role, pickRole, clearRole,
		clinic, setClinic,
		services: filteredServices, setServices, addService, removeService,
		clients, setClients, upsertClient, removeClient,
		bookings: visibleBookings, setBookings, createBooking, confirmBooking, cancelBooking,
		generateSlots, isOverlapping, getBookingsByDate, getClient, getService,
		businesses, addClientRequest, removeClientRequest,
		// Advanced scaffolds
		businessesAdvanced, staff, availability, generateStaffSlotsForService,
		addBusiness, updateBusiness, removeBusiness,
		addStaff, removeStaff, attachSkill, addAvailability, removeAvailability,
		requestsAdvanced, addAdvancedRequest, updateRequestStatus, removeAdvancedRequest,
		auth, register, login, logout, grant, hasRole,
		currentBusinessId, setCurrentBusinessId,
	}), [
		role, clinic, services, clients, bookings,
		pickRole, clearRole, setClinic, setServices, setClients, setBookings,
		addService, removeService, upsertClient, removeClient,
		createBooking, confirmBooking, cancelBooking,
		generateSlots, isOverlapping, getBookingsByDate, getClient, getService,
		businesses, addClientRequest, removeClientRequest,
		businessesAdvanced, staff, availability, generateStaffSlotsForService,
		addBusiness, updateBusiness, removeBusiness,
		addStaff, removeStaff, attachSkill, addAvailability, removeAvailability,
		requestsAdvanced, addAdvancedRequest, updateRequestStatus, removeAdvancedRequest,
		auth, register, login, logout, grant, hasRole,
		currentBusinessId,
	]);

	if (!ready) return null;
	return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

	// re-export pure helpers for consumers & testing
	export { generateSlotsForDay } from './helpers.js';
	export { formatTimeRange, isSameDay } from './utils.js';
	export { minutesBetween, bookingOverlaps, validateBooking } from './logic.js';
	export { safeArray, safeText, fmtTime, findServiceName } from './miscUtils.js';
	export { configureSync, startSyncWorker, processNextSyncItem } from './sync.js';
	export { globalSyncQueue } from './utils.js';
