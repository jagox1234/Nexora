# Backend Sync Diseño (Borrador)

## Objetivos
1. Mantener estado local siempre usable offline.
2. Sincronizar mutaciones (services, clients, bookings, clientRequests) de forma eventual con backend.
3. Resolver conflictos determinísticamente.

## Modelo de Datos Resumido
- Service: { id, name, price, durationMin, active, updatedAt }
- Client: { id, name, phone, updatedAt }
- Booking: { id, serviceId, clientId, startsAt, status, source, createdAt, updatedAt }
- ClientRequest: { id, ... campos ..., status, updatedAt }

## Cola Offline
Cada acción genera un item en `globalSyncQueue`: { id, type, payload, ts, tries }.
Tipos iniciales:
- service_added / service_removed
- booking_created / booking_confirmed / booking_cancelled
- client_upserted
- client_request_added / client_request_removed

## Transporte
`configureSync({ transport })` inyecta función:
```js
async function transport(item){
  switch(item.type){
    case 'service_added': await post('/services', item.payload); break;
    case 'booking_created': await post('/bookings', item.payload); break;
    // ... resto
  }
}
```

## Conflictos
Estrategia simple inicial: last-write-wins (comparar updatedAt). Para bookings con solape backend puede devolver 409 -> app marca item para retry modificando startsAt o cancela item.

## Reintentos
Exponencial simplificado: tries => delay = base * 2^tries (controlado externamente si se desea). Actual worker repite cada 4s; futuro: mover a agenda dinámica por item.

## Estados de Item
- pending (default)
- sending (transient en memoria)
- dropped (tries > 5) -> se elimina

## Futuro
- Integrar detección de network (NetInfo) para pausar/resumir.
- Delta sync inicial: descargar snapshot y reconciliar por id comparando updatedAt.
- Compresión de cola (fold): si existe booking_created y luego booking_cancelled sin haber salido, colapsar en no-op.

Actualizado: 2025-08-15
