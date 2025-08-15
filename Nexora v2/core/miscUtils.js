// v2/core/miscUtils.js — migrated from legacy 3_utils.js
export function safeArray(x){ return Array.isArray(x)? x: []; }
export function safeText(x, fallback='—'){ return typeof x==='string' && x.trim()? x: fallback; }
export function fmtTime(iso,{ withDate=false }={}){ try { const d=new Date(iso); if(Number.isNaN(d.getTime())) return '—'; return withDate? d.toLocaleString([], { dateStyle:'medium', timeStyle:'short'}) : d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'}); } catch { return '—'; } }
export function findServiceName(services, id){ const arr=safeArray(services); const found=arr.find(s=>s?.id===id); return found?.name || 'Service'; }
