import { render, act } from '@testing-library/react-native';
import * as expoLocation from 'expo-location';

import React from 'react';
import { LocationProvider, useLocation } from '../Nexora v2/providers/location.js';

let mockCurrentPosition = { coords:{ latitude:40.0, longitude:-3.7 }, timestamp:Date.now() };
expoLocation.getCurrentPositionAsync.mockImplementation(async () => mockCurrentPosition);
// intercept watchPositionAsync to update cb usage
let _origWatch = expoLocation.watchPositionAsync;
expoLocation.watchPositionAsync.mockImplementation(async (opts, cb) => {
  const res = await _origWatch(opts, cb); // original already calls cb once
  return res;
});

function HookReader({ cb }) { const loc = useLocation(); cb(loc); return null; }

describe('Geofence logic', () => {
  test('inside and outside geofence detection', async () => {
    let latest;
    render(<LocationProvider config={{ geofenceCenter:{ lat:40.0, lng:-3.7 }, geofenceRadiusMeters:100 }}><HookReader cb={l => latest = l} /></LocationProvider>);
    await act(async () => { await latest.getCurrent(); });
    expect(latest.isInsideGeofence).toBe(true);
    // Move far outside by injecting synthetic position (test helper)
  await act(async () => { latest.injectPosition({ latitude:41.0, longitude:-3.7 }); });
    expect(latest.isInsideGeofence).toBe(false);
  });
});
