#!/usr/bin/env node
/**
 * tests/data-sources-adopt.test.js
 * GO_LOCALCMS_DATA_SOURCES_ADOPT_01 — Tests adoption MOD_DATA_SOURCES_DATA
 * Run : node tests/data-sources-adopt.test.js
 *
 * Blocs testés :
 *   INIT (~2)  — chargement module
 *   M    (~6)  — identité (id, version, type, capabilities, meta)
 *   K    (~6)  — structure (forms 5 clés, conditions/validators/profile_bindings)
 *   F1   (~5)  — form database (15 champs) — IDs + types critiques
 *   F2   (~5)  — form api      (15 champs) — IDs + types critiques
 *   F3   (~4)  — form files    (13 champs) — IDs + types critiques
 *   F4   (~5)  — form images   (19 champs) — IDs + P0 + types
 *   F5   (~4)  — form computed (10 champs) — IDs + types
 *   TOT  (~4)  — 72 champs, IDs uniques, 3 sensitive, 3 password
 *   VAL  (~7)  — 5 validators (url + required)
 *   S    (~4)  — spot-check 3 champs sensitive F-15
 *
 * Correction cadrage : sensitive = 3 (ds_db_pass / ds_api_key / ds_img_secret)
 * Pattern DATA-ONLY : eval du const vers globalThis.
 * Aucun mock FN/BUS/DOM. Aucun patch HTML. Aucun __test_helpers.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

/* ── Chargement du module ─────────────────────────────────────── */

const src = fs.readFileSync(
  path.join(__dirname, '../modules/data-sources.js'), 'utf8'
);
// eslint-disable-next-line no-eval
eval(src.replace(/\bconst\s+MOD_DATA_SOURCES_DATA\b/, 'globalThis.MOD_DATA_SOURCES_DATA'));
const D = globalThis.MOD_DATA_SOURCES_DATA;

/* ── Harness ──────────────────────────────────────────────────── */

let _p = 0, _f = 0;
const test   = (label, fn) => {
  try   { fn(); process.stdout.write(`  ✓  ${label}\n`); _p++; }
  catch (e) { process.stderr.write(`  ✗  ${label}\n     → ${e.message}\n`); _f++; }
};
const assert = (c, m) => { if (!c) throw new Error(m ?? 'assertion échouée'); };

/* ── Helpers ──────────────────────────────────────────────────── */

const allFields = () =>
  Object.values(D.forms).flatMap(form =>
    form.sections.flatMap(s => s.fields)
  );

const fieldInForm = (formKey, id) =>
  (D.forms[formKey]?.sections ?? [])
    .flatMap(s => s.fields)
    .find(f => f.id === id);

const countInForm = (formKey) =>
  (D.forms[formKey]?.sections ?? [])
    .reduce((n, s) => n + s.fields.length, 0);

/* ═══════════════════════════════════════════════════════════════════ */

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  DATA_SOURCES ADOPT — Tests adoption MOD_DATA_SOURCES   ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

/* ── INIT ─────────────────────────────────────────────────────── */

console.log('INIT — Chargement module\n');

test('INIT01: MOD_DATA_SOURCES_DATA est un objet non-null', () =>
  assert(D !== null && typeof D === 'object' && !Array.isArray(D)));
test('INIT02: id = "data_sources"', () =>
  assert(D.id === 'data_sources', `obtenu: ${JSON.stringify(D.id)}`));

/* ── M — Identité ─────────────────────────────────────────────── */

console.log('\nM — Identité\n');

test('M01: version semver x.y.z', () =>
  assert(/^\d+\.\d+\.\d+$/.test(D.version ?? ''), `obtenu: ${D.version}`));
test('M02: type = "config"', () =>
  assert(D.type === 'config', `obtenu: ${D.type}`));
test('M03: capabilities inclut "render"', () =>
  assert((D.capabilities ?? []).includes('render')));
test('M04: capabilities inclut "generate"', () =>
  assert((D.capabilities ?? []).includes('generate')));
test('M05: meta.activeDefault = "database"', () =>
  assert(D.meta?.activeDefault === 'database', `obtenu: ${D.meta?.activeDefault}`));
test('M06: meta.typeLabels.api = "API/REST"', () =>
  assert(D.meta?.typeLabels?.api === 'API/REST'));

/* ── K — Structure ────────────────────────────────────────────── */

console.log('\nK — Structure\n');

test('K01: forms est un objet (non-Array)', () =>
  assert(D.forms && typeof D.forms === 'object' && !Array.isArray(D.forms)));
test('K02: exactement 5 forms déclarés', () =>
  assert(Object.keys(D.forms).length === 5,
    `attendu 5, obtenu ${Object.keys(D.forms).length}`));
test('K03: clés forms = database/api/files/images/computed', () => {
  const expected = ['database','api','files','images','computed'];
  const keys = Object.keys(D.forms);
  assert(expected.every(k => keys.includes(k)),
    `manquantes: ${expected.filter(k => !keys.includes(k)).join(', ')}`);
});
test('K04: conditions[] vide', () =>
  assert(Array.isArray(D.conditions) && D.conditions.length === 0));
test('K05: validators[] — 5 entrées', () =>
  assert(Array.isArray(D.validators) && D.validators.length === 5,
    `attendu 5, obtenu ${D.validators?.length}`));
test('K06: profile_bindings[] vide', () =>
  assert(Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0));

/* ── F1 — form database ───────────────────────────────────────── */

console.log('\nF1 — form database (15 champs)\n');

test('F1-01: 15 champs dans database', () => {
  const n = countInForm('database');
  assert(n === 15, `attendu 15, obtenu ${n}`);
});
test('F1-02: ds_db_type — select, value "postgresql"', () => {
  const f = fieldInForm('database', 'ds_db_type');
  assert(f && f.type === 'select' && f.value === 'postgresql');
});
test('F1-03: ds_db_host — text, value "localhost"', () => {
  const f = fieldInForm('database', 'ds_db_host');
  assert(f && f.type === 'text' && f.value === 'localhost');
});
test('F1-04: ds_db_port — number, value "5432"', () => {
  const f = fieldInForm('database', 'ds_db_port');
  assert(f && f.type === 'number' && f.value === '5432');
});
test('F1-05: ds_db_enabled — toggle, value true', () => {
  const f = fieldInForm('database', 'ds_db_enabled');
  assert(f && f.type === 'toggle' && f.value === true);
});

/* ── F2 — form api ────────────────────────────────────────────── */

console.log('\nF2 — form api (15 champs)\n');

test('F2-01: 15 champs dans api', () => {
  const n = countInForm('api');
  assert(n === 15, `attendu 15, obtenu ${n}`);
});
test('F2-02: ds_api_url — type url, value vide', () => {
  const f = fieldInForm('api', 'ds_api_url');
  assert(f && f.type === 'url' && f.value === '', `type=${f?.type} value=${f?.value}`);
});
test('F2-03: ds_api_type — select, value "rest"', () => {
  const f = fieldInForm('api', 'ds_api_type');
  assert(f && f.type === 'select' && f.value === 'rest');
});
test('F2-04: ds_api_auth — select, options inclut bearer/oauth2', () => {
  const f = fieldInForm('api', 'ds_api_auth');
  assert(f && f.type === 'select');
  assert(['bearer','oauth2','none'].every(o => f.options.includes(o)));
});
test('F2-05: ds_api_enabled — toggle, value true', () => {
  const f = fieldInForm('api', 'ds_api_enabled');
  assert(f && f.type === 'toggle' && f.value === true);
});

/* ── F3 — form files ──────────────────────────────────────────── */

console.log('\nF3 — form files (13 champs)\n');

test('F3-01: 13 champs dans files', () => {
  const n = countInForm('files');
  assert(n === 13, `attendu 13, obtenu ${n}`);
});
test('F3-02: ds_f_type — select, value "file"', () => {
  const f = fieldInForm('files', 'ds_f_type');
  assert(f && f.type === 'select' && f.value === 'file');
});
test('F3-03: ds_f_path — value vide, placeholder neutre (P0)', () => {
  const f = fieldInForm('files', 'ds_f_path');
  assert(f && f.value === '' && f.placeholder === '<chemin-ou-uri>',
    `value=${f?.value} placeholder=${f?.placeholder}`);
});
test('F3-04: ds_f_watch — toggle, value true', () => {
  const f = fieldInForm('files', 'ds_f_watch');
  assert(f && f.type === 'toggle' && f.value === true);
});

/* ── F4 — form images ─────────────────────────────────────────── */

console.log('\nF4 — form images (19 champs)\n');

test('F4-01: 19 champs dans images', () => {
  const n = countInForm('images');
  assert(n === 19, `attendu 19, obtenu ${n}`);
});
test('F4-02: ds_img_storage — select, value "local"', () => {
  const f = fieldInForm('images', 'ds_img_storage');
  assert(f && f.type === 'select' && f.value === 'local');
});
test('F4-03: ds_img_path — value vide (P0 — chemin relatif vidé)', () => {
  const f = fieldInForm('images', 'ds_img_path');
  assert(f && f.value === '', `obtenu: ${f?.value}`);
});
test('F4-04: ds_img_cdn_url — type url, placeholder neutre (P0)', () => {
  const f = fieldInForm('images', 'ds_img_cdn_url');
  assert(f && f.type === 'url' && f.placeholder === '<cdn-url>',
    `type=${f?.type} placeholder=${f?.placeholder}`);
});
test('F4-05: ds_img_prefix — value vide (P0 — "uploads/" vidé)', () => {
  const f = fieldInForm('images', 'ds_img_prefix');
  assert(f && f.value === '', `obtenu: ${f?.value}`);
});

/* ── F5 — form computed ───────────────────────────────────────── */

console.log('\nF5 — form computed (10 champs)\n');

test('F5-01: 10 champs dans computed', () => {
  const n = countInForm('computed');
  assert(n === 10, `attendu 10, obtenu ${n}`);
});
test('F5-02: ds_c_method — select, value "average"', () => {
  const f = fieldInForm('computed', 'ds_c_method');
  assert(f && f.type === 'select' && f.value === 'average');
});
test('F5-03: ds_c_output — select, options inclut number/percent/json', () => {
  const f = fieldInForm('computed', 'ds_c_output');
  assert(f && f.type === 'select');
  assert(['number','percent','json'].every(o => f.options.includes(o)));
});
test('F5-04: ds_c_refresh — number, value "30"', () => {
  const f = fieldInForm('computed', 'ds_c_refresh');
  assert(f && f.type === 'number' && f.value === '30');
});

/* ── TOT — total champs ───────────────────────────────────────── */

console.log('\nTOT — Total champs\n');

test('TOT01: 72 champs au total (15+15+13+19+10)', () => {
  const n = allFields().length;
  assert(n === 72, `attendu 72, obtenu ${n}`);
});
test('TOT02: tous les champs ont un id string non vide', () => {
  const bad = allFields().filter(f => !f.id || typeof f.id !== 'string');
  assert(bad.length === 0, `${bad.length} champ(s) sans id valide`);
});
test('TOT03: exactement 3 champs sensitive:true (F-15)', () => {
  const sens = allFields().filter(f => f.sensitive === true);
  assert(sens.length === 3,
    `attendu 3, obtenu ${sens.length} : ${sens.map(f=>f.id).join(', ')}`);
});
test('TOT04: exactement 3 champs type=password', () => {
  const pwd = allFields().filter(f => f.type === 'password');
  assert(pwd.length === 3,
    `attendu 3, obtenu ${pwd.length} : ${pwd.map(f=>f.id).join(', ')}`);
});

/* ── VAL — validators ─────────────────────────────────────────── */

console.log('\nVAL — validators\n');

test('VAL01: validators est tableau', () =>
  assert(Array.isArray(D.validators)));
test('VAL02: 5 entrées validators', () =>
  assert(D.validators.length === 5, `attendu 5, obtenu ${D.validators.length}`));
test('VAL03: ds_api_url — url:true', () => {
  const v = D.validators.find(x => x.field === 'ds_api_url');
  assert(v?.url === true, `entrée: ${JSON.stringify(v)}`);
});
test('VAL04: ds_db_host — required:true', () => {
  const v = D.validators.find(x => x.field === 'ds_db_host');
  assert(v?.required === true, `entrée: ${JSON.stringify(v)}`);
});
test('VAL05: ds_api_name — required:true', () => {
  const v = D.validators.find(x => x.field === 'ds_api_name');
  assert(v?.required === true, `entrée: ${JSON.stringify(v)}`);
});
test('VAL06: ds_img_endpoint — url:true', () => {
  const v = D.validators.find(x => x.field === 'ds_img_endpoint');
  assert(v?.url === true, `entrée: ${JSON.stringify(v)}`);
});
test('VAL07: ds_img_cdn_url — url:true', () => {
  const v = D.validators.find(x => x.field === 'ds_img_cdn_url');
  assert(v?.url === true, `entrée: ${JSON.stringify(v)}`);
});

/* ── S — sensitive F-15 ───────────────────────────────────────── */

console.log('\nS — sensitive F-15\n');

test('S01: ds_db_pass — password + sensitive (database)', () => {
  const f = fieldInForm('database', 'ds_db_pass');
  assert(f && f.type === 'password' && f.sensitive === true,
    `type=${f?.type} sensitive=${f?.sensitive}`);
});
test('S02: ds_api_key — password + sensitive (api)', () => {
  const f = fieldInForm('api', 'ds_api_key');
  assert(f && f.type === 'password' && f.sensitive === true,
    `type=${f?.type} sensitive=${f?.sensitive}`);
});
test('S03: ds_img_secret — password + sensitive (images)', () => {
  const f = fieldInForm('images', 'ds_img_secret');
  assert(f && f.type === 'password' && f.sensitive === true,
    `type=${f?.type} sensitive=${f?.sensitive}`);
});
test('S04: aucun autre champ sensitive hors ds_db_pass/ds_api_key/ds_img_secret', () => {
  const ids = allFields().filter(f => f.sensitive === true).map(f => f.id);
  const expected = new Set(['ds_db_pass','ds_api_key','ds_img_secret']);
  const extra = ids.filter(id => !expected.has(id));
  assert(extra.length === 0, `sensitive inattendus: ${extra.join(', ')}`);
});

/* ── Résumé ───────────────────────────────────────────────────── */

const w = 58;
console.log(`\n${'═'.repeat(w)}`);
console.log(`  Résultat : ${_p + _f} tests — ${_p} ✓  ${_f > 0 ? _f + ' ✗' : '0 ✗'}`);
if (_f > 0) {
  console.error(`  STATUT : FAILED (${_f} échec(s))\n`);
  process.exit(1);
}
console.log('  STATUT : PASS\n');
