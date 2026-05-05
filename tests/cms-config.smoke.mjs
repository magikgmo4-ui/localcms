/**
 * cms-config.smoke.mjs — Config Store M3
 * 5 smoke tests : mock HTTP + live backend optionnel
 *
 * Usage :
 *   node tests/cms-config.smoke.mjs              # mode MOCK (pas de backend)
 *   BACKEND_URL=http://localhost:8000 node ...   # mode LIVE (backend requis)
 *
 * Node >= 18 : fetch natif.
 */

'use strict';

const BACKEND_URL = process.env.BACKEND_URL || null;
const MOCK_MODE   = !BACKEND_URL;

/* ─── Mini runner ──────────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;
const results = [];

async function smoke(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    passed++;
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

/* ─── Mock fetch (mode MOCK uniquement) ───────────────────────────────── */

const MOCK_STORE = {};

function mockFetch(url, options) {
  const urlObj = new URL(url, 'http://localhost');
  const path   = urlObj.pathname;
  const method = (options && options.method) ? options.method.toUpperCase() : 'GET';

  // GET /api/config — list
  if (method === 'GET' && path === '/api/config') {
    const configs = Object.keys(MOCK_STORE).sort();
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ configs, count: configs.length }),
    });
  }

  // POST /api/config/{module_id}
  const matchMod = path.match(/^\/api\/config\/([^/]+)$/);
  if (matchMod) {
    const id = matchMod[1];
    if (!/^[a-z0-9_]+$/.test(id)) {
      return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ detail: 'module_id invalide' }) });
    }
    if (method === 'POST') {
      const body = options && options.body ? JSON.parse(options.body) : {};
      if (!body.data || typeof body.data !== 'object') {
        return Promise.resolve({ ok: false, status: 422, json: () => Promise.resolve({ detail: 'data requis' }) });
      }
      MOCK_STORE[id] = body.data;
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve({ result: 'ok', module_id: id }),
      });
    }
    if (method === 'GET') {
      if (!(id in MOCK_STORE)) {
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ detail: `Aucune config sauvegardée pour : ${id}` }) });
      }
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve({ module_id: id, data: MOCK_STORE[id] }),
      });
    }
  }

  return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ detail: 'Not found' }) });
}

/* ─── Résolution fetch ────────────────────────────────────────────────── */

const fetchFn = MOCK_MODE
  ? mockFetch
  : (globalThis.fetch || (() => { throw new Error('fetch natif requis (Node >= 18)'); }));
const BASE = MOCK_MODE ? 'http://mock' : BACKEND_URL;

/* ─── Smoke tests ────────────────────────────────────────────────────── */

// S1 — GET /api/config : retourne configs[]
await smoke('S1 — GET /api/config → configs[]', async () => {
  const res  = await fetchFn(`${BASE}/api/config`);
  assert(res.ok, `GET /api/config HTTP ${res.status}`);
  const data = await res.json();
  assert(Array.isArray(data.configs),        'configs doit être un tableau');
  assert(typeof data.count === 'number',     'count doit être un nombre');
  assert(data.count === data.configs.length, 'count doit correspondre à configs.length');
});

// S2 — POST /api/config/env_global : sauvegarde config
await smoke('S2 — POST /api/config/env_global → result ok', async () => {
  const res = await fetchFn(`${BASE}/api/config/env_global`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ data: { site_name: 'LocalCMS', port: 8080, debug: false } }),
  });
  assert(res.ok, `POST /api/config/env_global HTTP ${res.status}`);
  const data = await res.json();
  assert(data.result    === 'ok',         `result attendu 'ok', obtenu : ${data.result}`);
  assert(data.module_id === 'env_global', `module_id attendu 'env_global', obtenu : ${data.module_id}`);
});

// S3 — GET /api/config/env_global : lecture config sauvegardée
await smoke('S3 — GET /api/config/env_global → data correct', async () => {
  const res  = await fetchFn(`${BASE}/api/config/env_global`);
  assert(res.ok, `GET /api/config/env_global HTTP ${res.status}`);
  const data = await res.json();
  assert(data.module_id === 'env_global',      `module_id attendu 'env_global', obtenu : ${data.module_id}`);
  assert(data.data && typeof data.data === 'object', 'data doit être un objet');
});

// S4 — GET /api/config : env_global apparaît dans la liste
await smoke('S4 — GET /api/config → env_global présent', async () => {
  const res  = await fetchFn(`${BASE}/api/config`);
  assert(res.ok, `GET /api/config HTTP ${res.status}`);
  const data = await res.json();
  assert(data.configs.includes('env_global'),
    `env_global absent de configs: ${JSON.stringify(data.configs)}`);
});

// S5 — GET /api/config/inexistant_xyz → 404
await smoke('S5 — GET /api/config/inexistant_xyz → 404', async () => {
  const res = await fetchFn(`${BASE}/api/config/inexistant_xyz`);
  assert(res.status === 404, `status attendu 404, obtenu ${res.status}`);
});

/* ─── Résumé ─────────────────────────────────────────────────────────── */

const mode = MOCK_MODE ? 'MOCK' : `LIVE — ${BACKEND_URL}`;
console.log(`\nConfig Store M3 — Smoke Tests [${mode}]`);
console.log('='.repeat(52));
results.forEach(r => {
  const icon = r.ok ? '✓' : '✕';
  const msg  = r.ok ? '' : `  ← ${r.error}`;
  console.log(`  ${icon}  ${r.name}${msg}`);
});
console.log('-'.repeat(52));
console.log(`  RÉSULTAT : ${passed}/${passed + failed} smokes passés`);
console.log('');

if (failed > 0) process.exit(1);
