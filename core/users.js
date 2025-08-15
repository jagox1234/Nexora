// Modelo y lógica de usuarios para autenticación real
export const users = [];

export function registerUser({ email, password, roles = ['client'] }) {
  // TODO: hash password, validar email
  const user = { id: Date.now().toString(), email, password, roles, session: null };
  users.push(user);
  return user;
}

export function loginUser({ email, password }) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    user.session = { token: Math.random().toString(36).slice(2), expires: Date.now() + 3600 * 1000 };
    return user;
  }
  return null;
}

export function logoutUser(userId) {
  const user = users.find(u => u.id === userId);
  if (user) user.session = null;
}

export function recoverPassword(email) {
  // TODO: enviar email de recuperación
  return users.find(u => u.email === email) ? true : false;
}

export function getUserBySession(token) {
  return users.find(u => u.session && u.session.token === token);
}
