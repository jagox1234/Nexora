// Multi-idioma ampliado
export const languages = ['es', 'en', 'fr', 'de', 'it', 'pt'];

export function setLanguage(userId, lang) {
  return { userId, lang };
}

export function getLanguage(userId) {
  // TODO: obtener idioma real del usuario
  return 'es';
}
