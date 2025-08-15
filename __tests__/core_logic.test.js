// Updated to v2 core: using generateSlotsForDay + bookingOverlaps pattern
import { createBookingFn } from '@core/bookings.js';
import { generateSlotsForDay } from '@core/helpers.js';
import { bookingOverlaps } from '@core/logic.js';

describe('core_logic (v2)', () => {
  test('generateSlotsForDay generates slots within ranges respecting duration', () => {
    const clinic = { openingHours: { mon:["10:00-12:00" ] } };
    const monday = new Date();
    while(monday.getDay()!==1) monday.setDate(monday.getDate()+1);
    const services=[{ id:'svc', durationMin:60 }];
    const slots = generateSlotsForDay({ clinic, bookings: [], services, date: monday, serviceId: 'svc' });
    expect(slots.length).toBeGreaterThan(0);
    const first = new Date(slots[0]);
    expect(first.getHours()).toBe(10);
    expect(slots.some(s => new Date(s).getHours() === 11)).toBe(true); // last possible start 11:00
  });

  test('bookingOverlaps detects overlap correctly', () => {
    const services=[{id:'s1', durationMin:60}];
    const durationGet = (id) => services.find(s => s.id===id)?.durationMin || 0;
    const b1Start=new Date(); b1Start.setMinutes(0,0,0);
    const booking1 = { id:'b1', serviceId:'s1', startsAt:b1Start.toISOString(), status:'pending' };
    const overlap = bookingOverlaps([booking1], { serviceId:'s1', startsAt: booking1.startsAt }, durationGet);
    expect(overlap).toBe(true);
    const nonOverlapStart = new Date(b1Start.getTime()+60*60*1000).toISOString();
    expect(bookingOverlaps([booking1], { serviceId:'s1', startsAt: nonOverlapStart }, durationGet)).toBe(false);
  });

  test('createBookingFn coupled with overlap logic enforces no double booking', () => {
    const services=[{id:'s1', durationMin:30}];
  const now=new Date(); now.setMinutes(now.getMinutes()+5,0,0); // ensure future time
  const res = createBookingFn({ bookings: [], services, serviceId:'s1', clientId:'c1', whenISO: now.toISOString() });
    expect(res.ok).toBe(true);
    const res2 = createBookingFn({ bookings: [res.booking], services, serviceId:'s1', clientId:'c2', whenISO: now.toISOString() });
    expect(res2.ok).toBe(false);
    expect(res2.error).toBe('overlap');
  });
});
