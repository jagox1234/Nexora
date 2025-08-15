// Basic tests for LocationProvider logic (permission flow & staleness)
import { React } from '../Nexora v2/app/baseDependencies.js';
jest.mock('expo-location');
import { render, act } from '@testing-library/react-native';
import { LocationProvider, useLocation } from '../Nexora v2/providers/location.js';

// time control
const mockDateNow = Date.now;
let timeCursor = mockDateNow();
global.Date.now = () => timeCursor;

function HookReader({ cb }) { const loc = useLocation(); cb(loc); return null; }

describe('LocationProvider', () => {
  test('requests current position and sets data', async () => {
    let latest;
    render(<LocationProvider config={{ simpleTestMode:true, disableAdaptiveWatch:true }}><HookReader cb={l => latest = l} /></LocationProvider>);
    await act(async () => { await latest.getCurrent(); });
    expect(latest.status).toBe('granted');
    expect(latest.position?.coords.latitude).toBe(10);
    expect(latest.address?.city).toBe('TestCity');
  });

  test('stale flag false immediately after update', async () => {
    let latest;
    render(<LocationProvider config={{ simpleTestMode:true, disableAdaptiveWatch:true }}><HookReader cb={l => latest = l} /></LocationProvider>);
    await act(async () => { await latest.getCurrent(); });
    expect(latest.isStale).toBe(false);
  });

  test('single attempt simpleTestMode sets attempts=1 and no errors', async () => {
    let latest;
    render(<LocationProvider config={{ simpleTestMode:true, disableAdaptiveWatch:true }}><HookReader cb={l => latest = l} /></LocationProvider>);
    await act(async () => { await latest.getCurrent(); });
    expect(latest.attempts).toBe(1);
    expect(latest.errorCount).toBe(0);
  });

  test('watch start/stop', async () => {
    let latest;
    render(<LocationProvider config={{ simpleTestMode:true, disableAdaptiveWatch:true }}><HookReader cb={l => latest = l} /></LocationProvider>);
    await act(async () => { await latest.watch(); });
    expect(latest.isWatching).toBe(true);
    await act(async () => { latest.stopWatch(); });
    expect(latest.isWatching).toBe(false);
  const expoLocation = require('expo-location');
  const removeFn = expoLocation.__getRemove ? expoLocation.__getRemove() : null;
  if(removeFn) expect(removeFn).toHaveBeenCalled();
  });

  test('stale after 5 minutes', async () => {
    let latest;
    render(<LocationProvider config={{ simpleTestMode:true, disableAdaptiveWatch:true, staleAfterMs: 5*60*1000 }}><HookReader cb={l => latest = l} /></LocationProvider>);
    await act(async () => { await latest.getCurrent(); });
    expect(latest.isStale).toBe(false);
    // advance 6 minutes
    timeCursor += 6 * 60 * 1000;
    await act(async () => { latest.forceRender(); });
    expect(latest.isStale).toBe(true);
  });
});

afterAll(() => { global.Date.now = mockDateNow; });
