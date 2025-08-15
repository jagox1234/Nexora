// v2/core/utils.js — generic formatting utilities (migrated)
export const formatTimeRange = (startISO, durationMin) => {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + durationMin * 60000);
  const pad = (n) => n.toString().padStart(2,'0');
  const sh = pad(start.getHours()); const sm = pad(start.getMinutes());
  const eh = pad(end.getHours()); const em = pad(end.getMinutes());
  return `${sh}:${sm} - ${eh}:${em}`;
};

export const isSameDay = (a,b) => new Date(a).toDateString() === new Date(b).toDateString();
// Logger & performance utilities appended

// Simple leveled logger with pluggable sinks
export const createLogger = (name = 'app') => {
  const sinks = [];
  const addSink = fn => { sinks.push(fn); return () => { const i = sinks.indexOf(fn); if(i>=0) sinks.splice(i,1); }; };
  const emit = (level, args) => {
    const evt = { ts: Date.now(), level, name, args };
    (console[level] || console.log)(`[${name}](${level})`, ...args);
    sinks.forEach(fn => { try { fn(evt); } catch(e){ /* sink error ignored */ } });
  };
  return {
    addSink,
    debug: (...a) => emit('log', a),
    info: (...a) => emit('info', a),
    warn: (...a) => emit('warn', a),
    error: (...a) => emit('error', a),
  };
};

export const logger = createLogger('Nexora');

// Performance marks
const perfMarks = new Map();
export function mark(name){ perfMarks.set(name, performance.now()); }
export function measure(name, start){
  if(!perfMarks.has(start)) return null;
  const dur = performance.now() - perfMarks.get(start);
  logger.debug('perf', name, dur.toFixed(2)+'ms');
  return dur;
}

// Sync queue stub (offline-first roadmap)
export class SyncQueue {
  constructor(){ this.items=[]; }
  enqueue(type, payload){ const item={ id:'sq_'+Date.now()+Math.random().toString(36).slice(2), ts:Date.now(), type, payload, tries:0 }; this.items.push(item); logger.info('sync_enqueue', type, item.id); return item; }
  list(){ return [...this.items]; }
  markDone(id){ this.items = this.items.filter(i=>i.id!==id); }
}
export const globalSyncQueue = new SyncQueue();

export async function loadSyncQueue(loadFn){
  try { const raw = await loadFn('nx_sync_queue'); if(raw && Array.isArray(raw)) { globalSyncQueue.items = raw; logger.info('sync_queue_loaded', raw.length); } } catch {}
}
export async function persistSyncQueue(saveFn){
  try { await saveFn('nx_sync_queue', globalSyncQueue.items); } catch {}
}
