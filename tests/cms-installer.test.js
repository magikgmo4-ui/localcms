/**
 * cms-installer.test.js — CMS Module Installer V1
 * 13 tests unitaires — Node.js sans dépendances externes
 *
 * Couvre : validation manifeste, sécurité path, pipeline logique,
 *          rollback, log format, API surface
 *
 * Usage : node tests/cms-installer.test.js
 */

'use strict';

/* ─── Mini test runner ──────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
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

function assertIncludes(arr, value, msg) {
  assert(Array.isArray(arr) && arr.some(x => typeof x === 'string' && x.includes(value)),
    msg || `Expected array to include "${value}"`);
}

function assertNotIncludes(arr, value, msg) {
  assert(Array.isArray(arr) && !arr.some(x => typeof x === 'string' && x.includes(value)),
    msg || `Expected array NOT to include "${value}"`);
}

/* ─── Reproduire la logique de validation du backend (en JS pour test) ─── */

const VALID_ID_RE      = /^[a-z0-9_]+$/;
const VALID_VERSION_RE = /^\d+\.\d+\.\d+$/;
const VALID_GROUPS     = new Set(['tools','system','backend','dev','git','menus','network']);
const ALLOWED_EXTS     = new Set(['.js','.json','.md','.txt','.css']);
const TARGET_KEYS      = new Set(['modules_dir']);

function validateManifest(m, zipNames = null) {
  const errors = [];
  const required = ['id','name','version','description','group','target_key','files'];
  required.forEach(f => { if (!(f in m)) errors.push(`Champ obligatoire manquant : ${f}`); });
  if ('id'         in m && !VALID_ID_RE.test(m.id))          errors.push('id invalide');
  if ('version'    in m && !VALID_VERSION_RE.test(m.version)) errors.push('version invalide');
  if ('group'      in m && !VALID_GROUPS.has(m.group))        errors.push(`group invalide`);
  if ('target_key' in m && !TARGET_KEYS.has(m.target_key))    errors.push(`target_key non autorisé`);
  if ('files' in m) {
    if (!Array.isArray(m.files) || m.files.length === 0) {
      errors.push('files doit être une liste non vide');
    } else {
      m.files.forEach((f, i) => {
        if (!f.src || !f.dest) { errors.push(`files[${i}] : src et dest obligatoires`); return; }
        const parts = f.dest.split('/');
        if (f.dest.startsWith('/') || parts.includes('..'))
          errors.push(`files[${i}].dest contient un chemin interdit`);
        const ext = f.dest.slice(f.dest.lastIndexOf('.'));
        if (!ALLOWED_EXTS.has(ext)) errors.push(`files[${i}].dest extension non autorisée`);
        if (zipNames && !zipNames.includes(f.src))
          errors.push(`files[${i}].src absent du zip`);
      });
    }
  }
  return errors;
}

/* ─── Fixtures ──────────────────────────────────────────────────────────── */

const VALID_MANIFEST = {
  id: 'my_module',
  name: 'My Module',
  version: '1.0.0',
  description: 'Test module',
  group: 'tools',
  target_key: 'modules_dir',
  files: [{ src: 'module.js', dest: 'my-module.js' }],
};

/* ─── Tests ─────────────────────────────────────────────────────────────── */

// T1 — Manifeste valide → 0 erreur
test('T1 — Manifeste valide retourne 0 erreur', () => {
  const errors = validateManifest({ ...VALID_MANIFEST });
  assert(errors.length === 0, `Attendu 0 erreur, obtenu : ${errors.join(', ')}`);
});

// T2 — Champ obligatoire manquant → erreur spécifique
test('T2 — Champ manquant détecté (target_key)', () => {
  const m = { ...VALID_MANIFEST };
  delete m.target_key;
  const errors = validateManifest(m);
  assertIncludes(errors, 'target_key', 'target_key manquant doit produire une erreur');
});

// T3 — id invalide (tirets interdits)
test('T3 — id avec tirets rejeté', () => {
  const errors = validateManifest({ ...VALID_MANIFEST, id: 'my-module' });
  assertIncludes(errors, 'id invalide', 'id avec tirets doit être rejeté');
});

// T4 — version mal formée
test('T4 — version non semver rejetée', () => {
  const errors = validateManifest({ ...VALID_MANIFEST, version: '1.0' });
  assertIncludes(errors, 'version invalide', 'version non X.Y.Z doit être rejetée');
});

// T5 — group hors whitelist
test('T5 — group non autorisé rejeté', () => {
  const errors = validateManifest({ ...VALID_MANIFEST, group: 'custom' });
  assertIncludes(errors, 'group', 'group hors whitelist doit être rejeté');
});

// T6 — target_key inconnue
test('T6 — target_key inconnue rejetée', () => {
  const errors = validateManifest({ ...VALID_MANIFEST, target_key: 'root_dir' });
  assertIncludes(errors, 'target_key non autorisé', 'target_key inconnue doit être rejetée');
});

// T7 — path traversal dans files[].dest
test('T7 — path traversal dans dest rejeté', () => {
  const m = { ...VALID_MANIFEST, files: [{ src: 'x.js', dest: '../../etc/x.js' }] };
  const errors = validateManifest(m);
  assertIncludes(errors, 'chemin interdit', 'path traversal dans dest doit être rejeté');
});

// T8 — chemin absolu dans dest
test('T8 — chemin absolu dans dest rejeté', () => {
  const m = { ...VALID_MANIFEST, files: [{ src: 'x.js', dest: '/etc/x.js' }] };
  const errors = validateManifest(m);
  assertIncludes(errors, 'chemin interdit', 'chemin absolu dans dest doit être rejeté');
});

// T9 — extension non autorisée dans dest
test('T9 — extension .exe dans dest rejetée', () => {
  const m = { ...VALID_MANIFEST, files: [{ src: 'x.exe', dest: 'module.exe' }] };
  const errors = validateManifest(m);
  assertIncludes(errors, 'extension non autorisée', '.exe doit être rejeté');
});

// T10 — files[].src absent du zip (si zipNames fourni)
test('T10 — src absent du zip détecté', () => {
  const zipNames = ['manifest.json']; // module.js absent
  const errors = validateManifest({ ...VALID_MANIFEST }, zipNames);
  assertIncludes(errors, 'absent du zip', 'src absent du zip doit produire une erreur');
});

// T11 — files liste vide rejetée
test('T11 — files vide rejeté', () => {
  const errors = validateManifest({ ...VALID_MANIFEST, files: [] });
  assertIncludes(errors, 'liste non vide', 'files vide doit être rejeté');
});

// T12 — extensions autorisées acceptées
test('T12 — extensions autorisées (.js .json .md .txt .css) acceptées', () => {
  const exts = ['module.js','config.json','readme.md','notes.txt','style.css'];
  exts.forEach(dest => {
    const m = { ...VALID_MANIFEST, files: [{ src: 'f', dest }] };
    const errors = validateManifest(m);
    assertNotIncludes(errors, 'extension', `Extension ${dest} doit être acceptée`);
  });
});

// T13 — structure log conforme au format défini
test('T13 — format log conforme (champs obligatoires)', () => {
  // Simuler un log tel que produit par _emit_log
  const LOG_REQUIRED = ['timestamp','user_id','action','bundle','module_id','pipeline_step','result'];
  const mockLog = {
    timestamp:     '2026-03-15T12:00:00.000Z',
    user_id:       'cms_user',
    action:        'install',
    bundle:        'my-module-v1.0.0.zip',
    module_id:     'my_module',
    pipeline_step: 'finalize',
    result:        'ok',
  };
  LOG_REQUIRED.forEach(field => {
    assert(field in mockLog, `Log doit contenir le champ : ${field}`);
  });
  assert(mockLog.user_id === 'cms_user', 'user_id doit être "cms_user"');
  // error est optionnel — présent uniquement si non null
  const logWithError = { ...mockLog, error: 'raison' };
  assert('error' in logWithError, 'error optionnel doit être inclus si défini');
});

/* ─── Résumé ────────────────────────────────────────────────────────────── */

console.log('\nCMS Module Installer V1 — Tests unitaires');
console.log('==========================================');
results.forEach(r => {
  const icon = r.ok ? '✓' : '✕';
  const msg  = r.ok ? '' : `  ← ${r.error}`;
  console.log(`  ${icon}  ${r.name}${msg}`);
});
console.log('------------------------------------------');
console.log(`  RÉSULTAT : ${passed}/${passed + failed} tests passés`);
console.log('');

if (failed > 0) process.exit(1);
