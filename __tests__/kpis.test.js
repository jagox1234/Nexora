// KPI helper tests
import { computeOpeningPotentialMinutes, averageServiceDuration, computeFillRate, computeConversionRate, computeStaffUtilization, computeAllKpis } from '@v2/core/kpis.js';

describe('kpis helpers', () => {
  test('opening potential minutes sums ranges', () => {
    expect(computeOpeningPotentialMinutes(['09:00-10:00','10:30-12:00'])).toBe(60 + 90);
  });
  test('averageServiceDuration fallback & average', () => {
    expect(averageServiceDuration([])).toBe(30);
    expect(averageServiceDuration([{ durationMin:20, active:true }, { durationMin:40, active:true }])).toBe(30);
  });
  test('conversion rate basic', () => {
    const { conversions, conversionRate } = computeConversionRate([{ status:'converted' }, { status:'pending' }]);
    expect(conversions).toBe(1); expect(conversionRate).toBe(50);
  });
  test('fill rate uses availability when provided', () => {
    const bookings = [{ status:'confirmed' }, { status:'pending' }];
    const services = [{ id:'s1', durationMin:30, active:true }];
    const fill = computeFillRate({ bookings, services, openingRanges:['09:00-17:00'], availabilityForDay:[{ ranges:['09:00-10:00'] }] });
    // availability 60m, avg 30 => 2 slots => confirmed=1 => 50%
    expect(fill).toBe(50);
  });
  test('staff utilization aggregates confirmed minutes', () => {
    const services = [{ id:'s1', durationMin:30 }];
    const bookings = [{ status:'confirmed', serviceId:'s1', staffId:'st1' }];
    const util = computeStaffUtilization({ bookings, availabilityForDay:[{ staffId:'st1', ranges:['09:00-10:00'] }], services, staffId:'st1' });
    expect(util).toBe(50); // 30m / 60m
  });
  test('computeAllKpis returns expected keys', () => {
    const out = computeAllKpis({ date:new Date(), bookings:[], services:[], requests:[], openingHours:{ mon:['09:00-10:00'] }, availabilityForDay:[] });
    expect(out).toHaveProperty('today');
    expect(out).toHaveProperty('fillRate');
  });
});
