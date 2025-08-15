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
- i18n (en / es) con persistencia de locale (`nx_locale`).
- Sistema propio: toasts, modales, picker de fecha/hora.
- Tests de lógica y migraciones con Jest.
- CI (GitHub Actions) ejecuta lint + tests en cada push/PR.

### 🗂 Arquitectura / Estructura
```
App.js                     # Punto de entrada Expo
Nexora/
	0_error_boundary.js      # Contención global de errores
	1_app_main.js            # Montaje de providers + root navigation
	1_app_navigation.js      # Navegación stack principal
	BusinessTabs.js / ClientTabs.js # Bottom tabs por rol
	2_dependencies.js        # Facade de imports (React, RN, libs)
	3_core_index.js          # Store / dominio (services, clients, bookings)
	3_core_storage.js        # Persistencia + migraciones (SCHEMA_VERSION)
	3_core_helpers.js        # Utilidades dominio
	4_ui_*                   # Componentes UI, theme, modal, toast
	screens/                 # Pantallas (DashboardScreen, BookingCreate, AgendaList...)
	legacy/                  # Notas sobre stubs numéricos antiguos (en proceso de retirada)
__tests__/                 # Pruebas de lógica / migración
```

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

### 📌 Roadmap (Prioritario Próximo)
*(Punto 11 completado: documentación de arquitectura · Punto 12 completado: pre-commit hooks)*
1. (Hecho) Eliminados restos numéricos (`5_*.js`).
2. Tests adicionales: inactivar servicio, cancelación, validaciones fallidas.
3. (Hecho) Documentar arquitectura (este README) y diagrama rápido (pendiente diagrama visual opcional).
4. Endurecer TypeScript (modo strict) y ajustar ESLint a TS >=5.
5. (Hecho) Pre-commit hooks (husky + lint-staged).
6. Manejo centralizado de errores y logger.

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

### 📄 Licencia
Privado / Uso interno.


