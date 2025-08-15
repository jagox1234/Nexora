// Cifrado en tránsito y reposo
export function encrypt(data) {
  // TODO: cifrado real
  return btoa(JSON.stringify(data));
}

export function decrypt(data) {
  // TODO: descifrado real
  return JSON.parse(atob(data));
}
