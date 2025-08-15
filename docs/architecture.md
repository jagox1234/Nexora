# Arquitectura Nexora v2

## Capas Principales
1. App Shell (`App.js`): Monta providers y navegación. Capa más externa.
2. Providers: Theme, App (estado dominio), Modal, Toast, ErrorBoundary.
3. Navigation: Stacks + Tabs (roles). Aíslan routing de pantallas.
4. Screens: Componen UI + acciones del dominio.
5. UI Components: Atomos/moléculas reutilizables, sin lógica de negocio.
6. Core Domain: Funciones puras (services, clients, bookings, helpers, logic, persistence, i18n).
7. Persistence: AsyncStorage + migraciones (idempotentes, secuenciales).
8. Infra futura: Backend sync (cola offline, reconciliación, strategy pluggable).

## Flujo de Datos
- Actions (ej. addService) viven en `AppProvider` y usan funciones puras del core.
- El estado (arrays services/clients/bookings/clientRequests) se persiste tras mutación mediante un `persist()` central (no mostrado aquí) que serializa a AsyncStorage.
- Migraciones se ejecutan en inicialización; si la versión almacenada < `SCHEMA_VERSION` se aplican funciones de `migrations` ordenadamente.

## Convenciones
- Funciones puras terminan en `Fn` o se nombran `makeX` para constructores.
- No se muta el array original; se retornan nuevos arrays/objetos.
- Tests deben cubrir: creación, actualización, eliminación, validaciones edge, migraciones idempotentes.

## Errores & Logging (roadmap)
- `ErrorBoundary` captura fallos de render en UI.
- Próximo: `logger.ts` (o .js) con niveles (debug/info/warn/error) y adaptador a consola + reporter remoto.

## Sincronización Futura
- Cola offline (append-only) de intents: { id, type, payload, ts }.
- Worker secuencial que intenta enviar; backoff exponencial; en caso de conflicto aplica estrategia (last-write-wins / merge).

## Métricas Potenciales
- Tiempos de render inicial (App ready).
- Latencia de persistence read/write.
- Conteo de toasts/errores.

## Diagrama Referencia
Ver diagrama Mermaid en README principal.

## Extensiones Futuras
- Multi-tenant: añadir `tenantId` a entidades.
- Timezones robustos: normalizar internamente a UTC y mostrar local.
- Feature flags: objeto simple en AsyncStorage + remote fetch.

---
Última actualización: 2025-08-15
