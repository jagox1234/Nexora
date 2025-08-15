// Nexora/3_core_index.js — core store (offline) + business & client flows (hooks fixed)
import { createBookingFn, confirmBookingFn, cancelBookingFn, getBookingsByDateFn, isOverlappingFn } from "@core/bookings.js";
import { upsertClientFn, removeClientFn, getClientFn } from "@core/clients.js";
import { initLocale } from "@core/i18n.js";
import { SCHEMA_VERSION, SCHEMA_VERSION_KEY, runMigrations } from "@core/persistence.js";
import { addServiceFn, removeServiceFn } from "@core/services.js";

import { React, createContext, useContext, useEffect, useMemo, useState, useCallback } from "./2_dependencies";
import { AsyncStorage } from "./2_dependencies.js";


const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ----- local persist -----
const saveJSON = async (k, v) => {
  try {
    await AsyncStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    // ignore persist error
  }
};
const loadJSON = async (k, fb) => {
  try {
    const r = await AsyncStorage.getItem(k);
    return r ? JSON.parse(r) : fb;
  } catch (e) {
    // ignore read error
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
  // ----- role -----
  const [role, setRole] = useState(null); // "business" | "client" | null
  const ROLE_KEY = "nx_role";

  // ----- business state (propio del negocio local/offline) -----
  const [clinic, setClinic] = useState(defaultClinic);
  const [services, setServices] = useState([
    { id: "srv_1", name: "Facial Clean", price: 40, durationMin: 45, active: true },
    { id: "srv_2", name: "Hyaluronic", price: 180, durationMin: 60, active: true },
  ]);
  const [clients, setClients] = useState([{ id: "cli_1", name: "María López", phone: "600123123" }]);
  const [bookings, setBookings] = useState([
    { id: "bkg_1", serviceId: "srv_1", clientId: "cli_1", startsAt: nowPlus(60), status: "confirmed", source: "app" },
  ]);

  // legacy addClient kept only so old code calling it doesn't crash; prefer upsertClient
  const addClient = useCallback(() => { /* deprecated noop */ }, []);

  // ----- client-side requests (modo cliente) -----
  const [clientRequests, setClientRequests] = useState([]); // { id, businessId, businessName, serviceName, clientName, clientPhone, whenISO|null, status:"queued"|"requested" }

  const [ready, setReady] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      await initLocale();
      const [r, c, s, cl, b, cr, storedVersionRaw] = await Promise.all([
        AsyncStorage.getItem(ROLE_KEY),
        loadJSON("nx_clinic", defaultClinic),
        loadJSON("nx_services", null),
        loadJSON("nx_clients", null),
        loadJSON("nx_bookings", null),
        loadJSON("nx_client_requests", []),
        AsyncStorage.getItem(SCHEMA_VERSION_KEY)
      ]);
      let data = { services: s || [], clients: cl || [], bookings: b || [] };
      const storedVersion = storedVersionRaw ? parseInt(storedVersionRaw, 10) : 0;
      const { migrated, version, data: migratedData } = await runMigrations(SCHEMA_VERSION, storedVersion, data);
      if (migrated) {
        try { await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(version)); } catch {}
        // persist transformed collections
        try { await AsyncStorage.setItem('nx_bookings', JSON.stringify(migratedData.bookings)); } catch {}
      }
      if (r === "business" || r === "client") setRole(r);
      if (c) setClinic(c);
      if (s) setServices(migratedData.services || s || []);
      if (cl) setClients(migratedData.clients || cl || []);
      if (b) setBookings(migratedData.bookings || b || []);
      if (cr) setClientRequests(cr);
      setReady(true);
      if (!storedVersionRaw) {
        try { await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION)); } catch {}
      }
    })();
  }, []);

  // autosave
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(ROLE_KEY, role || "").catch(() => {
      // ignore
    });
  }, [role, ready]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveJSON("nx_clinic", clinic), 200);
    return () => clearTimeout(t);
  }, [clinic, ready]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveJSON("nx_services", services), 200);
    return () => clearTimeout(t);
  }, [services, ready]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveJSON("nx_clients", clients), 200);
    return () => clearTimeout(t);
  }, [clients, ready]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveJSON("nx_bookings", bookings), 200);
    return () => clearTimeout(t);
  }, [bookings, ready]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveJSON("nx_client_requests", clientRequests), 200);
    return () => clearTimeout(t);
  }, [clientRequests, ready]);

  // ----- helpers business -----
  const dayKey = useCallback(
    (d) => ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(d).getDay()],
    []
  );

  const parseRange = useCallback(
    (rng) =>
      (baseISO, minutes = 0) => {
        const base = new Date(baseISO);
        const [a, b] = rng.split("-");
        const mk = (hhmm) => {
          const [h, m] = hhmm.split(":").map(Number);
          const x = new Date(base);
          x.setHours(h, m, 0, 0);
          return x;
        };
        const start = mk(a);
        const end = mk(b);
        end.setMinutes(end.getMinutes() - minutes);
        return [start, end];
      },
    []
  );

  // generate 10-min slots for a day & service
  const generateSlots = useCallback(
    (dateBase, serviceId) => {
      const srv = services.find((s) => s.id === serviceId);
      if (!srv) return [];
      const d = new Date(dateBase);
      d.setHours(0, 0, 0, 0);
      const key = dayKey(d);
      const ranges = clinic.openingHours[key] || [];
      const out = [];
      for (const r of ranges) {
        const toRange = parseRange(r);
        const [start, end] = toRange(d.toISOString(), srv.durationMin);
        for (let t = new Date(start); t <= end; t = new Date(t.getTime() + 10 * 60 * 1000)) {
          out.push(t.toISOString());
        }
      }
      return out;
    },
    [services, clinic, dayKey, parseRange]
  );

  // overlap check
  const isOverlapping = useCallback((whenISO, serviceId, excludeId = null) => (
    isOverlappingFn({ bookings, services, whenISO, serviceId, excludeId })
  ), [bookings, services]);

  // clients (business)
  const upsertClient = useCallback(({ name, phone }) => {
    const res = upsertClientFn(clients, { name, phone });
    if (res.created) setClients(res.clients);
    return res.client;
  }, [clients]);

  const removeClient = useCallback((id) => {
    setClients((c) => removeClientFn(c, id));
  }, []);

  // services (business)
  const addService = useCallback((payload) => {
    setServices((s) => addServiceFn(s, payload).services);
  }, []);

  const removeService = useCallback((id) => {
    setServices((s) => removeServiceFn(s, id));
  }, []);

  // bookings (business)
  const createBooking = useCallback(({ serviceId, clientName, clientPhone, whenISO }) => {
    const client = upsertClient({ name: clientName, phone: clientPhone });
    const res = createBookingFn({ bookings, services, serviceId, clientId: client.id, whenISO });
    if (res.ok) setBookings((b) => [{ ...res.booking, createdAt: new Date().toISOString() }, ...b]);
    return res.ok ? { ok: true, id: res.booking.id } : res;
  }, [bookings, services, upsertClient]);

  const confirmBooking = useCallback((id) => {
    setBookings((b) => confirmBookingFn(b, id));
  }, []);

  const cancelBooking = useCallback((id) => {
    setBookings((b) => cancelBookingFn(b, id));
  }, []);

  // queries (business)
  const getBookingsByDate = useCallback((date) => getBookingsByDateFn(bookings, date), [bookings]);
  const getClient = useCallback((id) => getClientFn(clients, id), [clients]);
  const getService = useCallback((id) => services.find((s) => s.id === id) || null, [services]);

  // ----- client flow (offline mock) -----
  const businesses = useMemo(
    () => [
      {
        id: "biz_1",
        name: "Shinobi Aesthetics",
        category: "Clinic",
        city: "Madrid",
        services: [
          { name: "Facial Clean", durationMin: 45, price: 40 },
          { name: "Hyaluronic", durationMin: 60, price: 180 },
        ],
      },
      {
        id: "biz_2",
        name: "Zen Cuts & Spa",
        category: "Spa",
        city: "Barcelona",
        services: [
          { name: "Relax Massage", durationMin: 60, price: 55 },
          { name: "Deep Massage", durationMin: 90, price: 80 },
        ],
      },
    ],
    []
  );

  const addClientRequest = useCallback(
    ({ businessId, businessName, serviceName, clientName, clientPhone, whenISO }) => {
      const id = `req_${Date.now()}`;
      const row = {
        id,
        businessId,
        businessName,
        serviceName,
        clientName,
        clientPhone,
        whenISO: whenISO || null,
        status: whenISO ? "requested" : "queued",
      };
      setClientRequests((r) => [row, ...r]);
      return { ok: true, id };
    },
    []
  );

  const removeClientRequest = useCallback((id) => {
    setClientRequests((r) => r.filter((x) => x.id !== id));
  }, []);

  // role controls
  const pickRole = useCallback((r) => setRole(r), []);
  const clearRole = useCallback(() => setRole(null), []);

  // value (callbacks estables → sin warnings)
  const value = useMemo(
    () => ({
      // role
      role,
      pickRole,
      clearRole,
      // business state & logic
      clinic,
      setClinic,
      services,
      setServices,
      addService,
      removeService,
      clients,
      setClients,
  addClient,
      upsertClient,
      removeClient,
      bookings,
      setBookings,
  createBooking,
  confirmBooking,
  cancelBooking,
  generateSlots,
  isOverlapping,
  getBookingsByDate,
  getClient,
  getService,
      // client-side mock
      businesses,
      clientRequests,
      addClientRequest,
      removeClientRequest,
    }),
    [
      // state
      role,
      clinic,
      services,
      clients,
      bookings,
      clientRequests,
      // callbacks
      pickRole,
      clearRole,
      setClinic,
      setServices,
      setClients,
      setBookings,
      addService,
      removeService,
  addClient,
      upsertClient,
      removeClient,
      createBooking,
      confirmBooking,
      cancelBooking,
      generateSlots,
      isOverlapping,
      getBookingsByDate,
      getClient,
      getService,
      businesses,
      addClientRequest,
      removeClientRequest,
    ]
  );

  if (!ready) return null;
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
