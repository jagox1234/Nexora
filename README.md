## Nexora (Expo / React Native)

Aplicación móvil (Android / iOS) con soporte web de desarrollo. Stack: Expo SDK 53 · React 19 · React Native 0.79.5.

### 🔍 Visión General
Nexora gestiona agenda de servicios, clientes y reservas para negocios y modo cliente con solicitudes (waitlist / petición de hora). Todo opera offline primero con persistencia local y esquema versionado.

### ✅ Principales Características
- Roles (cliente / negocio) persistidos (`nx_role`).
- Servicios, clientes y reservas con validación de solapes y migraciones de datos.
- Agenda multiday + filtros servicio / cliente.
- Inbox para convertir solicitudes en reservas.
- Explorar negocios (demo/mock) y unirse a lista de espera o solicitar hora.
- Theme claro/oscuro persistente.
- GPS avanzado: permiso bajo demanda, posición actual, modo watch, reverse geocode cache con TTL, staleness (5m), reintentos con backoff, métricas de errores.
- Geocerca configurable: definir centro (posición actual) y radio, distancia en tiempo real, estado dentro/fuera, persistencia local.
- i18n (en / es) con persistencia de locale (`nx_locale`).
- Sistema propio: toasts, modales, picker de fecha/hora.
- Tests de lógica y migraciones con Jest.
- CI (GitHub Actions) ejecuta lint + tests en cada push/PR.

### 🗂 Arquitectura / Estructura (v2)
```
App.js
Nexora/                    # Legacy (quedan sólo shims DEPRECATED hasta eliminación completa)
	1_app_main.js            # Monta providers usando @v2
	2_dependencies.js        # Dependencias comunes
	screens/                 # Aún presentes pero apuntan a v2 (transición)
Nexora v2/
	app/
		navigation/            # AppNavigation + tabs (BusinessTabs / ClientTabs)
		AppProvider.js         # Providers composition
	core/                    # Estado, dominio, persistencia, i18n, helpers puros
	ui/                      # Componentes UI, theme, modal, toast, header, icons
	screens/                 # Pantallas reales (Dashboard, Services, Agenda, etc.)
	index.js                 # Barrel público (@v2/*)
__tests__/                 # Pruebas Jest
```

> Nota: Alias actualizados para que `@screens/*` y `@nav/*` apunten a `Nexora v2`. Los archivos numéricos `5_*` quedan como stubs y se eliminarán en una limpieza final.

#### Diagrama (vista alta)

```mermaid
flowchart TB
	subgraph UI[UI Layer]
		Components[UI Components\n(Button, Card, Select, Modal, Toast)]
	end

	subgraph Screens
		Dashboard[Dashboard]
		Services[Services]
		Agenda[Agenda]
		Clients[Clients]
		Bookings[Bookings]
		Inbox[Inbox]
	end

	subgraph Providers
		Theme[ThemeProvider]
		AppProv[AppProvider\n(state + actions)]
		ModalP[ModalProvider]
		ToastP[ToastProvider]
		ErrorB[ErrorBoundary]
	end

	subgraph Core[Core Domain]
		ServicesCore[services.js]
		ClientsCore[clients.js]
		BookingsCore[bookings.js]
		Persistence[persistence.js\n(migrations)]
		I18n[i18n.js]
		Helpers[helpers.js / logic.js]
	end

	Async[(AsyncStorage)]
	Future[(Backend Sync / Queue)]]

	AppJS[App.js] --> Providers --> Navigation[Navigation (Stacks/Tabs)] --> Screens
	Screens --> UI
	Screens --> Core
	Providers --> Core
	Core --> Persistence --> Async
	Core --> I18n
	Core --> Helpers
	AppProv -. planned .-> Future
	Persistence -. planned .-> Future
```

Más detalle en `docs/architecture.md`.

### 🧱 Capas
- Core (estado + reglas): mutaciones puras, genera slots, valida solapes, migra datos.
- UI: componentes visuales desacoplados (Card, Button, etc.).
- Screens: composición de UI + hooks del core.
- Infra/local persistence: AsyncStorage con migraciones (v2 añade `createdAt` a bookings).
- i18n: diccionario plano, helper `t(key)` y `useI18n()`.

### 🔄 Migraciones de Datos
Archivo: `3_core_storage.js` (o nombre equivalente según refactor). Versión actual: `SCHEMA_VERSION=2`.
Migración v2: agrega `createdAt` a cada booking existente. Nuevas migraciones se añaden secuencialmente asegurando idempotencia.

### 🌐 Internacionalización
- Diccionarios en `@core/i18n.js` (en, es).
- `t(key)` para traducir; keys normalizadas snake_case.
- Cambio de idioma persistente mediante `setLocale()`.

### 🎨 Theme
`4_ui_theme.js` expone `useTheme()` y persiste modo (light/dark) en AsyncStorage.

### 🧪 Testing
- Ejecutar: `npm test`
- Cobertura: `npm run test:cov`
- Pruebas actuales: generación de slots, detección de solapes, migración de esquema, borde horario (DST).

### 🧹 Lint & Calidad
```bash
npm run lint       # Analiza
npm run lint:fix   # Intenta corregir
```
Configurado ESLint (React, hooks, import). CI aborta si fallan tests/lint.

### 🚀 Scripts Clave
```json
"start": "expo start",
"android": "expo run:android",
"ios": "expo run:ios",
"web": "expo start --web",
"test": "jest",
"lint": "eslint . --ext .js,.jsx,.ts,.tsx"
```

### 🗑 Limpieza de Datos Locales
Claves AsyncStorage: `nx_role`, `nx_clinic`, `nx_services`, `nx_clients`, `nx_bookings`, `nx_client_requests`, `nx_locale`, `nx_theme_mode`.
Borrar app / limpiar caché de Expo para reset.

### ➕ Añadir Nueva Pantalla
1. Crear componente en `Nexora/screens/NombrePantalla.js`.
2. Registrar en navegación (tabs o stack) en `1_app_navigation.js` o tabs correspondientes.
3. Usar `useApp()` para estado / acciones y `t()` para textos.

### 📌 Roadmap (Actualizado)
1. Notificación UI al cruzar geocerca (toast/banner).
2. Multi-geocerca (sedes múltiples) + selección activa.
3. Limpieza final: eliminar shims `5_*.js` y antiguos archivos legacy (commit separado).
4. Tests adicionales: inactivar servicio, cancelación avanzada, validaciones fallidas, slots límites (horarios partidos / DST edge cases extra).
5. Endurecer TypeScript (strict true + noImplicitOverride + exactOptionalPropertyTypes).
6. Logger central + reporting de errores + envío opcional.
7. Soporte backend sync (plan de colas offline).
8. Métricas de rendimiento (marcas inicial/primer render, persist load).
9. Accesibilidad básica (roles web, tamaños táctiles, contraste dark mode).
10. CHANGELOG semántico y versionado.

### 🪝 Pre-commit Hooks
Integrados con Husky + lint-staged para asegurar calidad antes de cada commit.

Flujo:
1. `npm install` ejecuta `prepare` -> `husky install` crea `.husky/`.
2. Hook `pre-commit` lanza `npx lint-staged`.
3. `lint-staged`:
	- Aplica `eslint --fix` sobre archivos staged JS/TS.
	- Ejecuta Jest sólo sobre tests relacionados a cambios (`--findRelatedTests`).

Si un paso falla, el commit se bloquea. Para omitir (no recomendado) usar `git commit --no-verify`.

### 🔐 Futuro / Extensiones
- Autenticación / backend real
- Sincronización remota / offline queue
- Notificaciones push (Expo Notifications)
- Multi-moneda y husos horarios robustos
- Export / backup de datos

Ver `docs/backend-sync.md` para diseño preliminar de sincronización.

### 📄 Licencia
Privado / Uso interno.

---
### 📝 Nota de Migración (Agosto 2025)
Se completó la migración a la estructura `Nexora v2/`:
- Providers, navegación, UI, core e i18n viven ahora exclusivamente bajo `Nexora v2/`.
- `@app` alias apunta a `Nexora v2` (ya no se necesita la carpeta legacy).
- Se eliminó el antiguo `1_app_main.js` y se integró el `ErrorBoundary` como `Nexora v2/app/ErrorBoundary.js`.
- Dependencias centralizadas en `Nexora v2/app/baseDependencies.js` (antes `Nexora/2_dependencies.js`).
- Carpetas duplicadas/legacy (`Nexora/`, `NexoraV2/` provisional) marcadas para borrado definitivo tras verificar que no hay imports activos.

Pasos tras clonar (post-migración):
1. `npm install`
2. `npm run lint && npm test`
3. `npx expo start --web` (o `--tunnel` si hay problemas de red)

Si aparece algún import roto, buscar referencias antiguas a rutas `Nexora/` y reemplazar por alias `@v2/*` o `@core`, `@ui`, etc.

Esta nota puede eliminarse en el futuro una vez consolidado el historial de commits.

### ♿ Accesibilidad (progreso)
- Componentes interactivos mínimo 44px alto (revisar Buttons/Input ya alineados)
- Texto contrastado en dark mode (pendiente auditoría automática)
- Futuro: soporte para lectores de pantalla (añadir `accessibilityLabel`) y navegación por teclado en web.

### 🧾 CHANGELOG
Ver `CHANGELOG.md` para historial de cambios versionados.


