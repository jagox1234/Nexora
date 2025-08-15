// Nexora/3_utils.js — shared small helpers (keep pure & side-effect free)

export function safeArray(x) { return Array.isArray(x) ? x : []; }
export function safeText(x, fallback = "—") { return typeof x === "string" && x.trim() ? x : fallback; }
export function fmtTime(iso, { withDate = false } = {}) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return withDate
      ? d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}
export function findServiceName(services, id) {
  const arr = safeArray(services);
  const found = arr.find((s) => s?.id === id);
  return found?.name || "Service";
}

// Future: move any other repeated inline helpers here (e.g., money formatting, phone normalization)
