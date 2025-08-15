// v2/core/auth.js — simple auth scaffold (Phase 1)
// Placeholder local auth (to replace with backend). Not secure for production.

import * as Crypto from 'expo-crypto';

function genSalt(){
  // Not cryptographically strong fallback if getRandomBytesAsync not available
  const rand = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return rand.slice(0,16);
}

function genSessionToken(){
  return 'sess_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
}

export function createAuthState() {
  return { currentUser: null, users: [], sessions: [] };
}

async function hash(pw) { try { return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pw); } catch { return pw; } }

export async function registerUser(state, { email, password, name }) {
  if (!email || !password) return { ok:false, error:'missing_fields' };
  if (state.users.find(u=>u.email===email)) return { ok:false, error:'exists' };
  const salt = genSalt();
  const user = { id:`usr_${Date.now()}`,
    email,
    salt,
    passwordHash: await hash(salt+password),
    name:name||email.split('@')[0],
    roles:['client'],
    createdAt:new Date().toISOString() };
  const session = { token: genSessionToken(), userId: user.id, createdAt:new Date().toISOString(), lastUsedAt:new Date().toISOString() };
  return { ok:true, state:{ ...state, users:[user, ...state.users], currentUser:user, sessions:[session, ...state.sessions] }, user, session };
}

export async function loginUser(state, { email, password }) {
  const u = state.users.find(x=> x.email===email);
  if(!u) return { ok:false, error:'invalid_credentials' };
  let valid = false;
  if(u.salt){
    const ph = await hash(u.salt + (password||''));
    valid = ph === u.passwordHash;
  } else {
    // legacy user without salt
    const phLegacy = await hash(password||'');
    if (phLegacy === u.passwordHash || u.password === password) {
      // upgrade user with salt
      const salt = genSalt();
      const newHash = await hash(salt + password);
      u.salt = salt; u.passwordHash = newHash; delete u.password;
      valid = true;
    }
  }
  if(!valid) return { ok:false, error:'invalid_credentials' };
  const sanitized = { ...u }; delete sanitized.password;
  const session = { token: genSessionToken(), userId: u.id, createdAt:new Date().toISOString(), lastUsedAt:new Date().toISOString() };
  return { ok:true, state:{ ...state, currentUser:sanitized, users: state.users.map(x=> x.id===u.id ? sanitized : x), sessions:[session, ...state.sessions] }, user:sanitized, session };
}

export function logoutUser(state) {
  return { ok:true, state:{ ...state, currentUser:null } };
}

export function grantRole(state, { userId, role }) {
  return { ...state,
    users: state.users.map(u => u.id===userId ? { ...u, roles: Array.from(new Set([...(u.roles||[]), role])) } : u),
    currentUser: state.currentUser?.id===userId ? { ...state.currentUser, roles: Array.from(new Set([...(state.currentUser.roles||[]), role])) } : state.currentUser };
}

export function validateSession(state, token){
  const s = state.sessions?.find(s=> s.token===token);
  if(!s) return null;
  const user = state.users.find(u=> u.id===s.userId) || null;
  if(user){ s.lastUsedAt = new Date().toISOString(); }
  return user;
}
