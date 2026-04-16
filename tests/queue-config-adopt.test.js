/**
 * tests/queue-config-adopt.test.js
 * LocalCMS · GO_LOCALCMS_QUEUE_CONFIG_ADOPT_01 · GO-4/8
 *
 * Adopt test DATA-ONLY pour modules/queue-config.js — MOD_QUEUE_CFG_DATA
 *
 * Module : queue_cfg
 * Forms  : rabbitmq(26) / kafka(33) / nats(23) / webhooks(19) = 101 champs
 * F-15   : 8 sensitive — rmq_pass / rmq_erlang_cookie / kfk_sasl_pass /
 *          nats_token / nats_password / wh_secret / wh_auth_token / wh_in_secret
 * VAL    : 3 — rmq_host:required · kfk_brokers:required · wh_url:url
 *
 * Pattern : eval(src.replace(/\bconst\s+MOD_QUEUE_CFG_DATA\b/, 'globalThis.MOD_QUEUE_CFG_DATA'))
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
const src = fs.readFileSync(path.join(__dirname, '../modules/queue-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_QUEUE_CFG_DATA\b/, 'globalThis.MOD_QUEUE_CFG_DATA'));
const D = globalThis.MOD_QUEUE_CFG_DATA;

/* ─── helpers ───────────────────────────────────────────────────── */
const allFields   = () => Object.values(D.forms).flatMap(f => f.sections.flatMap(s => s.fields));
const fieldInForm = (fk, id) => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).find(f => f.id === id);
const countInForm = (fk) => (D.forms[fk]?.sections ?? []).reduce((n, s) => n + s.fields.length, 0);

/* ══════════════════════════════════════════════════════════════════
   BANNER
   ══════════════════════════════════════════════════════════════════ */
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  QUEUE_CFG ADOPT — Tests adoption MOD_QUEUE_CFG_DATA    ║');
console.log('╚══════════════════════════════════════════════════════════╝');

/* ══════════════════════════════════════════════════════════════════
   INIT — Chargement module
   ══════════════════════════════════════════════════════════════════ */
section('INIT — Chargement module');
ok('INIT01: MOD_QUEUE_CFG_DATA est un objet non-null',
  D !== null && typeof D === 'object');
ok('INIT02: id = "queue_cfg"',
  D.id === 'queue_cfg');

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
section('M — Identité');
ok('M01: version semver x.y.z',
  /^\d+\.\d+\.\d+$/.test(D.version));
ok('M02: type = "config"',
  D.type === 'config');
ok('M03: capabilities inclut "render"',
  Array.isArray(D.capabilities) && D.capabilities.includes('render'));
ok('M04: capabilities inclut "generate"',
  D.capabilities.includes('generate'));
ok('M05: meta.activeDefault = "rabbitmq"',
  D.meta?.activeDefault === 'rabbitmq');
ok('M06: meta.typeLabels.nats contient "NATS"',
  typeof D.meta?.typeLabels?.nats === 'string' && D.meta.typeLabels.nats.includes('NATS'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
section('K — Structure');
ok('K01: forms est un objet (non-Array)',
  D.forms !== null && typeof D.forms === 'object' && !Array.isArray(D.forms));
ok('K02: exactement 4 forms déclarés',
  Object.keys(D.forms).length === 4);
ok('K03: clés forms = rabbitmq/kafka/nats/webhooks',
  ['rabbitmq','kafka','nats','webhooks'].every(k => k in D.forms));
ok('K04: conditions[] vide',
  Array.isArray(D.conditions) && D.conditions.length === 0);
ok('K05: validators[] — 3 entrées',
  Array.isArray(D.validators) && D.validators.length === 3);
ok('K06: profile_bindings[] vide',
  Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   F1 — form rabbitmq (26 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F1 — form rabbitmq (26 champs)');
ok('F1-01: 26 champs dans rabbitmq',
  countInForm('rabbitmq') === 26);
ok('F1-02: rmq_host — text, value "localhost"', (() => {
  const f = fieldInForm('rabbitmq','rmq_host');
  return f?.type === 'text' && f?.value === 'localhost';
})());
ok('F1-03: rmq_port — select, value "5672"', (() => {
  const f = fieldInForm('rabbitmq','rmq_port');
  return f?.type === 'select' && f?.value === '5672';
})());
ok('F1-04: rmq_pass — password + sensitive + value vide (P0)', (() => {
  const f = fieldInForm('rabbitmq','rmq_pass');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F1-05: rmq_vhost — text, value "/"', (() => {
  const f = fieldInForm('rabbitmq','rmq_vhost');
  return f?.type === 'text' && f?.value === '/';
})());

/* ══════════════════════════════════════════════════════════════════
   F2 — form kafka (33 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F2 — form kafka (33 champs)');
ok('F2-01: 33 champs dans kafka',
  countInForm('kafka') === 33);
ok('F2-02: kfk_brokers — text, value "localhost:9092"', (() => {
  const f = fieldInForm('kafka','kfk_brokers');
  return f?.type === 'text' && f?.value === 'localhost:9092';
})());
ok('F2-03: kfk_sasl_pass — password + sensitive', (() => {
  const f = fieldInForm('kafka','kfk_sasl_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('F2-04: kfk_sasl_user — text, value vide', (() => {
  const f = fieldInForm('kafka','kfk_sasl_user');
  return f?.type === 'text' && f?.value === '';
})());
ok('F2-05: kfk_sasl_pass — value vide (P0)', (() => {
  const f = fieldInForm('kafka','kfk_sasl_pass');
  return f?.value === '';
})());

/* ══════════════════════════════════════════════════════════════════
   F3 — form nats (23 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F3 — form nats (23 champs)');
ok('F3-01: 23 champs dans nats',
  countInForm('nats') === 23);
ok('F3-02: nats_host — text, value "0.0.0.0"', (() => {
  const f = fieldInForm('nats','nats_host');
  return f?.type === 'text' && f?.value === '0.0.0.0';
})());
ok('F3-03: nats_port — number, value "4222"', (() => {
  const f = fieldInForm('nats','nats_port');
  return f?.type === 'number' && f?.value === '4222';
})());
ok('F3-04: nats_subjects — value "events.>"', (() => {
  const f = fieldInForm('nats','nats_subjects');
  return f?.value === 'events.>';
})());

/* ══════════════════════════════════════════════════════════════════
   F4 — form webhooks (19 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F4 — form webhooks (19 champs)');
ok('F4-01: 19 champs dans webhooks',
  countInForm('webhooks') === 19);
ok('F4-02: wh_url — type url, value vide (P0)', (() => {
  const f = fieldInForm('webhooks','wh_url');
  return f?.type === 'url' && f?.value === '';
})());
ok('F4-03: wh_method — select, value "POST"', (() => {
  const f = fieldInForm('webhooks','wh_method');
  return f?.type === 'select' && f?.value === 'POST';
})());
ok('F4-04: wh_in_path — value vide (P0)', (() => {
  const f = fieldInForm('webhooks','wh_in_path');
  return f?.value === '';
})());

/* ══════════════════════════════════════════════════════════════════
   TOT — Total champs
   ══════════════════════════════════════════════════════════════════ */
section('TOT — Total champs');
ok('TOT01: 101 champs au total (26+33+23+19)',
  allFields().length === 101);
ok('TOT02: tous les champs ont un id string non vide',
  allFields().every(f => typeof f.id === 'string' && f.id.length > 0));
ok('TOT03: exactement 8 champs sensitive:true (F-15)',
  allFields().filter(f => f.sensitive === true).length === 8);
ok('TOT04: exactement 8 champs type=password',
  allFields().filter(f => f.type === 'password').length === 8);

/* ══════════════════════════════════════════════════════════════════
   VAL — validators
   ══════════════════════════════════════════════════════════════════ */
section('VAL — validators');
ok('VAL01: validators est tableau',
  Array.isArray(D.validators));
ok('VAL02: 3 entrées validators',
  D.validators.length === 3);
ok('VAL03: rmq_host — required:true',
  D.validators.some(v => v.field === 'rmq_host' && v.required === true));
ok('VAL04: kfk_brokers — required:true',
  D.validators.some(v => v.field === 'kfk_brokers' && v.required === true));
ok('VAL05: wh_url — type:"url"',
  D.validators.some(v => v.field === 'wh_url' && v.type === 'url'));

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (spot-check 8 champs)
   ══════════════════════════════════════════════════════════════════ */
section('S — sensitive F-15');
const sensitiveExpected = [
  'rmq_pass','rmq_erlang_cookie',
  'kfk_sasl_pass',
  'nats_token','nats_password',
  'wh_secret','wh_auth_token','wh_in_secret',
];
ok('S01: rmq_pass — password + sensitive (rabbitmq)', (() => {
  const f = fieldInForm('rabbitmq','rmq_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S02: rmq_erlang_cookie — password + sensitive (rabbitmq)', (() => {
  const f = fieldInForm('rabbitmq','rmq_erlang_cookie');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S03: kfk_sasl_pass — password + sensitive (kafka)', (() => {
  const f = fieldInForm('kafka','kfk_sasl_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S04: nats_token — password + sensitive (nats)', (() => {
  const f = fieldInForm('nats','nats_token');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S05: nats_password — password + sensitive (nats)', (() => {
  const f = fieldInForm('nats','nats_password');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S06: wh_secret — password + sensitive (webhooks)', (() => {
  const f = fieldInForm('webhooks','wh_secret');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S07: wh_auth_token — password + sensitive (webhooks)', (() => {
  const f = fieldInForm('webhooks','wh_auth_token');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S08: wh_in_secret — password + sensitive (webhooks)', (() => {
  const f = fieldInForm('webhooks','wh_in_secret');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S09: aucun autre champ sensitive hors des 8 attendus', (() => {
  const ids = allFields().filter(f => f.sensitive === true).map(f => f.id).sort().join(',');
  return ids === sensitiveExpected.slice().sort().join(',');
})());

/* ─── résultat ──────────────────────────────────────────────────── */
const total = pass + fail;
console.log('\n' + '═'.repeat(58));
console.log(`  Résultat : ${total} tests — ${pass} ✓  ${fail} ✗`);
console.log(`  STATUT : ${fail === 0 ? 'PASS' : 'FAIL'}`);
if (fail > 0) process.exit(1);
