// core/persistence.js — versioned AsyncStorage schema handling
// Increment SCHEMA_VERSION when stored data shape changes.

export const SCHEMA_VERSION = 2; // bumped to 2 (adds booking.createdAt field if missing)
export const SCHEMA_VERSION_KEY = 'nx_schema_version';

// Each migration receives and returns a data object (mutative or immutable OK)
// Shape we care about now: { bookings, services, clients }
const migrations = {
  2: (data) => {
    if (Array.isArray(data.bookings)) {
      data.bookings = data.bookings.map(b => b.createdAt ? b : { ...b, createdAt: b.startsAt });
    }
    return data;
  },
};

export async function runMigrations(targetVersion, storedVersion, data) {
  let v = Number.isFinite(storedVersion) ? storedVersion : (storedVersion ? parseInt(storedVersion, 10) : 0);
  if (!Number.isFinite(v)) v = 0;
  if (v === targetVersion) return { migrated: false, version: v, data };
  while (v < targetVersion) {
    const next = v + 1;
    const fn = migrations[next];
    if (fn) {
      data = fn(data) || data;
    }
    v = next;
  }
  return { migrated: true, version: v, data };
}
