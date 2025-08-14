// Nexora/3_core_index.js — core store (offline) + business & client flows (hooks fixed)
import {
  React,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "./2_dependencies";
import { AsyncStorage } from "./2_dependencies";

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

  // ----- client-side requests (modo cliente) -----
  const [clientRequests, setClientRequests] = useState([]); // { id, businessId, businessName, serviceName, clientName, clientPhone, whenISO|null, status:"queued"|"requested" }

  const [ready, setReady] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      const [r, c, s, cl, b, cr] = await Promise.all([
        AsyncStorage.getItem(ROLE_KEY),
        loadJSON("nx_clinic", defaultClinic),
        loadJSON("nx_services", null),
        loadJSON("nx_clients", null),
        loadJSON("nx_bookings", null),
        loadJSON("nx_client_requests", []),
      ]);
      if (r === "business" || r === "client") setRole(r);
      if (c) setClinic(c);
      if (s) setServices(s);
      if (cl) setClients(cl);
      if (b) setBookings(b);
      if (cr) setClientRequests(cr);
      setReady(true);
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
  const isOverlapping = useCallback(
    (whenISO, serviceId, excludeId = null) => {
      const srv = services.find((s) => s.id === serviceId);
      if (!srv) return false;
      const start = new Date(whenISO).getTime();
      const end = start + srv.durationMin * 60 * 1000;
      return bookings.some((b) => {
        if (excludeId && b.id === excludeId) return false;
        if (b.serviceId !== serviceId || b.status === "cancelled") return false;
        const s = new Date(b.startsAt).getTime();
        const e = s + (services.find((x) => x.id === b.serviceId)?.durationMin || 0) * 60 * 1000;
        return Math.max(s, start) < Math.min(e, end);
      });
    },
    [services, bookings]
  );

  // clients (business)
  const addClient = useCallback(
    ({ name, phone }) => {
      const exists = clients.find((c) => c.phone === phone);
      if (exists) return exists;
      const id = `cli_${Date.now()}`;
      const row = { id, name: name || "Client", phone: phone || "" };
      setClients((c) => [row, ...c]);
      return row;
    },
    [clients]
  );

  const upsertClient = useCallback(({ name, phone }) => addClient({ name, phone }), [addClient]);

  const removeClient = useCallback((id) => {
    setClients((c) => c.filter((x) => x.id !== id));
  }, []);

  // services (business)
  const addService = useCallback((payload) => {
    const id = `srv_${Date.now()}`;
    setServices((s) => [{ id, ...payload }, ...s]);
  }, []);

  const removeService = useCallback((id) => {
    setServices((s) => s.filter((x) => x.id !== id));
  }, []);

  // bookings (business)
  const createBooking = useCallback(
    ({ serviceId, clientName, clientPhone, whenISO }) => {
      if (!serviceId || !clientPhone || !whenISO) return { ok: false, error: "Missing fields" };
      if (isOverlapping(whenISO, serviceId)) return { ok: false, error: "Overlapping booking" };
      const client = upsertClient({ name: clientName, phone: clientPhone });
      const id = `bkg_${Date.now()}`;
      const row = { id, serviceId, clientId: client.id, startsAt: whenISO, status: "pending", source: "app" };
      setBookings((b) => [row, ...b]);
      return { ok: true, id };
    },
    [isOverlapping, upsertClient]
  );

  const confirmBooking = useCallback((id) => {
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, status: "confirmed" } : x)));
  }, []);

  const cancelBooking = useCallback((id) => {
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
  }, []);

  // queries (business)
  const getBookingsByDate = useCallback(
    (date) => {
      const d = new Date(date);
      const tag = d.toDateString();
      return bookings
        .filter((b) => new Date(b.startsAt).toDateString() === tag)
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    },
    [bookings]
  );

  const getClient = useCallback((id) => clients.find((c) => c.id === id) || null, [clients]);
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
