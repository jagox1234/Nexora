// Debounced batch persistence helper
import { AsyncStorage } from '../app/dependencies.js';

const queue = new Map();
let timer = null;
const DELAY = 120; // ms

export function schedulePersist(key, value){
  queue.set(key, value);
  if(timer) return;
  timer = setTimeout(flush, DELAY);
}

async function flush(){
  const entries = Array.from(queue.entries());
  queue.clear();
  timer = null;
  await Promise.all(entries.map(async ([k,v]) => {
    try { await AsyncStorage.setItem(k, JSON.stringify(v)); } catch {}
  }));
}

export async function flushNow(){ if(timer){ clearTimeout(timer); timer=null; } await flush(); }
