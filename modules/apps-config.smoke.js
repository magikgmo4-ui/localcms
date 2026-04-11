/**
 * modules/apps-config.smoke.js — Smoke tests M-4.3 v1.0
 * LocalCMS · modules/apps-config.js
 *
 * Blocs :
 *   P  — Pureté
 *   M  — Identité
 *   K  — Structure (forms, meta, conditions, validators, bindings)
 *   F1 — nginx        (36 champs)
 *   F2 — postgresql   (27 champs)
 *   F3 — redis        (29 champs)
 *   F4 — postfix      (20 champs)
 *   F5 — prometheus   (22 champs)
 *   F6 — backup       (20 champs)
 *   S  — F-15 sensitive (5 champs)
 *   P0 — Conformité P0
 *   C  — Conditions (vide)
 *   V  — Validators
 *   B  — Profile bindings
 *
 * Exécution : node modules/apps-config.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'apps-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_APPS_CFG_DATA\b/, 'globalThis.MOD_APPS_CFG_DATA'));

const D = globalThis.MOD_APPS_CFG_DATA;

let _pass = 0, _fail = 0;
const ok = (label, cond) => {
  if (cond) { process.stdout.write(`  \u2713  ${label}\n`); _pass++; }
  else       { process.stderr.write(`  \u2717  ${label}\n`); _fail++; }
};

const allFields = () =>
  Object.values(D.forms ?? {}).flatMap(f =>
    (f.sections ?? []).flatMap(s => s.fields ?? []));

const fieldsOf = (formKey) =>
  (D.forms?.[formKey]?.sections ?? []).flatMap(s => s.fields ?? []);

/* ══════════════════════════════════════════════════════════════════
   P — Pureté
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 P \u00b7 Puret\u00e9 \u2500\u2500');
ok('P-1  MOD_APPS_CFG_DATA est un objet',  typeof D === 'object' && D !== null);
ok('P-2  pas de fonction top-level',
   Object.values(D).every(v => typeof v !== 'function'));
ok('P-3  meta sans fonction',
   Object.values(D.meta ?? {}).every(v => typeof v !== 'function'));
ok('P-4  champs forms sans fonction',
   Object.values(D.forms ?? {}).every(f =>
     (f.sections ?? []).every(s =>
       (s.fields ?? []).every(fld =>
         Object.values(fld).every(v => typeof v !== 'function')))));
ok('P-5  conditions tableau pur', Array.isArray(D.conditions));
ok('P-6  pas de generators dans le manifeste', !('generators' in D));

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 M \u00b7 Identit\u00e9 \u2500\u2500');
ok('M-1  id = "apps_cfg"',           D.id            === 'apps_cfg');
ok('M-2  label non vide',            typeof D.label  === 'string' && D.label.length > 0);
ok('M-3  version semver',            /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',           D.type          === 'config');
ok('M-5  os_compat includes "all"',  (D.os_compat ?? []).includes('all'));
ok('M-6  capabilities includes "generate"', (D.capabilities ?? []).includes('generate'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 K \u00b7 Structure \u2500\u2500');
ok('K-1  meta pr\u00e9sent',                     D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "nginx"',          D.meta?.activeDefault === 'nginx');
ok('K-3  meta.typeIcons pr\u00e9sent (6)',        Object.keys(D.meta?.typeIcons ?? {}).length === 6);
ok('K-4  meta.typeLabels pr\u00e9sent (6)',       Object.keys(D.meta?.typeLabels ?? {}).length === 6);
ok('K-5  forms pr\u00e9sent',                    D.forms && typeof D.forms === 'object');
ok('K-6  6 forms d\u00e9clar\u00e9s',            Object.keys(D.forms ?? {}).length === 6);
['nginx','postgresql','redis','postfix','prometheus','backup'].forEach((k,i) =>
  ok(`K-${7+i}  forms contient "${k}"`, k in (D.forms ?? {})));
ok('K-13 chaque form a id',
   Object.values(D.forms ?? {}).every(f => typeof f.id === 'string' && f.id.length > 0));
ok('K-14 chaque form a sections[]',
   Object.values(D.forms ?? {}).every(f => Array.isArray(f.sections) && f.sections.length > 0));
ok('K-15 conditions tableau',    Array.isArray(D.conditions));
ok('K-16 validators tableau',    Array.isArray(D.validators));
ok('K-17 profile_bindings tab.', Array.isArray(D.profile_bindings));
ok('K-18 pas de cl\u00e9 "generators"', !('generators' in D));

/* ══════════════════════════════════════════════════════════════════
   F1 — nginx (36 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F1 \u00b7 nginx (36 champs) \u2500\u2500');
const ngIds = fieldsOf('nginx').map(f => f.id);
const EXP_NG = [
  'ng_server_name','ng_listen','ng_root','ng_index','ng_ssl',
  'ng_ssl_cert','ng_ssl_key','ng_ssl_proto','ng_hsts','ng_http2',
  'ng_proxy','ng_proxy_pass','ng_proxy_timeout','ng_proxy_buffers',
  'ng_upstream_name','ng_upstream_servers','ng_lb_method',
  'ng_gzip','ng_gzip_types','ng_gzip_level','ng_keepalive',
  'ng_client_max','ng_worker_conn','ng_sendfile','ng_tcpnopush',
  'ng_xframe','ng_xcontent','ng_xss','ng_referrer','ng_csp',
  'ng_ratelimit','ng_rate',
  'ng_static_cache','ng_cache_time','ng_cache_exts',
  'ng_file_ext'
];
ok('F1-1  36 champs', ngIds.length === 36);
EXP_NG.forEach((id,i) => ok(`F1-${i+2}  "${id}"`, ngIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F2 — postgresql (27 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F2 \u00b7 postgresql (27 champs) \u2500\u2500');
const pgIds = fieldsOf('postgresql').map(f => f.id);
const EXP_PG = [
  'pg_listen','pg_port','pg_max_conn','pg_superuser_reserved',
  'pg_ssl','pg_ssl_cert','pg_ssl_key',
  'pg_shared_buffers','pg_effective_cache','pg_work_mem',
  'pg_maintenance_work_mem','pg_huge_pages',
  'pg_wal_level','pg_wal_buffers','pg_checkpoint_completion',
  'pg_max_wal_size','pg_min_wal_size',
  'pg_log_dest','pg_log_duration','pg_log_min_duration',
  'pg_log_stmts','pg_log_connections','pg_log_disconnections',
  'pg_hba_local','pg_hba_host','pg_hba_subnet',
  'pg_file_ext'
];
ok('F2-1  27 champs', pgIds.length === 27);
EXP_PG.forEach((id,i) => ok(`F2-${i+2}  "${id}"`, pgIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F3 — redis (29 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F3 \u00b7 redis (29 champs) \u2500\u2500');
const rdIds = fieldsOf('redis').map(f => f.id);
const EXP_RD = [
  'redis_bind','redis_port','redis_unixsocket','redis_password',
  'redis_protected_mode','redis_ssl','redis_ssl_port',
  'redis_ssl_cert','redis_ssl_key','redis_max_clients',
  'redis_maxmemory','redis_eviction','redis_lazyfree','redis_active_expire',
  'redis_save','redis_save_rules','redis_rdbfile','redis_dir',
  'redis_aof','redis_aof_fsync','redis_aof_rewrite',
  'redis_replica_of','redis_replica_auth','redis_replica_readonly',
  'redis_min_replicas',
  'redis_cluster','redis_cluster_config','redis_cluster_timeout',
  'redis_file_ext'
];
ok('F3-1  29 champs', rdIds.length === 29);
EXP_RD.forEach((id,i) => ok(`F3-${i+2}  "${id}"`, rdIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F4 — postfix (20 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F4 \u00b7 postfix (20 champs) \u2500\u2500');
const pfIds = fieldsOf('postfix').map(f => f.id);
const EXP_PF = [
  'pf_hostname','pf_domain','pf_origin','pf_networks',
  'pf_relayhost','pf_relay_user','pf_relay_pass',
  'pf_destinations','pf_aliases',
  'pf_tls_in','pf_tls_out','pf_cert','pf_key',
  'pf_sasl','pf_spf','pf_dkim',
  'pf_msg_size','pf_rcpt_limit','pf_queue_lifetime',
  'pf_file_ext'
];
ok('F4-1  20 champs', pfIds.length === 20);
EXP_PF.forEach((id,i) => ok(`F4-${i+2}  "${id}"`, pfIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F5 — prometheus (22 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F5 \u00b7 prometheus (22 champs) \u2500\u2500');
const prIds = fieldsOf('prometheus').map(f => f.id);
const EXP_PR = [
  'prom_host','prom_port','prom_path',
  'prom_retention','prom_retention_size',
  'prom_scrape_interval','prom_eval_interval','prom_scrape_timeout',
  'prom_job_node','prom_node_port',
  'prom_job_app','prom_app_port','prom_app_path',
  'prom_job_pg','prom_job_redis','prom_job_nginx',
  'prom_alertmgr','prom_alertmgr_url','prom_alert_rules',
  'prom_alert_slack','prom_alert_email',
  'prom_file_ext'
];
ok('F5-1  22 champs', prIds.length === 22);
EXP_PR.forEach((id,i) => ok(`F5-${i+2}  "${id}"`, prIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F6 — backup (20 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F6 \u00b7 backup (20 champs) \u2500\u2500');
const bkIds = fieldsOf('backup').map(f => f.id);
const EXP_BK = [
  'bk_tool','bk_src','bk_exclude',
  'bk_dest_type','bk_dest_path','bk_repo_pass',
  'bk_aws_key','bk_aws_secret','bk_ssh_user','bk_ssh_host',
  'bk_keep_daily','bk_keep_weekly','bk_keep_monthly','bk_keep_yearly',
  'bk_prune','bk_verify',
  'bk_notify_slack','bk_notify_email','bk_notify_on',
  'bk_file_ext'
];
ok('F6-1  20 champs', bkIds.length === 20);
EXP_BK.forEach((id,i) => ok(`F6-${i+2}  "${id}"`, bkIds.includes(id)));

const af = allFields();
ok('F-TOTAL  154 champs au total', af.length === 154);

/* ══════════════════════════════════════════════════════════════════
   S — F-15 sensitive
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 S \u00b7 F-15 sensitive \u2500\u2500');
const sensitiveIds = af.filter(f => f.sensitive === true).map(f => f.id);
const EXP_SENSITIVE = [
  'redis_password','redis_replica_auth','pf_relay_pass','bk_repo_pass','bk_aws_secret'
];
ok('S-1  5 champs sensitive',           sensitiveIds.length === 5);
EXP_SENSITIVE.forEach((id,i) =>
  ok(`S-${i+2}  "${id}" sensitive:true`, sensitiveIds.includes(id)));
ok('S-7  tous password ont sensitive:true',
   af.filter(f => f.type === 'password').every(f => f.sensitive === true));
ok('S-8  aucun sensitive en value non vide',
   af.filter(f => f.sensitive).every(f => f.value === '' || f.value === undefined));

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 P0 \u00b7 Conformit\u00e9 P0 \u2500\u2500');
const fld = (id) => af.find(f => f.id === id);

/* Values vidées */
ok('P0-1  ng_server_name value=""   (example.com vid\u00e9)',
   fld('ng_server_name')?.value    === '');
ok('P0-2  ng_root value=""          (/var/www/html vid\u00e9)',
   fld('ng_root')?.value           === '');
ok('P0-3  ng_ssl_cert value=""      (letsencrypt vid\u00e9)',
   fld('ng_ssl_cert')?.value       === '');
ok('P0-4  ng_ssl_key value=""       (letsencrypt vid\u00e9)',
   fld('ng_ssl_key')?.value        === '');
ok('P0-5  redis_ssl_cert value=""   (/path/to vid\u00e9)',
   fld('redis_ssl_cert')?.value    === '');
ok('P0-6  redis_ssl_key value=""    (/path/to vid\u00e9)',
   fld('redis_ssl_key')?.value     === '');
ok('P0-7  redis_dir value=""        (/var/lib/redis vid\u00e9)',
   fld('redis_dir')?.value         === '');
ok('P0-8  pf_hostname value=""      (mail.example.com vid\u00e9)',
   fld('pf_hostname')?.value       === '');
ok('P0-9  pf_domain value=""        (example.com vid\u00e9)',
   fld('pf_domain')?.value         === '');
ok('P0-10 pf_cert value=""          (/etc/ssl vid\u00e9)',
   fld('pf_cert')?.value           === '');
ok('P0-11 pf_key value=""           (/etc/ssl vid\u00e9)',
   fld('pf_key')?.value            === '');
ok('P0-12 pf_aliases value=""       (hash:/etc vid\u00e9)',
   fld('pf_aliases')?.value        === '');
ok('P0-13 prom_alert_rules value="" (/etc/prometheus vid\u00e9)',
   fld('prom_alert_rules')?.value  === '');
ok('P0-14 bk_src value=""           (chemins absolus vid\u00e9s)',
   fld('bk_src')?.value            === '');

/* Placeholders neutralisés */
ok('P0-15 ng_server_name ph sans example.com',
   !/example\.com/.test(fld('ng_server_name')?.placeholder ?? ''));
ok('P0-16 ng_proxy_pass ph sans 127.0.0.1 direct',
   !/^\d{1,3}\.\d{1,3}/.test(fld('ng_proxy_pass')?.placeholder ?? ''));
ok('P0-17 pg_hba_subnet ph sans IP',
   !/^\d{1,3}\.\d{1,3}/.test(fld('pg_hba_subnet')?.placeholder ?? ''));
ok('P0-18 redis_unixsocket ph sans chemin absolu direct',
   !/^\/run\//.test(fld('redis_unixsocket')?.placeholder ?? ''));
ok('P0-19 redis_replica_of ph sans IP directe',
   !/^\d{1,3}\.\d{1,3}/.test(fld('redis_replica_of')?.placeholder ?? ''));
ok('P0-20 bk_dest_path ph sans chemin/bucket concret',
   !/^\/backup\b/.test(fld('bk_dest_path')?.placeholder ?? ''));

/* Règles générales */
ok('P0-21 pas de /etc/ en value (sauf ref variable $)',
   !af.some(f => typeof f.value === 'string' && /^\/etc\//.test(f.value)));
ok('P0-22 pas de /var/ en value',
   !af.some(f => typeof f.value === 'string' && /^\/var\//.test(f.value)));
ok('P0-23 pas de /path/ en value',
   !af.some(f => typeof f.value === 'string' && /^\/path\//.test(f.value)));
ok('P0-24 pas de example.com en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('example.com')));
ok('P0-25 pas de localStorage.setItem', !src.includes('localStorage.setItem'));
ok('P0-26 pas de document.write',       !src.includes('document.write'));

/* Valeurs conservées */
ok('P0-27 ng_proxy_pass value localhost:3000 conserv\u00e9',
   (fld('ng_proxy_pass')?.value ?? '').includes('localhost:3000'));
ok('P0-28 pf_networks loopback conserv\u00e9',
   (fld('pf_networks')?.value ?? '').includes('127.0.0.0/8'));
ok('P0-29 prom_path localhost:9090 conserv\u00e9',
   (fld('prom_path')?.value ?? '').includes('localhost:9090'));
ok('P0-30 prom_alertmgr_url localhost:9093 conserv\u00e9',
   (fld('prom_alertmgr_url')?.value ?? '').includes('localhost:9093'));

/* ══════════════════════════════════════════════════════════════════
   C — Conditions (vide)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 C \u00b7 Conditions \u2500\u2500');
ok('C-1  conditions vide', Array.isArray(D.conditions) && D.conditions.length === 0);

/* ══════════════════════════════════════════════════════════════════
   V — Validators
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 V \u00b7 Validators \u2500\u2500');
ok('V-1  validators non vide', D.validators.length > 0);
ok('V-2  tous ont field string',
   D.validators.every(v => typeof v?.field === 'string' && v.field.length > 0));
ok('V-3  ng_server_name required',
   D.validators.some(v => v.field === 'ng_server_name' && v.required));
ok('V-4  pf_hostname required',
   D.validators.some(v => v.field === 'pf_hostname'    && v.required));
ok('V-5  pf_domain required',
   D.validators.some(v => v.field === 'pf_domain'      && v.required));

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 B \u00b7 Profile bindings \u2500\u2500');
ok('B-1  profile_bindings vide',
   Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* Résumé */
const tot = _pass + _fail;
console.log(`\n${'─'.repeat(60)}`);
console.log(`  apps-config.smoke v1.0  \u00b7  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
