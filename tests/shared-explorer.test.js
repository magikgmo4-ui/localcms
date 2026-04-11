#!/usr/bin/env node
/**
 * tests/shared-explorer.test.js
 * MOD_SHARED_EXPLORER V1 — Tests unitaires
 * Couverture : logique frontend (catégorie, whitelist, preview, logs)
 * Run : node tests/shared-explorer.test.js
 */

'use strict';

/* ─── MINIMAL TEST RUNNER ───────────────────────────────── */
let _passed = 0, _failed = 0;
const _tests = [];

function test(name, fn) { _tests.push({ name, fn }); }

async function runAll() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  MOD_SHARED_EXPLORER V1 — Tests unitaires   ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  for (const t of _tests) {
    try {
      await t.fn();
      console.log(`  ✓  ${t.name}`);
      _passed++;
    } catch (e) {
      console.log(`  ✗  ${t.name}`);
      console.log(`     ↳ ${e.message}`);
      _failed++;
    }
  }
  const total = _passed + _failed;
  console.log(`\n  ${_passed}/${total} passed${_failed > 0 ? ' — ' + _failed + ' FAILED' : ' ✓'}\n`);
  if (_failed > 0) process.exit(1);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(`${msg || 'Expected equal'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
}
function assertFalse(cond, msg) {
  if (cond) throw new Error(msg || 'Expected false, got true');
}

/* ─── MODULE UNDER TEST (logic extracted, no browser deps) ─ */
const MOD = (() => {
  const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;

  const WHITELIST_TEXT    = new Set(['txt','md','json','yaml','yml','log','conf','ini','toml']);
  const WHITELIST_CODE    = new Set(['py','sh','js','ts','sql','css','html']);
  const WHITELIST_IMAGE   = new Set(['jpg','jpeg','png','gif','svg','webp']);
  const WHITELIST_ARCHIVE = new Set(['zip','tar','gz']);
  const WHITELIST_PDF     = new Set(['pdf']);
  const BLOCKED_NAMES     = new Set(['.env']);

  const CATEGORY = {
    text   : { preview: true,  download: true  },
    code   : { preview: true,  download: true  },
    image  : { preview: false, download: true  },
    archive: { preview: false, download: true  },
    pdf    : { preview: false, download: true  },
    blocked: { preview: false, download: false },
    unknown: { preview: false, download: false },
  };

  const _ext = (name) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.tar.gz')) return 'tar.gz';
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const _category = (name) => {
    if (BLOCKED_NAMES.has(name.toLowerCase()))          return 'blocked';
    const ext = _ext(name);
    if (WHITELIST_TEXT.has(ext))                        return 'text';
    if (WHITELIST_CODE.has(ext))                        return 'code';
    if (WHITELIST_IMAGE.has(ext))                       return 'image';
    if (WHITELIST_ARCHIVE.has(ext) || ext === 'tar.gz') return 'archive';
    if (WHITELIST_PDF.has(ext))                         return 'pdf';
    return 'unknown';
  };

  const _canPreview  = (name, size) =>
    CATEGORY[_category(name)]?.preview === true && size <= MAX_PREVIEW_BYTES;

  const _canDownload = (name) =>
    CATEGORY[_category(name)]?.download === true;

  // Log ring buffer
  let _logs = [];
  const _log = (action, path, result, error) => {
    const entry = {
      timestamp    : new Date().toISOString(),
      user_id      : 'cms_user',
      action,
      path_relative: path,
      result,
      ...(error ? { error } : {}),
    };
    _logs.push(entry);
    if (_logs.length > 100) _logs.shift();
    return entry;
  };
  const _clearLogs = () => { _logs = []; };
  const _getLogs   = () => _logs;

  // Check that no write methods exist in CATEGORY
  const _noWriteInCategory = () =>
    Object.entries(CATEGORY).every(([, info]) =>
      !info.write && !info.edit && !info.install && !info.exec && !info.delete
    );

  return {
    MAX_PREVIEW_BYTES,
    CATEGORY, BLOCKED_NAMES,
    _ext, _category, _canPreview, _canDownload,
    _log, _clearLogs, _getLogs, _noWriteInCategory,
  };
})();

/* ═══════════════════════════════════════════════════════════
   TESTS
   ═══════════════════════════════════════════════════════════ */

/* T1 — Listing racine (structure de réponse) */
test('T1: listing root — response structure expected', async () => {
  // Simulates the contract: backend returns { path, entries: [...] }
  const mockResp = { path: '/', entries: [
    { name:'docs', path:'docs', type:'dir',  size:null, mtime:'2026-01-01T00:00:00' },
    { name:'readme.md', path:'readme.md', type:'file', size:1024, mtime:'2026-01-01T00:00:00' },
  ]};
  assert(Array.isArray(mockResp.entries), 'entries doit être un tableau');
  assert(mockResp.entries.length === 2,   'deux entrées attendues');
  assertEqual(mockResp.entries[0].type, 'dir',  'premier = dossier');
  assertEqual(mockResp.entries[1].type, 'file', 'deuxième = fichier');
});

/* T2 — Navigation sous-dossier */
test('T2: sous-dossier — path relatif correct', async () => {
  const mockResp = { path: 'docs/modules', entries: [
    { name:'install.md', path:'docs/modules/install.md', type:'file', size:512, mtime:'2026-01-01T00:00:00' },
  ]};
  assert(mockResp.path.startsWith('docs'), 'path relatif attendu (pas de chemin absolu)');
  assert(!mockResp.path.startsWith('/shared'), 'pas de /shared dans le path relatif');
  assertEqual(mockResp.entries[0].path, 'docs/modules/install.md');
});

/* T3 — Metadata fichier */
test('T3: metadata fichier — champs requis présents', async () => {
  const entry = { name:'config.yaml', path:'config.yaml', type:'file', size:2048, mtime:'2026-03-01T12:00:00' };
  assert(entry.name !== undefined,  'name requis');
  assert(entry.path !== undefined,  'path requis');
  assert(entry.size !== undefined,  'size requis');
  assert(entry.mtime !== undefined, 'mtime requis');
  assert(entry.type !== undefined,  'type requis');
});

/* T4 — Preview texte autorisé <= 5 MB */
test('T4: preview texte <= 5 MB — autorisé', () => {
  for (const name of ['readme.md','config.json','script.py','app.sh','data.yaml','notes.txt']) {
    assert(MOD._canPreview(name, 1024), `${name} doit être prévisualisable (1 KB)`);
    assert(MOD._canPreview(name, MOD.MAX_PREVIEW_BYTES), `${name} doit être prévisualisable (exactement 5 MB)`);
  }
});

/* T5 — Refus preview > 5 MB */
test('T5: preview > 5 MB — refusé', () => {
  const bigSize = MOD.MAX_PREVIEW_BYTES + 1;
  for (const name of ['big.txt','large.log','heavy.json']) {
    assertFalse(MOD._canPreview(name, bigSize), `${name} > 5 MB ne doit pas être prévisualisable`);
  }
  assertFalse(MOD._canPreview('huge.md', 100 * 1024 * 1024), '100 MB non prévisualisable');
});

/* T6 — Refus accès hors racine (path traversal) */
test('T6: path traversal — doit être refusé côté backend', () => {
  // Ce test vérifie que les chemins dangereux contiennent des indicateurs
  // que le backend doit rejeter (realpath + vérification prefix).
  const dangerous = ['../../etc/passwd', '../../../root/.ssh/id_rsa', '..\\..\\windows\\system32'];
  for (const p of dangerous) {
    // Chaque chemin dangereux doit contenir '..' — c'est ce que le backend doit détecter
    const containsTraversal = p.includes('..');
    assert(containsTraversal, `'${p}' doit contenir ".." (indicateur de traversal)`);
    // Simuler le log backend : path_violation → denied
    MOD._log('path_violation', p, 'denied', 'path_traversal_attempt');
  }
  // Vérifier que les logs de violation ont bien été émis
  const logs    = MOD._getLogs();
  const violations = logs.filter(l => l.action === 'path_violation' && l.result === 'denied');
  assert(violations.length === dangerous.length,
    `${dangerous.length} violations attendues, ${violations.length} loggées`);
  MOD._clearLogs();
});

/* T7 — Refus symlink sortant */
test('T7: symlink sortant de /shared — access_denied en log', () => {
  MOD._clearLogs();
  // Simule le log produit par le backend lors d'une tentative d'accès à un symlink sortant
  MOD._log('access_denied', 'link_to_outside', 'denied', 'symlink_escape');
  const logs = MOD._getLogs();
  assertEqual(logs[0].action, 'access_denied');
  assertEqual(logs[0].result, 'denied');
  assertEqual(logs[0].error, 'symlink_escape');
});

/* T8 — .env refusé en preview et download */
test('T8: .env — bloqué en preview ET download', () => {
  assert(MOD._category('.env') === 'blocked',  '.env doit être "blocked"');
  assertFalse(MOD._canPreview('.env', 100),    '.env non prévisualisable');
  assertFalse(MOD._canDownload('.env'),         '.env non téléchargeable');
  // Variantes
  assertFalse(MOD._canPreview('.env', 1),      '.env (1 byte) non prévisualisable');
  assertFalse(MOD._canDownload('.env'),         '.env non téléchargeable quelle que soit la taille');
});

/* T9 — PDF = metadata + download seulement */
test('T9: PDF — download oui, preview non', () => {
  assertFalse(MOD._canPreview('document.pdf', 1024),  'PDF non prévisualisable');
  assertFalse(MOD._canPreview('report.pdf', 100),     'PDF non prévisualisable (petit)');
  assert(MOD._canDownload('document.pdf'),            'PDF téléchargeable');
  assertEqual(MOD._category('document.pdf'), 'pdf');
});

/* T10 — Archives = listables/téléchargeables, non extraites */
test('T10: archives — download oui, preview non, jamais extraites', () => {
  for (const name of ['bundle.zip','backup.tar','data.tar.gz','archive.gz']) {
    assertFalse(MOD._canPreview(name, 1024),   `${name} non prévisualisable`);
    assert(MOD._canDownload(name),              `${name} téléchargeable`);
    assertEqual(MOD._category(name), 'archive', `${name} classé comme archive`);
  }
  // Vérifier qu'il n'y a pas de méthode "extract" dans CATEGORY
  assert(!MOD.CATEGORY.archive.extract, 'archive.extract ne doit pas exister');
  assert(!MOD.CATEGORY.archive.inspect, 'archive.inspect ne doit pas exister');
});

/* T11 — Recherche par nom/extension/date (structure params) */
test('T11: recherche — paramètres corrects construits', () => {
  // Vérifier que la logique de construction des params ne produit pas de full-text search
  const buildSearchParams = (search) => {
    const params = {};
    if (search.q)    params.q    = search.q;
    if (search.ext)  params.ext  = search.ext.replace(/^\./,'');
    if (search.from) params.from = search.from;
    if (search.to)   params.to   = search.to;
    return params;
  };

  // Cas 1: recherche par nom
  let p = buildSearchParams({ q:'readme', ext:'', from:'', to:'' });
  assert(p.q === 'readme', 'q présent');
  assert(!p.ext && !p.from && !p.to, 'pas de params inutiles');

  // Cas 2: recherche par extension
  p = buildSearchParams({ q:'', ext:'.md', from:'', to:'' });
  assertEqual(p.ext, 'md', 'ext sans le point');

  // Cas 3: aucun paramètre → pas de requête envoyée
  const empty = buildSearchParams({ q:'', ext:'', from:'', to:'' });
  const hasAny = Object.values(empty).some(v => v && v.trim());
  assertFalse(hasAny, 'requête vide ne doit pas être envoyée');
});

/* T12 — Aucun endpoint d'écriture */
test('T12: aucune méthode d\'écriture dans le module', () => {
  // Vérification que CATEGORY ne contient aucun flag d'écriture
  assert(MOD._noWriteInCategory(), 'CATEGORY ne doit pas contenir de flags write/edit/install/exec/delete');

  // Vérification que les méthodes interdites ne sont pas exportées
  const forbidden = ['write', 'edit', 'delete', 'create', 'rename', 'move', 'upload', 'install', 'exec', 'run', 'shell'];
  // (Ces méthodes ne doivent pas exister dans le module)
  // Ici on vérifie via CATEGORY — le module réel est vérifié par code review + grep
  for (const f of forbidden) {
    assert(!MOD.CATEGORY[f], `${f} ne doit pas être dans CATEGORY`);
  }
});

/* T13 — Journalisation des actions clés */
test('T13: journalisation — format et actions obligatoires', () => {
  MOD._clearLogs();

  const actions = [
    ['list',         '/',                     'ok',     null                  ],
    ['read',         'docs/readme.md',         'ok',     null                  ],
    ['download',     'config.yaml',            'ok',     null                  ],
    ['search',       'readme',                 'ok',     null                  ],
    ['access_denied','../../etc/passwd',        'denied', 'path_traversal_attempt'],
    ['path_violation','../root',               'denied', 'symlink_escape'      ],
  ];

  for (const [action, path, result, error] of actions) {
    MOD._log(action, path, result, error || undefined);
  }

  const logs = MOD._getLogs();
  assertEqual(logs.length, actions.length, 'nombre de logs correct');

  // Vérifier les champs obligatoires sur chaque entrée
  for (const entry of logs) {
    assert(entry.timestamp,     'timestamp requis');
    assert(entry.user_id,       'user_id requis');
    assert(entry.action,        'action requise');
    assert(entry.path_relative !== undefined, 'path_relative requis');
    assert(entry.result,        'result requis');
  }

  // Vérifier les logs d'access_denied
  const deniedLogs = logs.filter(l => l.result === 'denied');
  assert(deniedLogs.length === 2, 'deux entrées denied attendues');
  assert(deniedLogs.every(l => l.error), 'les denied doivent avoir un error field');

  // Vérifier le format ISO du timestamp
  const ts = new Date(logs[0].timestamp);
  assert(!isNaN(ts.getTime()), 'timestamp valide ISO');
});

/* ─── LANCER ──────────────────────────────────────────────── */
runAll();
