# Changelog

All notable changes to this project will be documented in this file. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and Semantic Versioning once versions are tagged.

## [Unreleased]
### Added
- v2 arquitectura establecida bajo `Nexora v2/`.
- Logger básico (`createLogger`, `logger`, performance `mark/measure`).
- SyncQueue stub (`globalSyncQueue`).
- Diagrama arquitectura (Mermaid) en README.
- Tests edge adicionales (overlap exact boundary, excludeId, migración idempotente, prepend servicio).
- Accesibilidad sección en README.
- CHANGELOG inicial.
 - Stricter TS flags (noImplicitOverride, noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.).
 - Performance marks on service add & booking create.
 - SyncQueue events on service/booking mutations.
 - Accessibility props (role, min size, labels) on Button.
 - Modal a11y (dialog role, labels), Toast live region polite.
 - SyncQueue persistence (AsyncStorage) + auto-save effect.
 - Sync worker stub (`sync.js`) with backoff + configurable transport.
 - Cold start performance marks (app_boot/app_boot_duration).

### Changed
- ErrorBoundary ahora usa `logger.error`.
 - AppProvider mutaciones enriquecidas con métricas y sync enqueue.

### Deprecated
- Carpeta legacy `Nexora/` (pendiente eliminación completa histórica ya no usada por imports activos).

### Removed
- (pendiente) Archivos numéricos legacy tras confirmación.

### Fixed
- Import order warning en tests (ajuste menor).

### Security
- N/A

---
## Histórico previo (pre-CHANGELOG)
- Migración manual previa descrita en README (Agosto 2025).
