// Registro y perfil cliente (foto, preferencias)
export const clientProfiles = [];

export function setClientProfile({ clientId, photoUrl, preferences }) {
  const idx = clientProfiles.findIndex(p => p.clientId === clientId);
  const profile = { clientId, photoUrl, preferences };
  if (idx >= 0) clientProfiles[idx] = profile;
  else clientProfiles.push(profile);
  return profile;
}

export function getClientProfile(clientId) {
  return clientProfiles.find(p => p.clientId === clientId) || null;
}
