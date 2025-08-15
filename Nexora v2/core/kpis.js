// v2/core/kpis.js — KPI calculations centralized
// Provides pure helper functions for dashboard analytics so they can be unit tested.

// Helper to compute minutes from HH:MM strings
function minutesBetweenClock(a,b){
  const [ah,am]=a.split(':').map(Number); const [bh,bm]=b.split(':').map(Number);
  return (bh*60+bm) - (ah*60+am);
}

export function computeOpeningPotentialMinutes(openingRanges){
  if(!Array.isArray(openingRanges)) return 0;
  return openingRanges.reduce((acc,r)=>{ if(!r||!r.includes('-')) return acc; const [a,b]=r.split('-'); return acc + minutesBetweenClock(a,b); },0);
}

export function averageServiceDuration(services){
  const active = (services||[]).filter(s=> s && s.active !== false);
  if(!active.length) return 30; // fallback heuristic
  return Math.round(active.reduce((a,s)=> a + (s.durationMin || 30),0)/active.length);
}

export function computeAvailabilityMinutes(availForDay){
  // availability ranges already normalized like HH:MM-HH:MM
  return (availForDay||[]).reduce((acc,a)=> acc + (a.ranges||[]).reduce((m,r)=>{ if(!r.includes('-')) return m; const [x,y]=r.split('-'); return m + minutesBetweenClock(x,y); },0),0);
}

export function computeFillRate({ bookings, services, openingRanges, availabilityForDay }){
  // If staff availability present, prefer it for potential capacity, else opening hours heuristic.
  const avgDur = averageServiceDuration(services);
  const potentialMinutes = availabilityForDay && availabilityForDay.length
    ? computeAvailabilityMinutes(availabilityForDay)
    : computeOpeningPotentialMinutes(openingRanges);
  const potentialSlots = Math.max(1, Math.floor(potentialMinutes / avgDur));
  const confirmed = (bookings||[]).filter(b=> b.status==='confirmed');
  return Math.min(100, Math.round((confirmed.length / potentialSlots)*100));
}

export function computeConversionRate(requests){
  const total = (requests||[]).length; if(!total) return { conversions:0, conversionRate:0 };
  const conversions = requests.filter(r=> r.status==='converted').length;
  return { conversions, conversionRate: Math.round((conversions/total)*100) };
}

export function computeStaffUtilization({ bookings, availabilityForDay, services, staffId }){
  // naive: confirmed booking minutes for staff / staff availability minutes
  const avMinutes = computeAvailabilityMinutes(availabilityForDay);
  if(!avMinutes) return 0;
  const svcMap = new Map((services||[]).map(s=> [s.id, s]));
  const minutesBooked = (bookings||[]).filter(b=> b.status==='confirmed' && (!staffId || b.staffId===staffId)).reduce((acc,b)=>{
    const srv = svcMap.get(b.serviceId); return acc + (srv?.durationMin||30);
  },0);
  return Math.min(100, Math.round((minutesBooked / avMinutes)*100));
}

export function computeAllKpis({ date, bookings, services, requests, openingHours, availabilityForDay }){
  const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date(date).getDay()];
  const openingRanges = openingHours?.[dayKey] || [];
  const todays = (bookings||[]).filter(b=> new Date(b.startsAt).toDateString() === new Date(date).toDateString());
  const confirmedToday = todays.filter(b=> b.status==='confirmed');
  const pendingToday = todays.filter(b=> b.status==='pending');
  const cancelledToday = todays.filter(b=> b.status==='cancelled');
  const activeServices = (services||[]).filter(s=> s?.active !== false);
  const { conversions, conversionRate } = computeConversionRate(requests);
  const fillRate = computeFillRate({ bookings: todays, services, openingRanges, availabilityForDay });
  return {
    today: todays.length,
    confirmedToday: confirmedToday.length,
    pendingToday: pendingToday.length,
    cancelledToday: cancelledToday.length,
    services: activeServices.length,
    requests: (requests||[]).length,
    conversions, conversionRate, fillRate,
  };
}

export default {
  computeOpeningPotentialMinutes,
  averageServiceDuration,
  computeAvailabilityMinutes,
  computeFillRate,
  computeConversionRate,
  computeStaffUtilization,
  computeAllKpis,
};
