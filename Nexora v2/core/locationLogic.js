// v2/core/locationLogic.js — pure geofence/location helpers for testing
// Haversine distance in meters between two { lat, lng }
export function haversineMeters(a, b) {
  if(!a||!b) return null;
  const R = 6371000; // meters
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Evaluate a single geofence transition.
// Args: prevInside (boolean), point {lat,lng}, center {lat,lng}, radius (meters)
// Returns: { inside:boolean, transition: 'enter'|'exit'|null }
export function evaluateGeofenceTransition({ prevInside, point, center, radius }) {
  if(!point || !center || !radius) return { inside:false, transition: prevInside? 'exit': null };
  const d = haversineMeters(point, center);
  const inside = d != null && d <= radius;
  let transition = null;
  if(prevInside !== inside) transition = inside ? 'enter' : 'exit';
  return { inside, transition };
}

export default { haversineMeters, evaluateGeofenceTransition };
