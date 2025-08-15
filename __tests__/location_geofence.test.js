// Tests for pure geofence logic (v2)
import { haversineMeters, evaluateGeofenceTransition } from '@v2/core/locationLogic.js';

describe('location/geofence logic', () => {
  test('haversineMeters returns ~0 for identical points', () => {
    const a = { lat:40.4168, lng:-3.7038 };
    expect(haversineMeters(a,a)).toBeCloseTo(0, 5);
  });

  test('haversineMeters distance Madrid -> Barcelona ~504km (±5km)', () => {
    const mad = { lat:40.4168, lng:-3.7038 };
    const bcn = { lat:41.3874, lng:2.1686 };
    const d = haversineMeters(mad,bcn) / 1000; // km
    expect(d).toBeGreaterThan(499);
    expect(d).toBeLessThan(509);
  });

  test('evaluateGeofenceTransition enter then exit sequence', () => {
    const center = { lat:40.0, lng: -3.0 };
    const radius = 100; // meters
    // point just outside
    let r1 = evaluateGeofenceTransition({ prevInside:false, point:{ lat:40.0009, lng:-3.0 }, center, radius });
    // 0.0009 deg lat ~ 100m so may be borderline; ensure we treat > radius as outside by pushing a bit more
    r1 = evaluateGeofenceTransition({ prevInside:false, point:{ lat:40.001, lng:-3.0 }, center, radius });
    expect(r1.inside).toBe(false);
    expect(r1.transition).toBe(null);
    // move inside
    const r2 = evaluateGeofenceTransition({ prevInside:false, point:{ lat:40.0002, lng:-3.0 }, center, radius });
    expect(r2.inside).toBe(true);
    expect(r2.transition).toBe('enter');
    // stay inside
    const r3 = evaluateGeofenceTransition({ prevInside:true, point:{ lat:40.00015, lng:-3.0 }, center, radius });
    expect(r3.transition).toBe(null);
    // exit
    const r4 = evaluateGeofenceTransition({ prevInside:true, point:{ lat:40.002, lng:-3.0 }, center, radius });
    expect(r4.inside).toBe(false);
    expect(r4.transition).toBe('exit');
  });
});
