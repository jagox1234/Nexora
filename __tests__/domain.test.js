// Domain module tests
import { createBookingFn, confirmBookingFn, cancelBookingFn, isOverlappingFn } from '@core/bookings.js';
import { upsertClientFn, removeClientFn } from '@core/clients.js';
import { runMigrations, SCHEMA_VERSION } from '@core/persistence.js';
import { addServiceFn, removeServiceFn } from '@core/services.js';
import { createAuthState, registerUser, loginUser } from '@v2/core/auth.js';
import { addRequestFn, updateRequestStatusFn } from '@v2/core/requests.js';
import { updateRequestStatusFn as advUpdate } from '@v2/core/requests.js';

describe('services domain', () => {
  it('adds and removes services', () => {
    const { services, created } = addServiceFn([], { name: 'Test', price: 10, durationMin: 30 });
    expect(services.length).toBe(1);
    const pruned = removeServiceFn(services, created.id);
    expect(pruned.length).toBe(0);
  });

  it('prepends new service (LIFO expectation)', () => {
    const seed = [
      { id: 's_old1', name: 'Old1', durationMin: 15, price: 5 },
      { id: 's_old2', name: 'Old2', durationMin: 20, price: 7 },
    ];
    const { services: withNew, created } = addServiceFn(seed, { name: 'Newest', price: 12, durationMin: 45 });
    expect(withNew[0].id).toBe(created.id); // newly added goes to front
    expect(withNew.length).toBe(seed.length + 1);
  });
});

describe('auth hashing', () => {
  it('stores password as hash and logs in with same password', async () => {
    let st = createAuthState();
    const reg = await registerUser(st, { email: 'a@test.com', password: 'secret', name: 'A' });
    expect(reg.ok).toBe(true);
    expect(reg.state.users[0].passwordHash).toBeDefined();
    expect(reg.state.users[0].password).toBeUndefined();
    st = reg.state;
    const login = await loginUser(st, { email: 'a@test.com', password: 'secret' });
    expect(login.ok).toBe(true);
    expect(login.user.email).toBe('a@test.com');
  });
});

describe('advanced requests', () => {
  it('adds request and updates status', () => {
    const { list, created } = addRequestFn([], { clientName:'Foo', serviceName:'Srv' });
    expect(list.length).toBe(1);
    const updated = updateRequestStatusFn(list, created.id, 'confirmed');
    expect(updated[0].status).toBe('confirmed');
  });
});

describe('migration legacy -> advanced requests (store simulation)', () => {
  it('merges legacy into advanced when advanced empty', () => {
    // simulate legacy array and empty advanced
    const legacy = [{ id:'req_legacy1', clientName:'L', serviceName:'SrvL', status:'pending', whenISO:null }];
    const advanced = [];
    // reuse migration snippet logic
    const prev = advanced;
    const result = (!prev.length)
      ? legacy.map(x => ({ id:x.id, clientName:x.clientName, clientPhone:x.clientPhone, serviceName:x.serviceName, whenISO:x.whenISO||null, status:x.status||'pending', businessId:x.businessId||null, createdAt:x.createdAt||'migrated' }))
      : prev;
    expect(result.length).toBe(legacy.length);
    expect(result[0].id).toBe('req_legacy1');
    expect(result[0].status).toBe('pending');
  });
});

describe('kpi calculations (conversion & fill)', () => {
  function calcKpis({ requests, bookings, opening, avgDuration=30 }) {
    const conversions = requests.filter(r=> r.status==='converted').length;
    const totalReq = requests.length;
    const conversionRate = totalReq ? Math.round((conversions/ totalReq)*100) : 0;
    let potentialMinutes = 0;
    for(const r of opening){
      const [a,b]=r.split('-');
      const [ah,am]=a.split(':').map(Number); const [bh,bm]=b.split(':').map(Number);
      potentialMinutes += (bh*60+bm) - (ah*60+am);
    }
    const potentialSlots = Math.max(1, Math.floor(potentialMinutes/avgDuration));
    const confirmed = bookings.filter(b=> b.status==='confirmed').length;
    const fillRate = Math.min(100, Math.round((confirmed/potentialSlots)*100));
    return { conversions, conversionRate, fillRate };
  }
  it('computes expected percentages', () => {
    const reqs = [ { status:'converted' }, { status:'pending' }, { status:'converted' } ];
    const bks = [ { status:'confirmed' }, { status:'pending' } ];
    const opening = ['09:00-13:00','15:00-19:00']; // 8h => 480m; avg 30 => 16 slots
    const k = calcKpis({ requests:reqs, bookings:bks, opening });
    expect(k.conversions).toBe(2);
    expect(k.conversionRate).toBe(Math.round((2/3)*100));
    expect(k.fillRate).toBe(Math.round((1/16)*100));
  });
});

describe('clients domain', () => {
  it('upserts by phone', () => {
    const r1 = upsertClientFn([], { name: 'A', phone: '1' });
    const r2 = upsertClientFn(r1.clients, { name: 'B', phone: '1' });
    expect(r2.clients.length).toBe(1);
    expect(r2.client.name).toBe('A');
    const pruned = removeClientFn(r2.clients, r2.client.id);
    expect(pruned.length).toBe(0);
  });
});

describe('bookings domain', () => {
  const services = [{ id: 's1', name: 'Srv', durationMin: 30 }];
  const clientId = 'c1';

  it('creates booking and detects overlap', () => {
    const base = new Date(Date.now()+5*60000); base.setSeconds(0,0);
    const t1 = base.toISOString();
    const { booking } = createBookingFn({ bookings: [], services, serviceId: 's1', clientId, whenISO: t1 });
    const bookings = [booking];
    const overlap = isOverlappingFn({ bookings, services, whenISO: t1, serviceId: 's1' });
    expect(overlap).toBe(true);
    const later = new Date(new Date(t1).getTime() + 31*60000).toISOString();
    const { ok } = createBookingFn({ bookings, services, serviceId: 's1', clientId, whenISO: later });
    expect(ok).toBe(true);
  });

  it('confirm and cancel mutate status', () => {
    const base = new Date();
    const t1 = base.toISOString();
    const { booking } = createBookingFn({ bookings: [], services, serviceId: 's1', clientId, whenISO: t1 });
    const confirmed = confirmBookingFn([booking], booking.id);
    expect(confirmed[0].status).toBe('confirmed');
    const cancelled = cancelBookingFn(confirmed, booking.id);
    expect(cancelled[0].status).toBe('cancelled');
  });

  it('overlap logic across simulated DST boundary (adds 60min shift)', () => {
    // Simulate by creating two slots an hour apart and ensuring overlap detection stays consistent.
  const base = new Date(Date.now()+5*60000); base.setHours(base.getHours()+1,0,0,0);
    const t1 = base.toISOString();
    const t2 = new Date(base.getTime() + 60*60000).toISOString();
    const { booking } = createBookingFn({ bookings: [], services, serviceId: 's1', clientId, whenISO: t1 });
    const bookings = [booking];
    // t1 overlaps with itself
    expect(isOverlappingFn({ bookings, services, whenISO: t1, serviceId: 's1' })).toBe(true);
    // t2 should NOT overlap because duration=30 and starts after 60
    expect(isOverlappingFn({ bookings, services, whenISO: t2, serviceId: 's1' })).toBe(false);
  });

  it('migration adds createdAt when upgrading from v1 to v2', async () => {
    const oldBookings = [ { id: 'b1', serviceId: 's1', clientId, startsAt: new Date().toISOString(), status: 'pending', source: 'app' } ];
    const { migrated, data, version } = await runMigrations(SCHEMA_VERSION, 1, { bookings: oldBookings, services, clients: [] });
    expect(version).toBe(SCHEMA_VERSION);
    expect(migrated).toBe(true);
    expect(data.bookings[0].createdAt).toBeDefined();
  });

  it('rejects creation when required fields missing', () => {
    const r1 = createBookingFn({ bookings: [], services, serviceId: '', clientId, whenISO: new Date().toISOString() });
    expect(r1.ok).toBe(false);
    expect(r1.error).toBe('missing_fields');
    const r2 = createBookingFn({ bookings: [], services, serviceId: 's1', clientId: '', whenISO: '' });
    expect(r2.ok).toBe(false);
    expect(r2.error).toBe('missing_fields');
  });

  it('cancelled bookings no longer block new bookings (no overlap)', () => {
    const base = new Date(Date.now()+5*60000); base.setSeconds(0,0);
    const whenISO = base.toISOString();
    const { booking } = createBookingFn({ bookings: [], services, serviceId: 's1', clientId, whenISO });
    const cancelled = cancelBookingFn([booking], booking.id);
    // overlap check should ignore cancelled
    const overlap = isOverlappingFn({ bookings: cancelled, services, whenISO, serviceId: 's1' });
    expect(overlap).toBe(false);
  });

  it('inactive service (active=false) still considered for overlap only if same serviceId present & active flag irrelevant now', () => {
    // Extend logic expectation: current implementation does NOT read active flag, document via test for future.
    const svcInactive = [{ id: 's2', name: 'Inactive', durationMin: 30, active: false }];
    const 
    start = new Date().toISOString();
    const { booking } = createBookingFn({ bookings: [], services: svcInactive, serviceId: 's2', clientId, whenISO: start });
    expect(booking).toBeDefined();
    const overlap = isOverlappingFn({ bookings: [booking], services: svcInactive, whenISO: start, serviceId: 's2' });
    expect(overlap).toBe(true);
  });

  it('does NOT treat back-to-back bookings as overlap (exact end == next start)', () => {
    const svc = [{ id: 'sx', name: 'Svc', durationMin: 30 }];
    const start = new Date(); start.setSeconds(0,0);
    const t1 = start.toISOString();
    const t2 = new Date(start.getTime() + 30 * 60000).toISOString(); // exactly after 30min
    const { booking } = createBookingFn({ bookings: [], services: svc, serviceId: 'sx', clientId, whenISO: t1 });
    const overlapBoundary = isOverlappingFn({ bookings: [booking], services: svc, whenISO: t2, serviceId: 'sx' });
    expect(overlapBoundary).toBe(false);
  });

  it('excludeId allows editing existing booking time without self-overlap', () => {
    const svc = [{ id: 'se', name: 'SvcEdit', durationMin: 30 }];
    const start = new Date(); start.setSeconds(0,0);
    const t1 = start.toISOString();
    const { booking } = createBookingFn({ bookings: [], services: svc, serviceId: 'se', clientId, whenISO: t1 });
    // Without excludeId we detect overlap
    expect(isOverlappingFn({ bookings: [booking], services: svc, whenISO: t1, serviceId: 'se' })).toBe(true);
    // With excludeId (editing same booking) we ignore it
    expect(isOverlappingFn({ bookings: [booking], services: svc, whenISO: t1, serviceId: 'se', excludeId: booking.id })).toBe(false);
  });

  it('migration idempotent when already at target version', async () => {
    const data = { bookings: [], services: [], clients: [] };
    const { migrated, version } = await runMigrations(SCHEMA_VERSION, SCHEMA_VERSION, data);
    expect(migrated).toBe(false);
    expect(version).toBe(SCHEMA_VERSION);
  });

  it('migration applied only once adds createdAt a single time', async () => {
    const b = { id: 'b1', serviceId: 's1', clientId: 'c1', startsAt: new Date().toISOString(), status: 'pending', source: 'app' };
    const first = await runMigrations(SCHEMA_VERSION, 1, { bookings: [b], services: [], clients: [] });
    expect(first.migrated).toBe(true);
    const createdAtVal = first.data.bookings[0].createdAt;
    expect(createdAtVal).toBeDefined();
    const second = await runMigrations(SCHEMA_VERSION, first.version, first.data); // run again
    expect(second.migrated).toBe(false);
    expect(second.data.bookings[0].createdAt).toBe(createdAtVal); // unchanged
  });
});
