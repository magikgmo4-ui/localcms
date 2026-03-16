/**
 * modules/sec-config.smoke.js — Smoke tests M-4.2 v1.0
 * LocalCMS · modules/sec-config.js
 *
 * Blocs :
 *   P  — Pureté
 *   M  — Identité
 *   K  — Structure (forms, meta, conditions, validators, bindings)
 *   F1 — ssl           (28 champs)
 *   F2 — fail2ban      (20 champs)
 *   F3 — gpg           (14 champs)
 *   F4 — secrets       ( 7 champs)
 *   F5 — ssh_hardening (20 champs)
 *   F6 — scan          (19 champs)
 *   S  — F-15 sensitive (1 champ)
 *   P0 — Conformité P0
 *   C  — Conditions (vide)
 *   V  — Validators
 *   B  — Profile bindings
 *
 * Exécution : node modules/sec-config.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'sec-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_SEC_CFG_DATA\b/, 'globalThis.MOD_SEC_CFG_DATA'));

const D = globalThis.MOD_SEC_CFG_DATA;

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
console.log('\n── P · Pureté ──');
ok('P-1  MOD_SEC_CFG_DATA est un objet', typeof D === 'object' && D !== null);
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

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── M · Identité ──');
ok('M-1  id = "sec_cfg"',            D.id           === 'sec_cfg');
ok('M-2  label non vide',            typeof D.label === 'string' && D.label.length > 0);
ok('M-3  version semver',            /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',           D.type         === 'config');
ok('M-5  os_compat includes "all"',  (D.os_compat ?? []).includes('all'));
ok('M-6  capabilities includes "generate"', (D.capabilities ?? []).includes('generate'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── K · Structure ──');
ok('K-1  meta présent',                      D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "ssl"',        D.meta?.activeDefault === 'ssl');
ok('K-3  meta.typeIcons présent (6)',         Object.keys(D.meta?.typeIcons ?? {}).length === 6);
ok('K-4  meta.typeLabels présent (6)',        Object.keys(D.meta?.typeLabels ?? {}).length === 6);
ok('K-5  forms présent',                     D.forms && typeof D.forms === 'object');
ok('K-6  6 forms déclarés',                  Object.keys(D.forms ?? {}).length === 6);
['ssl','fail2ban','gpg','secrets','ssh_hardening','scan'].forEach((k,i) =>
  ok(`K-${7+i}  forms contient "${k}"`, k in (D.forms ?? {})));
ok('K-13 chaque form a id',
   Object.values(D.forms ?? {}).every(f => typeof f.id === 'string' && f.id.length > 0));
ok('K-14 chaque form a sections[]',
   Object.values(D.forms ?? {}).every(f => Array.isArray(f.sections) && f.sections.length > 0));
ok('K-15 conditions tableau',    Array.isArray(D.conditions));
ok('K-16 validators tableau',    Array.isArray(D.validators));
ok('K-17 profile_bindings tab.', Array.isArray(D.profile_bindings));
ok('K-18 pas de clé "generators"', !('generators' in D));

/* ══════════════════════════════════════════════════════════════════
   F1 — ssl (28 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F1 · ssl (28 champs) ──');
const sslIds = fieldsOf('ssl').map(f => f.id);
const EXP_SSL = [
  'ssl_method','ssl_domain','ssl_san','ssl_email','ssl_challenge','ssl_dns_provider',
  'ssl_webroot','ssl_auto_renew','ssl_renew_hook',
  'ssl_key_type','ssl_key_size','ssl_ec_curve','ssl_key_out','ssl_cert_out','ssl_csr_out',
  'ssl_days','ssl_cn','ssl_org','ssl_country','ssl_state','ssl_city',
  'ssl_protocols','ssl_ciphers','ssl_ciphers_custom','ssl_stapling',
  'ssl_session_cache','ssl_session_timeout',
  'ssl_file_ext'
];
ok('F1-1  28 champs', sslIds.length === 28);
EXP_SSL.forEach((id,i) => ok(`F1-${i+2}  "${id}"`, sslIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F2 — fail2ban (20 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F2 · fail2ban (20 champs) ──');
const f2bIds = fieldsOf('fail2ban').map(f => f.id);
const EXP_F2B = [
  'f2b_bantime','f2b_findtime','f2b_maxretry','f2b_ignoreip','f2b_backend',
  'f2b_destemail','f2b_action',
  'f2b_ssh','f2b_ssh_port','f2b_nginx_http','f2b_nginx_badbots','f2b_nginx_limit',
  'f2b_postfix','f2b_dovecot','f2b_recidive',
  'f2b_custom_name','f2b_custom_filter','f2b_custom_logpath','f2b_custom_port',
  'f2b_file_ext'
];
ok('F2-1  20 champs', f2bIds.length === 20);
EXP_F2B.forEach((id,i) => ok(`F2-${i+2}  "${id}"`, f2bIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F3 — gpg (14 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F3 · gpg (14 champs) ──');
const gpgIds = fieldsOf('gpg').map(f => f.id);
const EXP_GPG = [
  'gpg_action','gpg_key_type','gpg_key_length','gpg_expire','gpg_name',
  'gpg_email','gpg_comment','gpg_passphrase',
  'gpg_batch','gpg_armor','gpg_cipher','gpg_hash','gpg_recipient',
  'gpg_file_ext'
];
ok('F3-1  14 champs', gpgIds.length === 14);
EXP_GPG.forEach((id,i) => ok(`F3-${i+2}  "${id}"`, gpgIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F4 — secrets (7 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F4 · secrets (7 champs) ──');
const secIds = fieldsOf('secrets').map(f => f.id);
const EXP_SEC = ['sec_tool','sec_backend','sec_file','sec_recipients','sec_kms_key','sec_vars','sec_file_ext'];
ok('F4-1  7 champs', secIds.length === 7);
EXP_SEC.forEach((id,i) => ok(`F4-${i+2}  "${id}"`, secIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F5 — ssh_hardening (20 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F5 · ssh_hardening (20 champs) ──');
const sshhIds = fieldsOf('ssh_hardening').map(f => f.id);
const EXP_SSHH = [
  'sshh_port','sshh_address_family','sshh_root','sshh_password','sshh_pubkey',
  'sshh_max_auth','sshh_max_sess','sshh_login_grace',
  'sshh_x11','sshh_agent','sshh_tcp',
  'sshh_alive_interval','sshh_alive_count','sshh_banner',
  'sshh_allow_users','sshh_allow_groups',
  'sshh_kex','sshh_ciphers','sshh_macs',
  'sshh_file_ext'
];
ok('F5-1  20 champs', sshhIds.length === 20);
EXP_SSHH.forEach((id,i) => ok(`F5-${i+2}  "${id}"`, sshhIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F6 — scan (19 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F6 · scan (19 champs) ──');
const scanIds = fieldsOf('scan').map(f => f.id);
const EXP_SCAN = [
  'scan_trivy','scan_trivy_target','scan_trivy_severity',
  'scan_bandit','scan_semgrep','scan_semgrep_rules',
  'scan_npm_audit','scan_pip_audit','scan_snyk',
  'scan_output_format','scan_fail_on',
  'scan_pwd_len','scan_pwd_upper','scan_pwd_digit','scan_pwd_special',
  'scan_pwd_expire','scan_2fa','scan_2fa_method',
  'scan_file_ext'
];
ok('F6-1  19 champs', scanIds.length === 19);
EXP_SCAN.forEach((id,i) => ok(`F6-${i+2}  "${id}"`, scanIds.includes(id)));

const af = allFields();
ok('F-TOTAL  108 champs au total', af.length === 108);

/* ══════════════════════════════════════════════════════════════════
   S — F-15 sensitive
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── S · F-15 sensitive ──');
const sensitiveIds = af.filter(f => f.sensitive === true).map(f => f.id);
ok('S-1  1 champ sensitive',      sensitiveIds.length === 1);
ok('S-2  "gpg_passphrase" sensitive:true', sensitiveIds.includes('gpg_passphrase'));
ok('S-3  gpg_passphrase type=password',
   af.find(f => f.id === 'gpg_passphrase')?.type === 'password');
ok('S-4  tous password ont sensitive:true',
   af.filter(f => f.type === 'password').every(f => f.sensitive === true));

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P0 · Conformité P0 ──');
const fld = (id) => af.find(f => f.id === id);

// Values vidées
ok('P0-1  ssl_webroot value=""  (/var/www/html vidé)',   fld('ssl_webroot')?.value  === '');
ok('P0-2  f2b_destemail value="" (email exemple vidé)',  fld('f2b_destemail')?.value === '');
ok('P0-3  sshh_banner value=""  (/etc/issue.net vidé)',  fld('sshh_banner')?.value  === '');

// Placeholders neutralisés
ok('P0-4  ssl_domain ph sans example.com',
   !/example\./.test(fld('ssl_domain')?.placeholder ?? ''));
ok('P0-5  ssl_san ph sans example.com',
   !/example\./.test(fld('ssl_san')?.placeholder ?? ''));
ok('P0-6  ssl_cn ph sans example.com',
   !/example\./.test(fld('ssl_cn')?.placeholder ?? ''));
ok('P0-7  gpg_recipient ph sans user@example',
   !/user@example/.test(fld('gpg_recipient')?.placeholder ?? ''));
ok('P0-8  f2b_custom_logpath ph sans /var/log/',
   !/^\/var\/log/.test(fld('f2b_custom_logpath')?.placeholder ?? ''));

// Règles générales
ok('P0-9  pas de /var/www en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('/var/www')));
ok('P0-10 pas de /etc/ en value',
   !af.some(f => typeof f.value === 'string' && /^\/etc\//.test(f.value)));
ok('P0-11 pas de example.com en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('example.com')));
ok('P0-12 pas de localStorage.setItem', !src.includes('localStorage.setItem'));
ok('P0-13 pas de document.write',       !src.includes('document.write'));

// Valeurs conservées
ok('P0-14 ssl_renew_hook conservé (commande standard)',
   fld('ssl_renew_hook')?.value === 'systemctl reload nginx');
ok('P0-15 f2b_ignoreip conservé (localhost)',
   fld('f2b_ignoreip')?.value === '127.0.0.1/8 ::1');
ok('P0-16 sshh_kex conservé (hardening standard)',
   (fld('sshh_kex')?.value ?? '').includes('curve25519-sha256'));

/* ══════════════════════════════════════════════════════════════════
   C — Conditions (vide)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── C · Conditions ──');
ok('C-1  conditions vide', Array.isArray(D.conditions) && D.conditions.length === 0);

/* ══════════════════════════════════════════════════════════════════
   V — Validators
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── V · Validators ──');
ok('V-1  validators non vide', D.validators.length > 0);
ok('V-2  tous ont field string',
   D.validators.every(v => typeof v?.field === 'string' && v.field.length > 0));
ok('V-3  ssl_domain required',
   D.validators.some(v => v.field === 'ssl_domain' && v.required));

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── B · Profile bindings ──');
ok('B-1  profile_bindings vide',
   Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* Résumé */
const tot = _pass + _fail;
console.log(`\n${'─'.repeat(60)}`);
console.log(`  sec-config.smoke v1.0  ·  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
