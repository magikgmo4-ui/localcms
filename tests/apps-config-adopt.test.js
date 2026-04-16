/**
 * tests/apps-config-adopt.test.js
 * LocalCMS · GO_LOCALCMS_APPS_CONFIG_ADOPT_01 · GO-6/8
 *
 * Adopt test DATA-ONLY pour modules/apps-config.js — MOD_APPS_CFG_DATA
 *
 * Module  : apps_cfg
 * Forms   : nginx(36) / postgresql(27) / redis(29) / postfix(20)
 *           prometheus(22) / backup(20) = 154 champs
 * F-15    : 5 sensitive — redis_password / redis_replica_auth /
 *           pf_relay_pass / bk_repo_pass / bk_aws_secret
 * VAL     : 3 — ng_server_name:required · pf_hostname:required · pf_domain:required
 * C/B     : conditions[] vide · profile_bindings[] vide
 *
 * Pattern : eval(src.replace(/\bconst\s+MOD_APPS_CFG_DATA\b/, 'globalThis.MOD_APPS_CFG_DATA'))
 * Aucun mock FN/BUS/DOM. Aucun patch HTML.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/* ─── runner minimal ────────────────────────────────────────────── */
let pass = 0, fail = 0;
function ok(label, value) {
  if (value) { console.log(`  ✓  ${label}`); pass++; }
  else        { console.error(`  ✗  ${label}`); fail++; }
}
function section(title) { console.log(`\n${title}\n`); }

/* ─── chargement DATA-ONLY ──────────────────────────────────────── */
const src = fs.readFileSync(path.join(__dirname, '../modules/apps-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_APPS_CFG_DATA\b/, 'globalThis.MOD_APPS_CFG_DATA'));
const D = globalThis.MOD_APPS_CFG_DATA;

/* ─── helpers ───────────────────────────────────────────────────── */
const allFields   = () => Object.values(D.forms).flatMap(f => f.sections.flatMap(s => s.fields));
const fieldInForm = (fk, id) => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).find(f => f.id === id);
const countInForm = (fk) => (D.forms[fk]?.sections ?? []).reduce((n, s) => n + s.fields.length, 0);

/* ══════════════════════════════════════════════════════════════════
   BANNER
   ══════════════════════════════════════════════════════════════════ */
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  APPS_CFG ADOPT — Tests adoption MOD_APPS_CFG_DATA      ║');
console.log('╚══════════════════════════════════════════════════════════╝');

/* ══════════════════════════════════════════════════════════════════
   INIT — Chargement module
   ══════════════════════════════════════════════════════════════════ */
section('INIT — Chargement module');
ok('INIT01: MOD_APPS_CFG_DATA est un objet non-null',
  D !== null && typeof D === 'object');
ok('INIT02: id = "apps_cfg"',
  D.id === 'apps_cfg');

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
section('M — Identité');
ok('M01: label = "Applications"',
  D.label === 'Applications');
ok('M02: version semver x.y.z',
  /^\d+\.\d+\.\d+$/.test(D.version));
ok('M03: type = "config"',
  D.type === 'config');
ok('M04: capabilities inclut "render"',
  Array.isArray(D.capabilities) && D.capabilities.includes('render'));
ok('M05: capabilities inclut "generate"',
  D.capabilities.includes('generate'));
ok('M06: meta.activeDefault = "nginx"',
  D.meta?.activeDefault === 'nginx');
ok('M07: meta.typeLabels.postgresql = "PostgreSQL"',
  D.meta?.typeLabels?.postgresql === 'PostgreSQL');
ok('M08: meta.typeLabels.backup = "Backup/Restic"',
  D.meta?.typeLabels?.backup === 'Backup/Restic');

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
section('K — Structure');
ok('K01: forms est un objet (non-Array)',
  D.forms !== null && typeof D.forms === 'object' && !Array.isArray(D.forms));
ok('K02: exactement 6 forms déclarés',
  Object.keys(D.forms).length === 6);
ok('K03: clés forms attendues présentes',
  ['nginx','postgresql','redis','postfix','prometheus','backup'].every(k => k in D.forms));
ok('K04: conditions[] vide',
  Array.isArray(D.conditions) && D.conditions.length === 0);
ok('K05: validators[] — 3 entrées',
  Array.isArray(D.validators) && D.validators.length === 3);
ok('K06: profile_bindings[] vide',
  Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   F1 — form nginx (36 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F1 — form nginx (36 champs)');
ok('F1-01: 36 champs dans nginx',
  countInForm('nginx') === 36);
ok('F1-02: id form = "apps-nginx"',
  D.forms.nginx?.id === 'apps-nginx');
ok('F1-03: ng_server_name — text, value "" (P0 vidé)', (() => {
  const f = fieldInForm('nginx', 'ng_server_name');
  return f?.type === 'text' && f?.value === '';
})());
ok('F1-04: ng_listen — select, value "80"', (() => {
  const f = fieldInForm('nginx', 'ng_listen');
  return f?.type === 'select' && f?.value === '80';
})());
ok('F1-05: ng_ssl — toggle, value false', (() => {
  const f = fieldInForm('nginx', 'ng_ssl');
  return f?.type === 'toggle' && f?.value === false;
})());
ok('F1-06: ng_proxy_pass — url, value "http://localhost:3000" (P0 conforme)', (() => {
  const f = fieldInForm('nginx', 'ng_proxy_pass');
  return f?.type === 'url' && f?.value === 'http://localhost:3000';
})());
ok('F1-07: ng_file_ext — file-ext, value "conf"', (() => {
  const f = fieldInForm('nginx', 'ng_file_ext');
  return f?.type === 'file-ext' && f?.value === 'conf';
})());

/* ══════════════════════════════════════════════════════════════════
   F2 — form postgresql (27 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F2 — form postgresql (27 champs)');
ok('F2-01: 27 champs dans postgresql',
  countInForm('postgresql') === 27);
ok('F2-02: id form = "apps-pg"',
  D.forms.postgresql?.id === 'apps-pg');
ok('F2-03: pg_port — number, value "5432"', (() => {
  const f = fieldInForm('postgresql', 'pg_port');
  return f?.type === 'number' && f?.value === '5432';
})());
ok('F2-04: pg_shared_buffers — select, value "256MB"', (() => {
  const f = fieldInForm('postgresql', 'pg_shared_buffers');
  return f?.type === 'select' && f?.value === '256MB';
})());
ok('F2-05: pg_hba_local — select, value "peer"', (() => {
  const f = fieldInForm('postgresql', 'pg_hba_local');
  return f?.type === 'select' && f?.value === 'peer';
})());
ok('F2-06: pg_hba_host — select, value "scram-sha-256"', (() => {
  const f = fieldInForm('postgresql', 'pg_hba_host');
  return f?.type === 'select' && f?.value === 'scram-sha-256';
})());

/* ══════════════════════════════════════════════════════════════════
   F3 — form redis (29 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F3 — form redis (29 champs)');
ok('F3-01: 29 champs dans redis',
  countInForm('redis') === 29);
ok('F3-02: id form = "apps-redis"',
  D.forms.redis?.id === 'apps-redis');
ok('F3-03: redis_bind — text, value "127.0.0.1"', (() => {
  const f = fieldInForm('redis', 'redis_bind');
  return f?.type === 'text' && f?.value === '127.0.0.1';
})());
ok('F3-04: redis_port — number, value "6379"', (() => {
  const f = fieldInForm('redis', 'redis_port');
  return f?.type === 'number' && f?.value === '6379';
})());
ok('F3-05: redis_password — password + sensitive + value "" (P0)', (() => {
  const f = fieldInForm('redis', 'redis_password');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F3-06: redis_eviction — select, value "allkeys-lru"', (() => {
  const f = fieldInForm('redis', 'redis_eviction');
  return f?.type === 'select' && f?.value === 'allkeys-lru';
})());

/* ══════════════════════════════════════════════════════════════════
   F4 — form postfix (20 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F4 — form postfix (20 champs)');
ok('F4-01: 20 champs dans postfix',
  countInForm('postfix') === 20);
ok('F4-02: id form = "apps-postfix"',
  D.forms.postfix?.id === 'apps-postfix');
ok('F4-03: pf_hostname — text, value "" (P0 vidé)', (() => {
  const f = fieldInForm('postfix', 'pf_hostname');
  return f?.type === 'text' && f?.value === '';
})());
ok('F4-04: pf_relay_pass — password + sensitive + value "" (P0)', (() => {
  const f = fieldInForm('postfix', 'pf_relay_pass');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F4-05: pf_tls_out — select, value "encrypt"', (() => {
  const f = fieldInForm('postfix', 'pf_tls_out');
  return f?.type === 'select' && f?.value === 'encrypt';
})());

/* ══════════════════════════════════════════════════════════════════
   F5 — form prometheus (22 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F5 — form prometheus (22 champs)');
ok('F5-01: 22 champs dans prometheus',
  countInForm('prometheus') === 22);
ok('F5-02: id form = "apps-prom"',
  D.forms.prometheus?.id === 'apps-prom');
ok('F5-03: prom_port — number, value "9090"', (() => {
  const f = fieldInForm('prometheus', 'prom_port');
  return f?.type === 'number' && f?.value === '9090';
})());
ok('F5-04: prom_path — url, value "http://localhost:9090" (P0 conforme)', (() => {
  const f = fieldInForm('prometheus', 'prom_path');
  return f?.type === 'url' && f?.value === 'http://localhost:9090';
})());
ok('F5-05: prom_scrape_interval — select, value "15s"', (() => {
  const f = fieldInForm('prometheus', 'prom_scrape_interval');
  return f?.type === 'select' && f?.value === '15s';
})());
ok('F5-06: prom_file_ext — file-ext, value "yaml"', (() => {
  const f = fieldInForm('prometheus', 'prom_file_ext');
  return f?.type === 'file-ext' && f?.value === 'yaml';
})());

/* ══════════════════════════════════════════════════════════════════
   F6 — form backup (20 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F6 — form backup (20 champs)');
ok('F6-01: 20 champs dans backup',
  countInForm('backup') === 20);
ok('F6-02: id form = "apps-backup"',
  D.forms.backup?.id === 'apps-backup');
ok('F6-03: bk_tool — select, value "restic"', (() => {
  const f = fieldInForm('backup', 'bk_tool');
  return f?.type === 'select' && f?.value === 'restic';
})());
ok('F6-04: bk_repo_pass — password + sensitive + value "" (P0)', (() => {
  const f = fieldInForm('backup', 'bk_repo_pass');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F6-05: bk_aws_secret — password + sensitive + value "" (P0)', (() => {
  const f = fieldInForm('backup', 'bk_aws_secret');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F6-06: bk_keep_daily — number, value "7"', (() => {
  const f = fieldInForm('backup', 'bk_keep_daily');
  return f?.type === 'number' && f?.value === '7';
})());
ok('F6-07: bk_file_ext — file-ext, value "sh"', (() => {
  const f = fieldInForm('backup', 'bk_file_ext');
  return f?.type === 'file-ext' && f?.value === 'sh';
})());

/* ══════════════════════════════════════════════════════════════════
   TYPE — Types critiques
   ══════════════════════════════════════════════════════════════════ */
section('TYPE — Types critiques');
ok('TYPE01: multiselect présent (ng_ssl_proto)',
  fieldInForm('nginx', 'ng_ssl_proto')?.type === 'multiselect');
ok('TYPE02: multiselect présent (bk_notify_on)',
  fieldInForm('backup', 'bk_notify_on')?.type === 'multiselect');
ok('TYPE03: url présent (ng_proxy_pass)',
  fieldInForm('nginx', 'ng_proxy_pass')?.type === 'url');
ok('TYPE04: email présent (pf_relay_user)',
  fieldInForm('postfix', 'pf_relay_user')?.type === 'email');
ok('TYPE05: textarea présent (ng_upstream_servers)',
  fieldInForm('nginx', 'ng_upstream_servers')?.type === 'textarea');
ok('TYPE06: file-ext présent dans chaque form', (() => {
  return ['nginx','postgresql','redis','postfix','prometheus','backup']
    .every(fk => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).some(f => f.type === 'file-ext'));
})());

/* ══════════════════════════════════════════════════════════════════
   VAL — validators (3 entrées exactes)
   ══════════════════════════════════════════════════════════════════ */
section('VAL — validators');
ok('VAL01: validators est tableau',
  Array.isArray(D.validators));
ok('VAL02: 3 entrées validators',
  D.validators.length === 3);
ok('VAL03: ng_server_name — required:true',
  D.validators.some(v => v.field === 'ng_server_name' && v.required === true));
ok('VAL04: pf_hostname — required:true',
  D.validators.some(v => v.field === 'pf_hostname' && v.required === true));
ok('VAL05: pf_domain — required:true',
  D.validators.some(v => v.field === 'pf_domain' && v.required === true));

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (5 champs)
   ══════════════════════════════════════════════════════════════════ */
section('S — sensitive F-15 (5 champs)');
const sensitiveExpected = [
  'redis_password','redis_replica_auth',
  'pf_relay_pass',
  'bk_repo_pass','bk_aws_secret',
];
ok('S01: redis_password — password + sensitive (redis)', (() => {
  const f = fieldInForm('redis', 'redis_password');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S02: redis_replica_auth — password + sensitive (redis)', (() => {
  const f = fieldInForm('redis', 'redis_replica_auth');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S03: pf_relay_pass — password + sensitive (postfix)', (() => {
  const f = fieldInForm('postfix', 'pf_relay_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S04: bk_repo_pass — password + sensitive (backup)', (() => {
  const f = fieldInForm('backup', 'bk_repo_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S05: bk_aws_secret — password + sensitive (backup)', (() => {
  const f = fieldInForm('backup', 'bk_aws_secret');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S06: aucun autre champ sensitive hors des 5 attendus', (() => {
  const ids = allFields().filter(f => f.sensitive === true).map(f => f.id).sort().join(',');
  return ids === sensitiveExpected.slice().sort().join(',');
})());

/* ══════════════════════════════════════════════════════════════════
   TOT — Total champs
   ══════════════════════════════════════════════════════════════════ */
section('TOT — Total champs');
ok('TOT01: 154 champs au total (36+27+29+20+22+20)',
  allFields().length === 154);
ok('TOT02: tous les champs ont un id string non vide',
  allFields().every(f => typeof f.id === 'string' && f.id.length > 0));
ok('TOT03: exactement 5 champs sensitive:true (F-15)',
  allFields().filter(f => f.sensitive === true).length === 5);
ok('TOT04: exactement 5 champs type=password',
  allFields().filter(f => f.type === 'password').length === 5);
ok('TOT05: champs file-ext = 6 (1 par form)',
  allFields().filter(f => f.type === 'file-ext').length === 6);

/* ─── résultat ──────────────────────────────────────────────────── */
const total = pass + fail;
console.log('\n' + '═'.repeat(58));
console.log(`  Résultat : ${total} tests — ${pass} ✓  ${fail} ✗`);
console.log(`  STATUT : ${fail === 0 ? 'PASS' : 'FAIL'}`);
if (fail > 0) process.exit(1);
