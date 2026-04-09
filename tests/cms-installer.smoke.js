/**
 * cms-installer.smoke.js — CMS Module Installer V1
 * 6 smoke tests : mock HTTP + live backend optionnel
 *
 * Usage :
 *   node tests/cms-installer.smoke.js              # mode MOCK (pas de backend)
 *   BACKEND_URL=http://localhost:8000 node ...      # mode LIVE (backend requis)
 *
 * Node >= 18 : fetch natif.
 * Node < 18 : npm install node-fetch, puis adapter l'import.
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

const MOCK_BUNDLES = [
  { filename: 'test-module-v1.0.0.zip', size: 2048, modified: '2026-03-15T10:00:00.000Z' },
];

const MOCK_MANIFEST = {
  id: 'test_module', name: 'Test Module', version: '1.0.0',
  description: 'Module de test', group: 'tools',
  target_key: 'modules_dir',
  files: [{ src: 'module.js', dest: 'test-module.js' }],
};

const MOCK_HISTORY_LOGS = [
  {
    timestamp: '2026-03-15T10:01:00.000Z',
    user_id: 'cms_user',
    action: 'install',
    bundle: 'test-module-v1.0.0.zip',
    module_id: 'test_module',
    pipeline_step: 'finalize',
    result: 'ok',
  },
];

function mockFetch(url, options) {
  const urlObj  = new URL(url, 'http://localhost');
  const path    = urlObj.pathname;
  const params  = urlObj.searchParams;
  const method  = (options && options.method) ? options.method.toUpperCase() : 'GET';

  // GET /api/installer/scan
  if (method === 'GET' && path === '/api/installer/scan') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ bundles: MOCK_BUNDLES, count: MOCK_BUNDLES.length }),
    });
  }

  // GET /api/installer/inspect?bundle=<name>
  if (method === 'GET' && path === '/api/installer/inspect') {
    const bundle = params.get('bundle');
    if (!bundle || bundle === '') {
      return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ detail: 'Bundle requis' }) });
    }
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({
        bundle,
        manifest:     MOCK_MANIFEST,
        files_in_zip: ['manifest.json', 'module.js'],
      }),
    });
  }

  // POST /api/installer/precheck
  if (method === 'POST' && path === '/api/installer/precheck') {
    const body = options && options.body ? JSON.parse(options.body) : {};
    const bundle = body.bundle || '';
    if (!bundle) {
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve({ bundle: '', module_id: '', result: 'failed', errors: ['Bundle requis'] }),
      });
    }
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ bundle, module_id: 'test_module', result: 'ok', errors: [] }),
    });
  }

  // POST /api/installer/precheck — bundle avec target_key invalide
  // (géré par le mock ci-dessus via le body)

  // POST /api/installer/install — bundle valide
  if (method === 'POST' && path === '/api/installer/install') {
    const body = options && options.body ? JSON.parse(options.body) : {};
    const bundle = body.bundle || '';
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({
        bundle,
        module_id:       'test_module',
        result:          'ok',
        installed_files: ['/app/localcms/modules/test-module.js'],
        sanity_check:    null,
        steps: {
          precheck:   { status: 'ok' },
          backup:     { status: 'skipped' },
          staging:    { status: 'ok' },
          validate:   { status: 'ok' },
          install:    { status: 'ok' },
          post_check: { status: 'skipped', sanity_fn: null },
          finalize:   { status: 'ok' },
        },
      }),
    });
  }

  // GET /api/installer/history
  if (method === 'GET' && path === '/api/installer/history') {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ logs: MOCK_HISTORY_LOGS, count: MOCK_HISTORY_LOGS.length }),
    });
  }

  // 404 par défaut
  return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ detail: 'Not found' }) });
}

/* ─── Résolution du fetch à utiliser ─────────────────────────────────── */

const fetchFn = MOCK_MODE ? mockFetch : (globalThis.fetch || (() => { throw new Error('node-fetch requis pour Node < 18'); }));
const BASE    = MOCK_MODE ? 'http://mock' : BACKEND_URL;

/* ─── Smoke tests ────────────────────────────────────────────────────── */

// S1 — Scan : retourne une liste de bundles
await smoke('S1 — Scan retourne bundles[]', async () => {
  const res  = await fetchFn(`${BASE}/api/installer/scan`);
  assert(res.ok, `Scan HTTP ${res.status}`);
  const data = await res.json();
  assert(Array.isArray(data.bundles), 'bundles doit être un tableau');
  assert(typeof data.count === 'number', 'count doit être un nombre');
});

// S2 — Inspect : retourne un manifeste parsé
await smoke('S2 — Inspect retourne le manifeste', async () => {
  const bundle = MOCK_MODE ? MOCK_BUNDLES[0].filename : 'test-module-v1.0.0.zip';
  const res    = await fetchFn(`${BASE}/api/installer/inspect?bundle=${encodeURIComponent(bundle)}`);
  if (!res.ok && res.status === 404) {
    // En mode live, le bundle peut ne pas exister — smoke non bloquant
    console.log('    (bundle absent en mode live — skip)');
    return;
  }
  assert(res.ok, `Inspect HTTP ${res.status}`);
  const data = await res.json();
  assert(data.manifest && typeof data.manifest === 'object', 'manifest doit être un objet');
  assert(Array.isArray(data.files_in_zip), 'files_in_zip doit être un tableau');
});

// S3 — Precheck valide : result = ok, errors = []
await smoke('S3 — Precheck sur bundle valide → result ok', async () => {
  const bundle = MOCK_MODE ? MOCK_BUNDLES[0].filename : 'test-module-v1.0.0.zip';
  const res = await fetchFn(`${BASE}/api/installer/precheck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bundle }),
  });
  if (!res.ok && res.status === 404) { console.log('    (bundle absent — skip)'); return; }
  assert(res.ok, `Precheck HTTP ${res.status}`);
  const data = await res.json();
  assert('result' in data, 'result doit être présent');
  assert(Array.isArray(data.errors), 'errors doit être un tableau');
  assert(data.result === 'ok', `Precheck doit retourner ok, obtenu : ${data.result} — ${data.errors.join(', ')}`);
});

// S4 — Precheck bundle vide → errors non vide
await smoke('S4 — Precheck bundle vide → erreur retournée', async () => {
  const res = await fetchFn(`${BASE}/api/installer/precheck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bundle: '' }),
  });
  // Soit HTTP 400, soit HTTP 200 avec result=failed
  if (res.status === 400) return; // comportement attendu
  const data = await res.json();
  assert(data.result === 'failed' || (data.errors && data.errors.length > 0),
    'Bundle vide doit produire une erreur');
});

// S5 — Install : pipeline complet retourne les steps attendus
await smoke('S5 — Install retourne steps du pipeline', async () => {
  const bundle = MOCK_MODE ? MOCK_BUNDLES[0].filename : 'test-module-v1.0.0.zip';
  const res = await fetchFn(`${BASE}/api/installer/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bundle }),
  });
  if (!res.ok && res.status === 404) { console.log('    (bundle absent — skip)'); return; }
  // 422 possible si precheck fail en live
  const data = await res.json();
  assert('result' in data, 'result doit être présent');
  assert('steps' in data,  'steps doit être présent');
  assert(typeof data.steps === 'object', 'steps doit être un objet');
  // Quel que soit le result, precheck doit être dans steps
  assert('precheck' in data.steps, 'steps.precheck doit être présent');
});

// S6 — History : retourne logs[] avec format correct
await smoke('S6 — History retourne logs avec champs obligatoires', async () => {
  const res  = await fetchFn(`${BASE}/api/installer/history`);
  assert(res.ok, `History HTTP ${res.status}`);
  const data = await res.json();
  assert(Array.isArray(data.logs), 'logs doit être un tableau');
  assert(typeof data.count === 'number', 'count doit être un nombre');
  // Vérifier le format du premier log s'il existe
  if (data.logs.length > 0) {
    const log = data.logs[0];
    const REQUIRED = ['timestamp','user_id','action','bundle','module_id','pipeline_step','result'];
    REQUIRED.forEach(f => assert(f in log, `Log doit contenir : ${f}`));
    assert(log.user_id === 'cms_user', `user_id doit être "cms_user", obtenu : ${log.user_id}`);
  }
});

/* ─── Résumé ─────────────────────────────────────────────────────────── */

const mode = MOCK_MODE ? 'MOCK' : `LIVE — ${BACKEND_URL}`;
console.log(`\nCMS Module Installer V1 — Smoke Tests [${mode}]`);
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
