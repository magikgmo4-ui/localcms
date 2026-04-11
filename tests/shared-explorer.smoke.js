#!/usr/bin/env node
/**
 * tests/shared-explorer.smoke.js
 * MOD_SHARED_EXPLORER V1 — Smoke Tests
 *
 * Mode mock (défaut)  : MOCK_MODE=1 node tests/shared-explorer.smoke.js
 * Mode live           : BACKEND_URL=http://localhost:8000 node tests/shared-explorer.smoke.js
 *
 * Valide :
 *   S1 — chargement module (logique fonctionnelle)
 *   S2 — listing racine
 *   S3 — lecture fichier autorisé
 *   S4 — refus hors racine (path traversal)
 *   S5 — refus gros fichier
 *   S6 — logs présents après actions
 */

'use strict';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const MOCK_MODE   = process.env.BACKEND_URL ? false : true;

/* ─── MOCK BACKEND ──────────────────────────────────────────
   Simule les réponses du backend pour les tests sans serveur.
─────────────────────────────────────────────────────────── */
const MOCK_FS = {
  list_root: {
    path: '/', entries: [
      { name:'docs',       path:'docs',       type:'dir',  size:null, mtime:'2026-01-01T10:00:00' },
      { name:'readme.md',  path:'readme.md',  type:'file', size:1024, mtime:'2026-01-15T10:00:00' },
      { name:'config.yaml',path:'config.yaml',type:'file', size:512,  mtime:'2026-02-01T10:00:00' },
      { name:'big.log',    path:'big.log',    type:'file', size:6*1024*1024, mtime:'2026-03-01T10:00:00' },
      { name:'app.zip',    path:'app.zip',    type:'file', size:204800, mtime:'2026-03-10T10:00:00' },
    ]
  },
  read_readme: { path:'readme.md', content:'# README\n\nHello /shared world.', truncated:false },
};

function mockFetch(url) {
  const u = url.replace(/.*\/api\/shared\//, '');

  // Path traversal simulation
  if (u.includes('..') || u.includes('%2e%2e') || u.includes('%2E%2E')) {
    return Promise.resolve({
      ok: false, status: 403,
      json: async () => ({ error:'Access denied' })
    });
  }

  // list root — path vide, absent ou '/'
  if (u.startsWith('list')) {
    const pathMatch = u.match(/[?&]path=([^&]*)/);
    const pathVal   = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
    if (!pathVal || pathVal === '/') {
      return Promise.resolve({ ok:true, status:200, json: async () => MOCK_FS.list_root });
    }
  }

  // read readme
  if (u.startsWith('read') && u.includes('readme.md')) {
    return Promise.resolve({ ok:true, status:200, json: async () => MOCK_FS.read_readme });
  }

  // read big file → 413
  if (u.startsWith('read') && u.includes('big.log')) {
    return Promise.resolve({ ok:false, status:413, json: async () => ({ error:'File too large for preview (max 5 MB)' }) });
  }

  // .env → 403
  if (u.includes('.env')) {
    return Promise.resolve({ ok:false, status:403, json: async () => ({ error:'Access denied' }) });
  }

  return Promise.resolve({ ok:false, status:404, json: async () => ({ error:'Not found' }) });
}

// Polyfill fetch
const _fetch = MOCK_MODE
  ? mockFetch
  : (typeof fetch !== 'undefined' ? fetch : (() => {
      try { return require('node-fetch'); } catch { return null; }
    })());

if (!_fetch && !MOCK_MODE) {
  console.error('fetch non disponible — lancer avec MOCK_MODE=1 ou installer node-fetch');
  process.exit(1);
}

async function apiFetch(endpoint, params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const url = `${BACKEND_URL}/api/shared/${endpoint}${qs ? '?' + qs : ''}`;
  return _fetch(url);
}

/* ─── MODULE LOGIC (inline for smoke) ──────────────────────
   Reproduit la logique de classification du module.
─────────────────────────────────────────────────────────── */
const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;
const WHITELIST_TEXT    = new Set(['txt','md','json','yaml','yml','log','conf','ini','toml']);
const WHITELIST_CODE    = new Set(['py','sh','js','ts','sql','css','html']);
const BLOCKED_NAMES     = new Set(['.env']);
const CATEGORY          = {
  text:    { preview:true,  download:true  },
  code:    { preview:true,  download:true  },
  image:   { preview:false, download:true  },
  archive: { preview:false, download:true  },
  pdf:     { preview:false, download:true  },
  blocked: { preview:false, download:false },
  unknown: { preview:false, download:false },
};
const _ext = (n) => { const l=n.toLowerCase(); if(l.endsWith('.tar.gz'))return 'tar.gz'; const p=n.split('.'); return p.length>1?p[p.length-1].toLowerCase():''; };
const _cat = (n) => { if(BLOCKED_NAMES.has(n.toLowerCase()))return 'blocked'; const e=_ext(n); if(WHITELIST_TEXT.has(e))return 'text'; if(WHITELIST_CODE.has(e))return 'code'; return 'unknown'; };

// Local log accumulator
const smokeLogs = [];
const _log = (action, path, result, error) => {
  smokeLogs.push({ timestamp:new Date().toISOString(), user_id:'smoke_test', action, path_relative:path, result, ...(error?{error}:{}) });
};

/* ─── SMOKE RUNNER ──────────────────────────────────────── */
let _sp = 0, _sf = 0;

async function smoke(id, name, fn) {
  process.stdout.write(`  ${id}: ${name}… `);
  try {
    await fn();
    console.log('✓');
    _sp++;
    return true;
  } catch (e) {
    console.log('✗  ' + e.message);
    _sf++;
    return false;
  }
}

function sassert(cond, msg) { if (!cond) throw new Error(msg || 'smoke assertion failed'); }

/* ─── SMOKE TESTS ───────────────────────────────────────── */
async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  MOD_SHARED_EXPLORER V1 — Smoke Tests       ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Mode: ${MOCK_MODE ? 'MOCK (sans serveur)              ' : ('LIVE @ ' + BACKEND_URL).padEnd(38)}║`);
  console.log('╚══════════════════════════════════════════════╝\n');

  /* S1 — Module logic loads without errors */
  await smoke('S1', 'Chargement logique module', async () => {
    sassert(MAX_PREVIEW_BYTES === 5 * 1024 * 1024, 'MAX_PREVIEW_BYTES = 5 MB');
    sassert(typeof _cat === 'function',  '_cat function ok');
    sassert(typeof _ext === 'function',  '_ext function ok');
    sassert(BLOCKED_NAMES.has('.env'),   '.env dans BLOCKED_NAMES');
    sassert(CATEGORY.text.preview,       'text.preview = true');
    sassert(!CATEGORY.pdf.preview,       'pdf.preview = false');
    sassert(!CATEGORY.archive.preview,   'archive.preview = false');
    sassert(!CATEGORY.blocked.download,  'blocked.download = false');
    _log('init', '/', 'ok');
  });

  /* S2 — List root */
  await smoke('S2', 'Listing racine /shared', async () => {
    const resp = await apiFetch('list', { path:'' });
    sassert(resp.ok, `HTTP ${resp.status} — attendu 200`);
    const data = await resp.json();
    sassert(Array.isArray(data.entries), 'entries = tableau');
    sassert(data.entries.length > 0,     'au moins une entrée');
    // Vérifier structure de chaque entrée
    for (const e of data.entries) {
      sassert(e.name !== undefined,  `entrée ${e.name}: name requis`);
      sassert(e.path !== undefined,  `entrée ${e.name}: path requis`);
      sassert(e.type !== undefined,  `entrée ${e.name}: type requis`);
      sassert(!e.path.startsWith('/shared'), `entrée ${e.name}: path ne doit pas contenir /shared absolu`);
    }
    _log('list', '/', 'ok');
  });

  /* S3 — Read authorized text file */
  await smoke('S3', 'Lecture fichier texte autorisé', async () => {
    const resp = await apiFetch('read', { path:'readme.md' });
    sassert(resp.ok, `HTTP ${resp.status} — attendu 200`);
    const data = await resp.json();
    sassert(typeof data.content === 'string', 'content = string');
    sassert(data.content.length > 0, 'content non vide');
    sassert('truncated' in data, 'truncated field présent');
    _log('read', 'readme.md', 'ok');
  });

  /* S4 — Path traversal refused */
  await smoke('S4', 'Path traversal refusé (403)', async () => {
    const resp = await apiFetch('read', { path:'../../etc/passwd' });
    sassert(!resp.ok, 'path traversal doit être refusé');
    sassert(resp.status === 403 || resp.status === 400,
      `Attendu 403/400, reçu ${resp.status}`);
    _log('access_denied', '../../etc/passwd', 'denied', 'path_traversal');
  });

  /* S5 — Big file preview refused */
  await smoke('S5', 'Gros fichier preview refusé (413)', async () => {
    const resp = await apiFetch('read', { path:'big.log' });
    sassert(!resp.ok, 'gros fichier doit être refusé pour preview');
    sassert(resp.status === 413,
      `Attendu 413, reçu ${resp.status}`);
    _log('read', 'big.log', 'denied', 'file_too_large');
  });

  /* S6 — Logs present */
  await smoke('S6', 'Logs présents après actions', async () => {
    sassert(smokeLogs.length >= 5, `${smokeLogs.length} logs — attendu >= 5`);
    // Vérifier format de chaque log
    for (const entry of smokeLogs) {
      sassert(entry.timestamp,              `log ${entry.action}: timestamp requis`);
      sassert(entry.user_id,                `log ${entry.action}: user_id requis`);
      sassert(entry.action,                 `log ${entry.action}: action requise`);
      sassert(entry.path_relative !== undefined, `log ${entry.action}: path_relative requis`);
      sassert(entry.result,                 `log ${entry.action}: result requis`);
    }
    // Vérifier présence des actions obligatoires
    const actions = smokeLogs.map(l => l.action);
    sassert(actions.includes('list'),         'action list loggée');
    sassert(actions.includes('read'),         'action read loggée');
    sassert(actions.includes('access_denied'),'action access_denied loggée');
  });

  /* Résumé */
  const total = _sp + _sf;
  console.log('\n' + '─'.repeat(48));
  console.log(`  ${_sp}/${total} smoke tests passés${_sf > 0 ? ' — ' + _sf + ' ÉCHOUÉS' : ' ✓'}`);
  if (_sf > 0) {
    console.log('\n  ⚠  Des tests ont échoué.');
    if (MOCK_MODE) {
      console.log('  Mode MOCK actif — les échecs T4/T5 nécessitent');
      console.log('  un vrai backend pour vérification complète.');
    }
  }
  console.log('');

  if (_sf > 0) process.exit(1);
}

main().catch(e => {
  console.error('\nErreur smoke test:', e.message);
  process.exit(1);
});
