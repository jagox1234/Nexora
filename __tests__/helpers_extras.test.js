import { bookingOverlaps, minutesBetween } from '@v2/core/logic.js';
import { formatTimeRange } from '@v2/core/utils.js';

describe('helpers_extras', () => {
  test('minutesBetween computes correct diff', () => {
    const a = new Date('2024-01-01T10:00:00Z').toISOString();
    const b = new Date('2024-01-01T11:30:00Z').toISOString();
    expect(minutesBetween(a,b)).toBe(90);
  });

  test('formatTimeRange formats window', () => {
    const start = new Date(); start.setHours(9,15,0,0);
    const iso = start.toISOString();
    const s = formatTimeRange(iso, 45);
    expect(s).toMatch(/09:15/);
    expect(s).toMatch(/10:00|10:0/);
  });

  test('bookingOverlaps respects cancellation ignoring cancelled existing', () => {
    const dur = () => 30;
    const base = new Date(); base.setMinutes(0,0,0);
    const t1 = base.toISOString();
    const existing=[{ id:'b1', serviceId:'s1', startsAt:t1, status:'cancelled' }];
    const next={ id:'b2', serviceId:'s1', startsAt:t1 };
    const over = bookingOverlaps(existing, next, dur);
    // cancelled should not cause overlap
    expect(over).toBe(false);
  });
});
