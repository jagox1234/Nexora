// Drain sync queue demo
import { globalSyncQueue, logger } from '../Nexora v2/core/utils.js';

for (let i=0;i<3;i++) globalSyncQueue.enqueue('demo_event', { n:i });
logger.info('queue_length', globalSyncQueue.list().length);
// Simulate drain
for (const item of globalSyncQueue.list()) {
  logger.info('drain_item', item.id);
  globalSyncQueue.markDone(item.id);
}
logger.info('queue_length_after', globalSyncQueue.list().length);
