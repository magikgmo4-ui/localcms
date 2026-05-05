/**
 * cms-installer.smoke.js — CMS Module Installer V1
 * 10 smoke tests : mock HTTP + live backend optionnel
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

const MOCK_BACKUPS = [
  {
    module_id:   'test_module',
    backup_name: 'test_module_20260101T000000000000',
    timestamp:   '20260101T000000000000',
    files:       ['test-module.js'],
  },
];

const MOCK_INSTALL_WITH_SANITY = {
  result:          'ok',
  bundle:          'hello-mod-v1.0.0.zip',
  module_id:       'hello_mod',
  sanity_check:    'hello_mod_sanity',
  installed_files: ['/app/localcms/modules/hello-mod.js'],
  steps: {
    precheck:   { status: 'ok' },
    backup:     { status: 'skipped' },
    staging:    { status: 'ok' },
    validate:   { status: 'ok' },
    install:    { status: 'ok' },
    post_check: { status: 'ok', sanity_fn: 'hello_mod_sanity' },
    finalize:   { status: 'ok' },
  },
};

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
    const body   = options && options.body ? JSON.parse(options.body) : {};
    const bundle = body.bundle || '';
    // branche sanity_check != null
    if (bundle === 'hello-mod-v1.0.0.zip') {
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve(MOCK_INSTALL_WITH_SANITY),
      });
    }
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

  // POST /api/installer/rollback
  if (method === 'POST' && path === '/api/installer/rollback') {
    const body      = options && options.body ? JSON.parse(options.body) : {};
    const module_id = body.module_id || '';
    if (!module_id || !/^[a-z0-9_]+$/.test(module_id)) {
      return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ detail: 'module_id invalide' }) });
    }
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({
        result:         'ok',
        module_id,
        backup_used:    `${module_id}_20260101T000000000000`,
        restored_files: ['test-module.js'],
      }),
    });
  }

  // GET /api/installer/backups
  if (method === 'GET' && path === '/api/installer/backups') {
    const filter = params.get('module_id');
    if (filter !== null && !/^[a-z0-9_]+$/.test(filter)) {
      return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ detail: 'module_id invalide' }) });
    }
    const filtered = filter ? MOCK_BACKUPS.filter(b => b.module_id === filter) : MOCK_BACKUPS;
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ result: 'ok', backups: filtered, count: filtered.length }),
    });
  }

  // POST /api/installer/restore
  if (method === 'POST' && path === '/api/installer/restore') {
    const body        = options && options.body ? JSON.parse(options.body) : {};
    const module_id   = body.module_id   || '';
    const backup_name = body.backup_name || '';
    if (!module_id || !/^[a-z0-9_]+$/.test(module_id)) {
      return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ detail: 'module_id invalide' }) });
    }
    if (!backup_name || !backup_name.startsWith(`${module_id}_`)) {
      return Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ detail: 'backup_name invalide' }) });
    }
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({
        result:         'ok',
        module_id,
        backup_used:    backup_name,
        restored_files: ['test-module.js'],
      }),
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

// S7 — Install avec sanity_check non nul : réponse porte le champ + post_check ok
await smoke('S7 — Install avec sanity_check : champ retourné + post_check ok', async () => {
  const res = await fetchFn(`${BASE}/api/installer/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bundle: 'hello-mod-v1.0.0.zip' }),
  });
  if (!res.ok && res.status === 404) { console.log('    (bundle absent en mode live — skip)'); return; }
  const data = await res.json();
  assert('sanity_check' in data,             'sanity_check doit être présent dans la réponse');
  assert(data.sanity_check === 'hello_mod_sanity',
    `sanity_check attendu 'hello_mod_sanity', obtenu : ${data.sanity_check}`);
  assert(data.steps && data.steps.post_check, 'steps.post_check doit être présent');
  assert(data.steps.post_check.status === 'ok',
    `post_check.status attendu 'ok', obtenu : ${data.steps.post_check.status}`);
  assert(data.steps.post_check.sanity_fn === 'hello_mod_sanity',
    `post_check.sanity_fn attendu 'hello_mod_sanity', obtenu : ${data.steps.post_check.sanity_fn}`);
});

// S8 — Rollback : POST /api/installer/rollback → result=ok
await smoke('S8 — Rollback POST → result ok', async () => {
  if (!MOCK_MODE) {
    // Réinstaller pour créer un backup (prérequis du rollback en live)
    const installRes = await fetchFn(`${BASE}/api/installer/install`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bundle: 'test-module-v1.0.0.zip' }),
    });
    if (!installRes.ok && installRes.status === 404) {
      console.log('    (bundle absent en live — skip S8)'); return;
    }
  }
  const res = await fetchFn(`${BASE}/api/installer/rollback`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ module_id: 'test_module' }),
  });
  if (!res.ok && res.status === 404) { console.log('    (aucun backup en live — skip)'); return; }
  assert(res.ok, `Rollback HTTP ${res.status}`);
  const data = await res.json();
  assert(data.result === 'ok',              `result attendu 'ok', obtenu : ${data.result}`);
  assert(typeof data.module_id === 'string',  'module_id doit être présent');
  assert(typeof data.backup_used === 'string','backup_used doit être présent');
  assert(Array.isArray(data.restored_files),  'restored_files doit être un tableau');
});

// S9 — Backups : GET /api/installer/backups → result=ok, backups[]
await smoke('S9 — Backups GET → result ok, backups[]', async () => {
  const res  = await fetchFn(`${BASE}/api/installer/backups`);
  assert(res.ok, `Backups HTTP ${res.status}`);
  const data = await res.json();
  assert(data.result === 'ok',               `result attendu 'ok', obtenu : ${data.result}`);
  assert(Array.isArray(data.backups),        'backups doit être un tableau');
  assert(typeof data.count === 'number',     'count doit être un nombre');
  assert(data.count === data.backups.length, 'count doit correspondre à backups.length');
  if (data.backups.length > 0) {
    const b = data.backups[0];
    assert('module_id'   in b, 'backup doit contenir module_id');
    assert('backup_name' in b, 'backup doit contenir backup_name');
    assert('timestamp'   in b, 'backup doit contenir timestamp');
    assert('files'       in b, 'backup doit contenir files');
  }
});

// S10 — Restore : POST /api/installer/restore avec backup_name explicite
await smoke('S10 — Restore POST backup_name explicite → result ok', async () => {
  let backup_name;
  if (MOCK_MODE) {
    backup_name = MOCK_BACKUPS[0].backup_name;
  } else {
    const listRes  = await fetchFn(`${BASE}/api/installer/backups?module_id=test_module`);
    if (!listRes.ok) { console.log('    (GET /backups échoué en live — skip S10)'); return; }
    const listData = await listRes.json();
    if (listData.backups.length === 0) { console.log('    (aucun backup test_module en live — skip S10)'); return; }
    backup_name = listData.backups[0].backup_name;
  }
  const res = await fetchFn(`${BASE}/api/installer/restore`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ module_id: 'test_module', backup_name }),
  });
  assert(res.ok, `Restore HTTP ${res.status}`);
  const data = await res.json();
  assert(data.result === 'ok',               `result attendu 'ok', obtenu : ${data.result}`);
  assert(typeof data.module_id === 'string', 'module_id doit être présent');
  assert(typeof data.backup_used === 'string', 'backup_used doit être présent');
  assert(data.backup_used === backup_name,   `backup_used attendu '${backup_name}', obtenu : ${data.backup_used}`);
  assert(Array.isArray(data.restored_files), 'restored_files doit être un tableau');
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
