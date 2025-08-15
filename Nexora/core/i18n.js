// core/i18n.js — minimal internationalization helper
// Usage: import { t, setLocale } from '@core/i18n';

import { AsyncStorage } from '../2_dependencies.js';

let currentLocale = 'en';
const fallbackLocale = 'en';

// Simple flat dictionaries.
const dictionaries = {
  en: {
    dashboard_welcome: 'Welcome',
    dashboard_overview: 'Overview',
  settings_title: 'Settings',
  appearance: 'Appearance',
  role_title: 'Role',
  business_active: 'Business (active)',
  switch_business: 'Switch to Business',
  client_active: 'Client (active)',
  switch_client: 'Switch to Client',
  reset_role: 'Reset role (ask again)',
  business_info: 'Business info',
  client_mode: 'Client mode',
  client_mode_hint: 'Use Explore to find businesses and join waitlists or request times.',
  current_role: 'Current role',
  current_theme: 'Current',
  save: 'Save',
  saved: 'Saved',
  business_info_updated: 'Business info updated.',
  role_changed: 'Role changed',
  now_in_business: 'Now you are in Business mode.',
  now_in_client: 'Now you are in Client mode.',
  switch_light: 'Switch to Light',
  switch_dark: 'Switch to Dark',
  locale: 'Language',
  language_changed: 'Language changed',
    kpi_bookings: 'Bookings',
    kpi_confirmed: 'Confirmed',
    kpi_pending: 'Pending',
    kpi_cancelled: 'Cancelled',
    kpi_active_services: 'Active services',
    kpi_requests: 'Requests (inbox)',
    upcoming_none: 'No upcoming bookings.',
    tips_business: 'Use Inbox to convert client requests into bookings, and keep Services updated.',
    tips_client: 'Use Pick time for a specific slot or join waitlist to be called sooner.'
  },
  es: {
    dashboard_welcome: 'Bienvenido',
    dashboard_overview: 'Resumen',
    dashboard: 'Panel',
    agenda: 'Agenda',
    services_title: 'Servicios',
    clients_title: 'Clientes',
    inbox: 'Bandeja',
    explore: 'Explorar',
    my_bookings: 'Mis reservas',
    quick_actions: 'Acciones rápidas',
    add_sample_service: 'Añadir servicio demo',
    create_booking_plus_60: 'Crear reserva +60min',
    confirm_first_pending: 'Confirmar primera pendiente',
    cancel_first_today: 'Cancelar primera de hoy',
    upcoming: 'Próximas',
    tips: 'Consejos',
    today_label: 'Hoy',
    filters: 'Filtros',
    search_client_placeholder: 'Buscar cliente…',
    no_bookings: 'Sin reservas.',
    confirm_btn: 'Confirmar',
    cancel_btn: 'Cancelar',
    new_booking: 'Nueva reserva',
    service: 'Servicio',
    day: 'Día',
    today: 'Hoy',
    tomorrow: 'Mañana',
    plus_7d: '+7d',
    available_slots: 'Huecos disponibles',
    selected_time: 'Hora seleccionada',
    client: 'Cliente',
    create_booking: 'Crear reserva',
    missing_fields: 'Faltan datos',
    missing_booking_fields: 'Selecciona servicio, hora y teléfono.',
    overlap: 'Solapado',
    overlap_msg: 'Ya existe otra reserva en ese intervalo.',
    booking_created: 'Creada',
    booking_created_msg: 'Reserva creada correctamente.',
    search_service_placeholder: 'Buscar servicio…',
    manage_offerings: 'Gestiona la oferta',
    new_service: 'Nuevo servicio',
    save_service: 'Guardar servicio',
    no_services: 'Sin servicios',
    no_services_hint: 'Prueba otra búsqueda o crea uno nuevo.',
    delete: 'Eliminar',
    please_fill_all: 'Rellena todos los campos',
    new_client: 'Nuevo cliente',
    save_client: 'Guardar cliente',
    no_clients: 'Sin clientes.',
    bookings_count: 'Reservas',
    phone_required: 'Teléfono requerido',
    search: 'Buscar',
    search_placeholder: 'Nombre o teléfono…',
    join_waitlist: 'Unirse a lista',
    pick_time: 'Elegir hora',
    view_services: 'Ver servicios',
    hide: 'Ocultar',
    requested: 'Solicitada',
    no_businesses: 'No se encontraron negocios.',
    no_services_listed: 'Sin servicios listados.',
    requested_time: 'Hora solicitada',
    none: 'Ninguno.',
    queue: 'Cola',
    in_queue: 'en cola',
    remove: 'Eliminar',
    book_at_requested: 'Reservar en solicitada',
    book_next_slot: 'Reservar próximo hueco',
    incoming_requests: 'Solicitudes entrantes',
    no_requests: 'Sin solicitudes aún.',
    convert_requests_hint: 'Convierte solicitudes en reservas de',
    status: 'Estado',
    requested_label: 'Solicitada',
    settings_title: 'Ajustes',
    appearance: 'Apariencia',
    role_title: 'Rol',
    business_active: 'Negocio (activo)',
    switch_business: 'Cambiar a Negocio',
    client_active: 'Cliente (activo)',
    switch_client: 'Cambiar a Cliente',
    reset_role: 'Reiniciar rol (preguntar de nuevo)',
    business_info: 'Info del negocio',
    client_mode: 'Modo cliente',
    client_mode_hint: 'Usa Explorar para encontrar negocios y unirte a listas de espera o solicitar horarios.',
    current_role: 'Rol actual',
    current_theme: 'Actual',
    save: 'Guardar',
    saved: 'Guardado',
    business_info_updated: 'Información del negocio actualizada.',
    role_changed: 'Rol cambiado',
    now_in_business: 'Ahora estás en modo Negocio.',
    now_in_client: 'Ahora estás en modo Cliente.',
    switch_light: 'Cambiar a Claro',
    switch_dark: 'Cambiar a Oscuro',
    locale: 'Idioma',
    language_changed: 'Idioma cambiado',
    kpi_bookings: 'Reservas',
    kpi_confirmed: 'Confirmadas',
    kpi_pending: 'Pendientes',
    kpi_cancelled: 'Canceladas',
    kpi_active_services: 'Servicios activos',
    kpi_requests: 'Solicitudes (inbox)',
    upcoming_none: 'Sin próximas reservas.',
    tips_business: 'Usa Inbox para convertir solicitudes en reservas y mantén Servicios actualizado.',
    tips_client: 'Usa Pick time para un horario específico o únete a la lista de espera.'
  }
};

const LOCALE_KEY = 'nx_locale';

export async function setLocale(loc) {
  if (dictionaries[loc]) {
    currentLocale = loc;
    try { await AsyncStorage.setItem(LOCALE_KEY, loc); } catch {}
  }
}

export async function initLocale() {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_KEY);
    if (saved && dictionaries[saved]) currentLocale = saved;
  } catch {}
  return currentLocale;
}

export function getLocale() { return currentLocale; }

export function t(key) {
  const dict = dictionaries[currentLocale] || dictionaries[fallbackLocale];
  return dict[key] || key;
}

export function availableLocales() { return Object.keys(dictionaries); }
