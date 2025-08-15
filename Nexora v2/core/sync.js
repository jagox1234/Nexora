// v2/core/sync.js — sync worker stub with backoff & pluggable transport
import { globalSyncQueue, logger } from './utils.js';

let transportFn = async (item) => { logger.info('sync_transport_noop', item.id); };
let isOnlineFn = () => true; // placeholder for future NetInfo

export function configureSync({ transport, isOnline }) {
  if (transport) transportFn = transport;
  if (isOnline) isOnlineFn = isOnline;
}

export async function processNextSyncItem() {
  if (!isOnlineFn()) return false;
  const [item] = globalSyncQueue.list();
  if (!item) return false;
  try {
    await transportFn(item);
    globalSyncQueue.markDone(item.id);
    logger.info('sync_sent', item.id);
  } catch (e) {
    item.tries = (item.tries || 0) + 1;
    logger.warn('sync_retry', item.id, 'tries', item.tries, e?.message);
    if (item.tries > 5) {
      logger.error('sync_drop', item.id);
      globalSyncQueue.markDone(item.id);
    }
  }
  return true;
}

let workerRunning = false;
export function startSyncWorker({ intervalMs = 4000 } = {}) {
  if (workerRunning) return;
  workerRunning = true;
  const loop = async () => {
    try { await processNextSyncItem(); } catch {}
    setTimeout(loop, intervalMs);
  };
  loop();
  logger.info('sync_worker_started', intervalMs);
}
