/**
 * modules/queue-config.smoke.js — Smoke tests M-4.1 v1.0
 * LocalCMS · modules/queue-config.js
 *
 * Orientation : équivalence réelle avec l'inline d'origine.
 *
 * Blocs :
 *   P  — Pureté
 *   M  — Identité
 *   K  — Structure (forms, meta, conditions, validators, bindings)
 *   F1 — rabbitmq  (26 champs)
 *   F2 — kafka     (33 champs)
 *   F3 — nats      (23 champs)
 *   F4 — webhooks  (19 champs)
 *   S  — F-15 sensitive (8 champs password)
 *   P0 — Conformité P0 (values, placeholders, paths, IPs)
 *   C  — Conditions (vide)
 *   V  — Validators
 *   B  — Profile bindings
 *
 * Exécution : node modules/queue-config.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'queue-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_QUEUE_CFG_DATA\b/, 'globalThis.MOD_QUEUE_CFG_DATA'));

const D = globalThis.MOD_QUEUE_CFG_DATA;

let _pass = 0, _fail = 0;
const ok = (label, cond) => {
  if (cond) { process.stdout.write(`  \u2713  ${label}\n`); _pass++; }
  else       { process.stderr.write(`  \u2717  ${label}\n`); _fail++; }
};

const allFields = () =>
  Object.values(D.forms ?? {}).flatMap(f =>
    (f.sections ?? []).flatMap(s => s.fields ?? []));

/* ══════════════════════════════════════════════════════════════════
   P — Pureté
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P · Pureté ──');
ok('P-1  MOD_QUEUE_CFG_DATA est un objet', typeof D === 'object' && D !== null);
ok('P-2  pas de fonction top-level',
   Object.values(D).every(v => typeof v !== 'function'));
ok('P-3  meta : pas de fonction',
   Object.values(D.meta ?? {}).every(v => typeof v !== 'function'));
ok('P-4  champs forms : pas de fonction',
   Object.values(D.forms ?? {}).every(f =>
     (f.sections ?? []).every(s =>
       (s.fields ?? []).every(fld =>
         Object.values(fld).every(v => typeof v !== 'function')))));
ok('P-5  conditions : tableau pur', Array.isArray(D.conditions));

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── M · Identité ──');
ok('M-1  id = "queue_cfg"',              D.id           === 'queue_cfg');
ok('M-2  label non vide',               typeof D.label === 'string' && D.label.length > 0);
ok('M-3  version semver',               /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',              D.type         === 'config');
ok('M-5  os_compat includes "all"',     (D.os_compat   ?? []).includes('all'));
ok('M-6  capabilities includes "generate"', (D.capabilities ?? []).includes('generate'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── K · Structure ──');
ok('K-1  meta présent',                     D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "rabbitmq"',  D.meta?.activeDefault === 'rabbitmq');
ok('K-3  meta.typeIcons présent',           typeof D.meta?.typeIcons === 'object');
ok('K-4  meta.typeLabels présent',          typeof D.meta?.typeLabels === 'object');
ok('K-5  4 typeIcons déclarés',             Object.keys(D.meta?.typeIcons ?? {}).length === 4);
ok('K-6  4 typeLabels déclarés',            Object.keys(D.meta?.typeLabels ?? {}).length === 4);
ok('K-7  forms présent',                   D.forms && typeof D.forms === 'object');
ok('K-8  4 forms déclarés',                Object.keys(D.forms ?? {}).length === 4);
ok('K-9  forms contient rabbitmq',         'rabbitmq' in (D.forms ?? {}));
ok('K-10 forms contient kafka',            'kafka'    in (D.forms ?? {}));
ok('K-11 forms contient nats',             'nats'     in (D.forms ?? {}));
ok('K-12 forms contient webhooks',         'webhooks' in (D.forms ?? {}));
ok('K-13 chaque form a id string',
   Object.values(D.forms ?? {}).every(f => typeof f.id === 'string' && f.id.length > 0));
ok('K-14 chaque form a sections[]',
   Object.values(D.forms ?? {}).every(f => Array.isArray(f.sections) && f.sections.length > 0));
ok('K-15 conditions est tableau',          Array.isArray(D.conditions));
ok('K-16 validators est tableau',          Array.isArray(D.validators));
ok('K-17 profile_bindings est tableau',    Array.isArray(D.profile_bindings));
ok('K-18 pas de clé "generators"',         !('generators' in D));
ok('K-19 typeIcons.rabbitmq non vide',     (D.meta?.typeIcons?.rabbitmq ?? '').length > 0);

/* ══════════════════════════════════════════════════════════════════
   F1 — rabbitmq (26 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F1 · rabbitmq (26 champs) ──');
const rmqIds = (D.forms.rabbitmq?.sections ?? []).flatMap(s => s.fields ?? []).map(f => f.id);
const EXPECTED_RMQ = [
  'rmq_host','rmq_port','rmq_user','rmq_pass','rmq_vhost','rmq_tls','rmq_cert',
  'rmq_heartbeat','rmq_prefetch','rmq_connection_timeout',
  'rmq_exchange','rmq_exchange_type','rmq_exchange_durable',
  'rmq_queue','rmq_queue_durable','rmq_queue_exclusive','rmq_queue_autodel',
  'rmq_routing_key','rmq_dlx','rmq_message_ttl','rmq_max_length',
  'rmq_cluster','rmq_nodes','rmq_erlang_cookie','rmq_ha_policy',
  'rmq_file_ext'
];
ok('F1-1  26 champs', rmqIds.length === 26);
EXPECTED_RMQ.forEach((id, i) => ok(`F1-${i+2}  "${id}" présent`, rmqIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F2 — kafka (33 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F2 · kafka (33 champs) ──');
const kfkIds = (D.forms.kafka?.sections ?? []).flatMap(s => s.fields ?? []).map(f => f.id);
const EXPECTED_KFK = [
  'kfk_brokers','kfk_protocol','kfk_sasl_mechanism','kfk_sasl_user','kfk_sasl_pass',
  'kfk_ssl_ca','kfk_ssl_cert','kfk_ssl_key',
  'kfk_topic','kfk_acks','kfk_compression','kfk_batch_size','kfk_linger_ms',
  'kfk_max_block','kfk_retries','kfk_retry_backoff','kfk_idempotent',
  'kfk_group_id','kfk_auto_offset','kfk_auto_commit','kfk_commit_interval',
  'kfk_max_poll','kfk_session_timeout','kfk_heartbeat',
  'kfk_fetch_min','kfk_fetch_max_wait',
  'kfk_partitions','kfk_replication','kfk_retention_ms','kfk_retention_bytes',
  'kfk_cleanup_policy','kfk_min_isr',
  'kfk_file_ext'
];
ok('F2-1  33 champs', kfkIds.length === 33);
EXPECTED_KFK.forEach((id, i) => ok(`F2-${i+2}  "${id}" présent`, kfkIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F3 — nats (23 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F3 · nats (23 champs) ──');
const natsIds = (D.forms.nats?.sections ?? []).flatMap(s => s.fields ?? []).map(f => f.id);
const EXPECTED_NATS = [
  'nats_host','nats_port','nats_http_port','nats_cluster_name',
  'nats_max_payload','nats_max_connections','nats_ping_interval','nats_max_pings',
  'nats_auth','nats_token','nats_user','nats_password','nats_tls',
  'nats_jetstream','nats_js_store','nats_js_max_mem','nats_js_max_disk',
  'nats_stream_name','nats_subjects','nats_retention',
  'nats_max_msgs','nats_max_age',
  'nats_file_ext'
];
ok('F3-1  23 champs', natsIds.length === 23);
EXPECTED_NATS.forEach((id, i) => ok(`F3-${i+2}  "${id}" présent`, natsIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F4 — webhooks (19 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F4 · webhooks (19 champs) ──');
const whIds = (D.forms.webhooks?.sections ?? []).flatMap(s => s.fields ?? []).map(f => f.id);
const EXPECTED_WH = [
  'wh_url','wh_method','wh_content_type','wh_secret','wh_hmac_algo',
  'wh_auth_type','wh_auth_token','wh_timeout','wh_retry_count',
  'wh_retry_delay','wh_retry_strategy','wh_events',
  'wh_in_path','wh_in_verify_sig','wh_in_secret','wh_in_ip_whitelist',
  'wh_in_queue','wh_in_queue_backend',
  'wh_file_ext'
];
ok('F4-1  19 champs', whIds.length === 19);
EXPECTED_WH.forEach((id, i) => ok(`F4-${i+2}  "${id}" présent`, whIds.includes(id)));

const af = allFields();
ok('F-TOTAL  101 champs au total', af.length === 101);

/* ══════════════════════════════════════════════════════════════════
   S — F-15 sensitive (8 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── S · F-15 sensitive ──');
const EXPECTED_SENSITIVE = [
  'rmq_pass','rmq_erlang_cookie','kfk_sasl_pass',
  'nats_token','nats_password',
  'wh_secret','wh_auth_token','wh_in_secret'
];
const sensitiveIds = af.filter(f => f.sensitive === true).map(f => f.id);
ok('S-1  8 champs sensitive', sensitiveIds.length === 8);
EXPECTED_SENSITIVE.forEach((id, i) =>
  ok(`S-${i+2}  "${id}" sensitive:true`, sensitiveIds.includes(id)));
ok('S-10 tous les champs password ont sensitive:true',
   af.filter(f => f.type === 'password').every(f => f.sensitive === true));

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P0 · Conformité P0 ──');

// Values vidées
const mustEmpty = [
  ['rmq_pass',    'credential guest vidé'],
  ['nats_js_store','chemin /tmp/nats vidé'],
  ['wh_in_path',  'chemin concret vidé'],
];
mustEmpty.forEach(([id, label], i) => {
  const f = af.find(x => x.id === id);
  ok(`P0-${i+1}  ${id} value='' (${label})`, f?.value === '');
});

// Placeholders neutralisés
ok('P0-4  rmq_cert placeholder sans /etc/',
   !/^\//.test(af.find(f => f.id === 'rmq_cert')?.placeholder ?? ''));
ok('P0-5  kfk_ssl_ca placeholder sans /etc/',
   !/^\//.test(af.find(f => f.id === 'kfk_ssl_ca')?.placeholder ?? ''));
ok('P0-6  wh_url placeholder sans example.com',
   !/example\./.test(af.find(f => f.id === 'wh_url')?.placeholder ?? ''));
ok('P0-7  wh_in_ip_whitelist placeholder sans IP concrète',
   !/140\.82/.test(af.find(f => f.id === 'wh_in_ip_whitelist')?.placeholder ?? ''));
ok('P0-8  wh_in_path placeholder sans /webhooks/github',
   !/\/webhooks\/github/.test(af.find(f => f.id === 'wh_in_path')?.placeholder ?? ''));

// Règles générales
ok('P0-9  pas de ~/  en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('~/')));
ok('P0-10 pas de /etc/ ou /var/ en value',
   !af.some(f => typeof f.value === 'string' && /^\/etc\/|^\/var\//.test(f.value)));
ok('P0-11 pas de 192.168. en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('192.168.')));
ok('P0-12 pas de localStorage.setItem', !src.includes('localStorage.setItem'));
ok('P0-13 pas de document.write',       !src.includes('document.write'));

// Valeurs conservées (localhost, standards)
ok('P0-14 kfk_brokers conservé (localhost service)',
   af.find(f => f.id === 'kfk_brokers')?.value === 'localhost:9092');
ok('P0-15 nats_host conservé (0.0.0.0 adresse d\'écoute)',
   af.find(f => f.id === 'nats_host')?.value === '0.0.0.0');
ok('P0-16 rmq_host conservé (localhost)',
   af.find(f => f.id === 'rmq_host')?.value === 'localhost');

/* ══════════════════════════════════════════════════════════════════
   C — Conditions (vide — fidèle inline)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── C · Conditions ──');
ok('C-1  conditions vide', Array.isArray(D.conditions) && D.conditions.length === 0);

/* ══════════════════════════════════════════════════════════════════
   V — Validators
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── V · Validators ──');
ok('V-1  validators non vide',  D.validators.length > 0);
ok('V-2  tous ont field string',
   D.validators.every(v => typeof v?.field === 'string' && v.field.length > 0));
ok('V-3  rmq_host required',    D.validators.some(v => v.field === 'rmq_host'    && v.required));
ok('V-4  kfk_brokers required', D.validators.some(v => v.field === 'kfk_brokers' && v.required));
ok('V-5  wh_url type url',      D.validators.some(v => v.field === 'wh_url'      && v.type === 'url'));

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── B · Profile bindings ──');
ok('B-1  profile_bindings vide',
   Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   Résumé
   ══════════════════════════════════════════════════════════════════ */
const tot = _pass + _fail;
console.log(`\n${'─'.repeat(60)}`);
console.log(`  queue-config.smoke v1.0  ·  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
