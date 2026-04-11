#!/usr/bin/env node
/**
 * tests/env-global-adopt.test.js
 * GO_LOCALCMS_ENV_GLOBAL_ADOPT_01 — Tests adoption MOD_ENV_GLOBAL_DATA
 * Run : node tests/env-global-adopt.test.js
 *
 * Blocs testés :
 *   INIT (~2)  — chargement module
 *   M    (~6)  — identité (id, version, type, capabilities, os_compat, interfaces, meta)
 *   K    (~6)  — structure (groups 3 clés, conditions/validators/profile_bindings, no forms)
 *   G1   (~9)  — groupe machines : 9 champs — IDs, types, valeurs P0
 *   G2   (~9)  — groupe shared_env : 9 champs — IDs, types, valeurs conservées
 *   G3   (~7)  — groupe network : 7 champs — IDs, valeurs P0, standard
 *   TOT  (~5)  — 25 champs totaux, IDs conformes, 0 sensitive, 0 password
 *   VAL  (~5)  — validators : 3 entrées required
 *
 * Pattern DATA-ONLY : eval du const vers globalThis.
 * Aucun mock FN/BUS/DOM. Aucun patch HTML. Aucun __test_helpers.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

/* ── Chargement du module ─────────────────────────────────────── */

const src = fs.readFileSync(
  path.join(__dirname, '../modules/env-global.js'), 'utf8'
);
// eslint-disable-next-line no-eval
eval(src.replace(/\bconst\s+MOD_ENV_GLOBAL_DATA\b/, 'globalThis.MOD_ENV_GLOBAL_DATA'));
const D = globalThis.MOD_ENV_GLOBAL_DATA;

/* ── Harness ──────────────────────────────────────────────────── */

let _p = 0, _f = 0;
const test   = (label, fn) => {
  try   { fn(); process.stdout.write(`  ✓  ${label}\n`); _p++; }
  catch (e) { process.stderr.write(`  ✗  ${label}\n     → ${e.message}\n`); _f++; }
};
const assert = (c, m) => { if (!c) throw new Error(m ?? 'assertion échouée'); };

/* ── Helpers ──────────────────────────────────────────────────── */

const allFields = () => Object.values(D.groups).flatMap(g => g.fields);
const fieldInGroup = (group, id) => (D.groups[group]?.fields ?? []).find(f => f.id === id);

/* ═══════════════════════════════════════════════════════════════════ */

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  ENV_GLOBAL ADOPT — Tests adoption MOD_ENV_GLOBAL_DATA ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

/* ── INIT ─────────────────────────────────────────────────────── */

console.log('INIT — Chargement module\n');

test('INIT01: MOD_ENV_GLOBAL_DATA est un objet non-null', () =>
  assert(D !== null && typeof D === 'object' && !Array.isArray(D)));
test('INIT02: id = "env_global"', () =>
  assert(D.id === 'env_global', `obtenu: ${JSON.stringify(D.id)}`));

/* ── M — Identité ─────────────────────────────────────────────── */

console.log('\nM — Identité\n');

test('M01: version semver x.y.z', () =>
  assert(/^\d+\.\d+\.\d+$/.test(D.version ?? ''), `obtenu: ${D.version}`));
test('M02: type = "config"', () =>
  assert(D.type === 'config', `obtenu: ${D.type}`));
test('M03: capabilities inclut "render"', () =>
  assert((D.capabilities ?? []).includes('render')));
test('M04: os_compat inclut "all"', () =>
  assert((D.os_compat ?? []).includes('all')));
test('M05: interfaces inclut "config"', () =>
  assert((D.interfaces ?? []).includes('config')));
test('M06: meta.activeDefault = "machines"', () =>
  assert(D.meta?.activeDefault === 'machines', `obtenu: ${D.meta?.activeDefault}`));

/* ── K — Structure ────────────────────────────────────────────── */

console.log('\nK — Structure\n');

test('K01: groups est un objet (non-Array)', () =>
  assert(D.groups && typeof D.groups === 'object' && !Array.isArray(D.groups)));
test('K02: exactement 3 groupes déclarés', () =>
  assert(Object.keys(D.groups).length === 3,
    `attendu 3, obtenu ${Object.keys(D.groups).length}`));
test('K03: clés groups = machines / shared_env / network', () => {
  const keys = Object.keys(D.groups);
  assert(
    keys.includes('machines') && keys.includes('shared_env') && keys.includes('network'),
    `clés obtenues: ${keys.join(', ')}`
  );
});
test('K04: conditions[] vide', () =>
  assert(Array.isArray(D.conditions) && D.conditions.length === 0,
    `longueur: ${D.conditions?.length}`));
test('K05: profile_bindings[] vide', () =>
  assert(Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0,
    `longueur: ${D.profile_bindings?.length}`));
test('K06: pas de clé "forms" (structure GROUPS, non FORMS)', () =>
  assert(!('forms' in D)));

/* ── G1 — groupe machines ─────────────────────────────────────── */

console.log('\nG1 — groupe machines (9 champs)\n');

test('G1-01: groupe machines présent', () =>
  assert(D.groups.machines && typeof D.groups.machines === 'object'));
test('G1-02: 9 champs', () => {
  const n = D.groups.machines.fields?.length ?? 0;
  assert(n === 9, `attendu 9, obtenu ${n}`);
});
test('G1-03: eg_m_name — type text, value vide (P0)', () => {
  const f = fieldInGroup('machines', 'eg_m_name');
  assert(f && f.type === 'text' && f.value === '', `f=${JSON.stringify(f)}`);
});
test('G1-04: eg_m_host — value vide (P0 — IP vidée)', () => {
  const f = fieldInGroup('machines', 'eg_m_host');
  assert(f && f.value === '', `f=${JSON.stringify(f)}`);
});
test('G1-05: eg_m_user — type text, value "deploy"', () => {
  const f = fieldInGroup('machines', 'eg_m_user');
  assert(f && f.type === 'text' && f.value === 'deploy');
});
test('G1-06: eg_m_port — type number, value "22"', () => {
  const f = fieldInGroup('machines', 'eg_m_port');
  assert(f && f.type === 'number' && f.value === '22');
});
test('G1-07: eg_m_env — select, options dev/staging/prod/test', () => {
  const f = fieldInGroup('machines', 'eg_m_env');
  assert(f && f.type === 'select');
  assert(['dev','staging','prod','test'].every(o => f.options.includes(o)));
});
test('G1-08: eg_m_role — select, inclut web/db/cache/queue/worker', () => {
  const f = fieldInGroup('machines', 'eg_m_role');
  assert(f && f.type === 'select');
  assert(['web','db','cache','queue','worker'].every(o => f.options.includes(o)));
});
test('G1-09: eg_m_key — value vide (P0 — chemin SSH vidé)', () => {
  const f = fieldInGroup('machines', 'eg_m_key');
  assert(f && f.value === '', `value obtenu: ${JSON.stringify(f?.value)}`);
});

/* ── G2 — groupe shared_env ───────────────────────────────────── */

console.log('\nG2 — groupe shared_env (9 champs)\n');

test('G2-01: groupe shared_env présent', () =>
  assert(D.groups.shared_env && typeof D.groups.shared_env === 'object'));
test('G2-02: 9 champs', () => {
  const n = D.groups.shared_env.fields?.length ?? 0;
  assert(n === 9, `attendu 9, obtenu ${n}`);
});
test('G2-03: eg_s_domain — value vide (P0)', () => {
  const f = fieldInGroup('shared_env', 'eg_s_domain');
  assert(f && f.value === '');
});
test('G2-04: eg_s_env — select, value "development"', () => {
  const f = fieldInGroup('shared_env', 'eg_s_env');
  assert(f && f.type === 'select' && f.value === 'development');
});
test('G2-05: eg_s_redis_url — value conservée (localhost local)', () => {
  const f = fieldInGroup('shared_env', 'eg_s_redis_url');
  assert(f && f.value === 'redis://localhost:6379', `obtenu: ${f?.value}`);
});
test('G2-06: eg_s_db_host — value "localhost"', () => {
  const f = fieldInGroup('shared_env', 'eg_s_db_host');
  assert(f && f.value === 'localhost');
});
test('G2-07: eg_s_tz — select, value "UTC"', () => {
  const f = fieldInGroup('shared_env', 'eg_s_tz');
  assert(f && f.type === 'select' && f.value === 'UTC');
});
test('G2-08: eg_s_log_level — select, options debug/info/warn/error', () => {
  const f = fieldInGroup('shared_env', 'eg_s_log_level');
  assert(f && f.type === 'select');
  assert(['debug','info','warn','error'].every(o => f.options.includes(o)));
});
test('G2-09: eg_s_s3_region — select, inclut us-east-1 / eu-west-1', () => {
  const f = fieldInGroup('shared_env', 'eg_s_s3_region');
  assert(f && f.type === 'select');
  assert(['us-east-1','eu-west-1'].every(o => f.options.includes(o)));
});

/* ── G3 — groupe network ──────────────────────────────────────── */

console.log('\nG3 — groupe network (7 champs)\n');

test('G3-01: groupe network présent', () =>
  assert(D.groups.network && typeof D.groups.network === 'object'));
test('G3-02: 7 champs', () => {
  const n = D.groups.network.fields?.length ?? 0;
  assert(n === 7, `attendu 7, obtenu ${n}`);
});
test('G3-03: eg_n_subnet — value vide (P0 — subnet vidé)', () => {
  const f = fieldInGroup('network', 'eg_n_subnet');
  assert(f && f.value === '');
});
test('G3-04: eg_n_gateway — value vide (P0 — gateway vidée)', () => {
  const f = fieldInGroup('network', 'eg_n_gateway');
  assert(f && f.value === '');
});
test('G3-05: eg_n_dns1 — value vide (P0 — 1.1.1.1 vidé)', () => {
  const f = fieldInGroup('network', 'eg_n_dns1');
  assert(f && f.value === '');
});
test('G3-06: eg_n_vpn_server — value vide, placeholder neutre (P0)', () => {
  const f = fieldInGroup('network', 'eg_n_vpn_server');
  assert(f && f.value === '' && f.placeholder === '<serveur-vpn>',
    `value=${f?.value} placeholder=${f?.placeholder}`);
});
test('G3-07: eg_n_noproxy — value convention standard conservée', () => {
  const f = fieldInGroup('network', 'eg_n_noproxy');
  assert(f && f.value === 'localhost,127.0.0.1,.local', `obtenu: ${f?.value}`);
});

/* ── TOT — total champs ───────────────────────────────────────── */

console.log('\nTOT — Total champs\n');

test('TOT01: 25 champs au total (9 + 9 + 7)', () => {
  const n = allFields().length;
  assert(n === 25, `attendu 25, obtenu ${n}`);
});
test('TOT02: tous les champs ont un id string non vide', () => {
  const bad = allFields().filter(f => !f.id || typeof f.id !== 'string');
  assert(bad.length === 0, `${bad.length} champ(s) sans id valide`);
});
test('TOT03: tous les IDs commencent par "eg_"', () => {
  const bad = allFields().filter(f => !String(f.id).startsWith('eg_'));
  assert(bad.length === 0, `IDs non conformes : ${bad.map(f => f.id).join(', ')}`);
});
test('TOT04: aucun champ sensitive:true (F-15 non applicable)', () => {
  const bad = allFields().filter(f => f.sensitive === true);
  assert(bad.length === 0, `${bad.length} champ(s) sensitive inattendu(s)`);
});
test('TOT05: aucun champ type=password', () => {
  const bad = allFields().filter(f => f.type === 'password');
  assert(bad.length === 0, `${bad.length} champ(s) password inattendu(s)`);
});

/* ── VAL — validators ─────────────────────────────────────────── */

console.log('\nVAL — validators\n');

test('VAL01: validators est tableau', () =>
  assert(Array.isArray(D.validators)));
test('VAL02: 3 entrées validators', () =>
  assert(D.validators.length === 3, `attendu 3, obtenu ${D.validators.length}`));
test('VAL03: eg_m_host required:true', () => {
  const v = D.validators.find(x => x.field === 'eg_m_host');
  assert(v?.required === true, `entrée: ${JSON.stringify(v)}`);
});
test('VAL04: eg_m_name required:true', () => {
  const v = D.validators.find(x => x.field === 'eg_m_name');
  assert(v?.required === true, `entrée: ${JSON.stringify(v)}`);
});
test('VAL05: eg_n_vpn_server required:true', () => {
  const v = D.validators.find(x => x.field === 'eg_n_vpn_server');
  assert(v?.required === true, `entrée: ${JSON.stringify(v)}`);
});

/* ── Résumé ───────────────────────────────────────────────────── */

const w = 56;
console.log(`\n${'═'.repeat(w)}`);
console.log(`  Résultat : ${_p + _f} tests — ${_p} ✓  ${_f > 0 ? _f + ' ✗' : '0 ✗'}`);
if (_f > 0) {
  console.error(`  STATUT : FAILED (${_f} échec(s))\n`);
  process.exit(1);
}
console.log('  STATUT : PASS\n');
