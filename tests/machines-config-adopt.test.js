/**
 * tests/machines-config-adopt.test.js
 * LocalCMS · GO_LOCALCMS_MACHINES_CONFIG_ADOPT_01 · GO-8/8
 *
 * Adopt test DATA-ONLY pour modules/machines-config.js — MOD_MACHINES_CFG_DATA
 *
 * Module  : machines_cfg
 * Forms   : profile(12) / ssh(14) / sftp_ftp(9) / vpn(12) / routes(6) /
 *           external_apps(12) = 65 champs
 * F-15    : 7 sensitive — mc_ssh_pass / mc_ftp_pass / mc_vpn_privkey /
 *           mc_vpn_psk / mc_ext_api_key / mc_ext_client_secret / mc_ext_webhook_secret
 * VAL     : 6 — mc_ssh_host:req · mc_ftp_host:req · mc_ext_url:url ·
 *               mc_ext_oauth_url:url · mc_ext_webhook_url:url · mc_vpn_server:req
 * COND    : 4 — mc_ssh_auth → show selon méthode d'auth
 * BIND    : 0 (vide — source des profils, pas de binding entrant)
 *
 * Pattern : eval(src.replace(/\bconst\s+MOD_MACHINES_CFG_DATA\b/, 'globalThis.MOD_MACHINES_CFG_DATA'))
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
const src = fs.readFileSync(path.join(__dirname, '../modules/machines-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_MACHINES_CFG_DATA\b/, 'globalThis.MOD_MACHINES_CFG_DATA'));
const D = globalThis.MOD_MACHINES_CFG_DATA;

/* ─── helpers ───────────────────────────────────────────────────── */
const allFields   = () => Object.values(D.forms).flatMap(f => f.sections.flatMap(s => s.fields));
const fieldInForm = (fk, id) => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).find(f => f.id === id);
const countInForm = (fk) => (D.forms[fk]?.sections ?? []).reduce((n, s) => n + s.fields.length, 0);

/* ══════════════════════════════════════════════════════════════════
   BANNER
   ══════════════════════════════════════════════════════════════════ */
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  MACHINES_CFG ADOPT — Tests MOD_MACHINES_CFG_DATA       ║');
console.log('╚══════════════════════════════════════════════════════════╝');

/* ══════════════════════════════════════════════════════════════════
   INIT — Chargement module
   ══════════════════════════════════════════════════════════════════ */
section('INIT — Chargement module');
ok('INIT01: MOD_MACHINES_CFG_DATA est un objet non-null',
  D !== null && typeof D === 'object');
ok('INIT02: id = "machines_cfg"',
  D.id === 'machines_cfg');

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
section('M — Identité');
ok('M01: label = "Machines & Profils"',
  D.label === 'Machines & Profils');
ok('M02: version semver x.y.z',
  /^\d+\.\d+\.\d+$/.test(D.version));
ok('M03: type = "config"',
  D.type === 'config');
ok('M04: capabilities inclut "render"',
  Array.isArray(D.capabilities) && D.capabilities.includes('render'));
ok('M05: capabilities inclut "generate"',
  D.capabilities.includes('generate'));
ok('M06: meta.activeDefault = "profile"',
  D.meta?.activeDefault === 'profile');
ok('M07: meta.typeLabels.ssh = "SSH"',
  D.meta?.typeLabels?.ssh === 'SSH');
ok('M08: meta.typeLabels.external_apps = "Apps Externes"',
  D.meta?.typeLabels?.external_apps === 'Apps Externes');

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
section('K — Structure');
ok('K01: forms est un objet (non-Array)',
  D.forms !== null && typeof D.forms === 'object' && !Array.isArray(D.forms));
ok('K02: exactement 6 forms déclarés',
  Object.keys(D.forms).length === 6);
ok('K03: clés forms attendues présentes',
  ['profile','ssh','sftp_ftp','vpn','routes','external_apps'].every(k => k in D.forms));
ok('K04: conditions[] — 4 entrées',
  Array.isArray(D.conditions) && D.conditions.length === 4);
ok('K05: validators[] — 6 entrées',
  Array.isArray(D.validators) && D.validators.length === 6);
ok('K06: profile_bindings[] vide',
  Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   F1 — form profile (12 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F1 — form profile (12 champs)');
ok('F1-01: 12 champs dans profile',
  countInForm('profile') === 12);
ok('F1-02: id form = "mc-profile"',
  D.forms.profile?.id === 'mc-profile');
ok('F1-03: mc_role — select, value "web"', (() => {
  const f = fieldInForm('profile', 'mc_role');
  return f?.type === 'select' && f?.value === 'web';
})());
ok('F1-04: mc_env — select, value "dev"', (() => {
  const f = fieldInForm('profile', 'mc_env');
  return f?.type === 'select' && f?.value === 'dev';
})());
ok('F1-05: mc_cpu — number, value "2"', (() => {
  const f = fieldInForm('profile', 'mc_cpu');
  return f?.type === 'number' && f?.value === '2';
})());
ok('F1-06: mc_ram — number, value "4"', (() => {
  const f = fieldInForm('profile', 'mc_ram');
  return f?.type === 'number' && f?.value === '4';
})());

/* ══════════════════════════════════════════════════════════════════
   F2 — form ssh (14 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F2 — form ssh (14 champs)');
ok('F2-01: 14 champs dans ssh',
  countInForm('ssh') === 14);
ok('F2-02: id form = "mc-ssh"',
  D.forms.ssh?.id === 'mc-ssh');
ok('F2-03: mc_ssh_port — select, value "22"', (() => {
  const f = fieldInForm('ssh', 'mc_ssh_port');
  return f?.type === 'select' && f?.value === '22';
})());
ok('F2-04: mc_ssh_auth — select, value "key"', (() => {
  const f = fieldInForm('ssh', 'mc_ssh_auth');
  return f?.type === 'select' && f?.value === 'key';
})());
ok('F2-05: mc_ssh_pass — password + sensitive + value ""', (() => {
  const f = fieldInForm('ssh', 'mc_ssh_pass');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F2-06: mc_ssh_timeout — number, value "10"', (() => {
  const f = fieldInForm('ssh', 'mc_ssh_timeout');
  return f?.type === 'number' && f?.value === '10';
})());
ok('F2-07: mc_ssh_mux — toggle, value true', (() => {
  const f = fieldInForm('ssh', 'mc_ssh_mux');
  return f?.type === 'toggle' && f?.value === true;
})());

/* ══════════════════════════════════════════════════════════════════
   F3 — form sftp_ftp (9 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F3 — form sftp_ftp (9 champs)');
ok('F3-01: 9 champs dans sftp_ftp',
  countInForm('sftp_ftp') === 9);
ok('F3-02: id form = "mc-sftp"',
  D.forms.sftp_ftp?.id === 'mc-sftp');
ok('F3-03: mc_ftp_type — select, value "sftp"', (() => {
  const f = fieldInForm('sftp_ftp', 'mc_ftp_type');
  return f?.type === 'select' && f?.value === 'sftp';
})());
ok('F3-04: mc_ftp_pass — password + sensitive + value ""', (() => {
  const f = fieldInForm('sftp_ftp', 'mc_ftp_pass');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F3-05: mc_ftp_root — value "" (P0 vidé)', (() => {
  const f = fieldInForm('sftp_ftp', 'mc_ftp_root');
  return f?.value === '';
})());

/* ══════════════════════════════════════════════════════════════════
   F4 — form vpn (12 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F4 — form vpn (12 champs)');
ok('F4-01: 12 champs dans vpn',
  countInForm('vpn') === 12);
ok('F4-02: id form = "mc-vpn"',
  D.forms.vpn?.id === 'mc-vpn');
ok('F4-03: mc_vpn_type — select, value "wireguard"', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_type');
  return f?.type === 'select' && f?.value === 'wireguard';
})());
ok('F4-04: mc_vpn_privkey — password + sensitive + value ""', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_privkey');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F4-05: mc_vpn_psk — password + sensitive + value ""', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_psk');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F4-06: mc_vpn_routes — value "0.0.0.0/0" (route neutre P0)', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_routes');
  return f?.value === '0.0.0.0/0';
})());
ok('F4-07: mc_vpn_keepalive — number, value "25"', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_keepalive');
  return f?.type === 'number' && f?.value === '25';
})());

/* ══════════════════════════════════════════════════════════════════
   F5 — form routes (6 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F5 — form routes (6 champs)');
ok('F5-01: 6 champs dans routes',
  countInForm('routes') === 6);
ok('F5-02: id form = "mc-routes"',
  D.forms.routes?.id === 'mc-routes');
ok('F5-03: mc_rt_hosts — textarea, value "" (P0 vidé)', (() => {
  const f = fieldInForm('routes', 'mc_rt_hosts');
  return f?.type === 'textarea' && f?.value === '';
})());
ok('F5-04: mc_rt_default_gw — value "" (P0 vidé)', (() => {
  const f = fieldInForm('routes', 'mc_rt_default_gw');
  return f?.value === '';
})());
ok('F5-05: mc_rt_mtu — number, value "1500"', (() => {
  const f = fieldInForm('routes', 'mc_rt_mtu');
  return f?.type === 'number' && f?.value === '1500';
})());

/* ══════════════════════════════════════════════════════════════════
   F6 — form external_apps (12 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F6 — form external_apps (12 champs)');
ok('F6-01: 12 champs dans external_apps',
  countInForm('external_apps') === 12);
ok('F6-02: id form = "mc-extapps"',
  D.forms.external_apps?.id === 'mc-extapps');
ok('F6-03: mc_ext_type — select, value "gdrive"', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_type');
  return f?.type === 'select' && f?.value === 'gdrive';
})());
ok('F6-04: mc_ext_api_key — password + sensitive + value ""', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_api_key');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F6-05: mc_ext_client_secret — password + sensitive + value ""', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_client_secret');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F6-06: mc_ext_webhook_secret — password + sensitive + value ""', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_webhook_secret');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());

/* ══════════════════════════════════════════════════════════════════
   TYPE — Types critiques
   ══════════════════════════════════════════════════════════════════ */
section('TYPE — Types critiques');
ok('TYPE01: url présent (mc_ext_url)',
  fieldInForm('external_apps', 'mc_ext_url')?.type === 'url');
ok('TYPE02: url présent (mc_ext_oauth_url)',
  fieldInForm('external_apps', 'mc_ext_oauth_url')?.type === 'url');
ok('TYPE03: url présent (mc_ext_webhook_url)',
  fieldInForm('external_apps', 'mc_ext_webhook_url')?.type === 'url');
ok('TYPE04: textarea présent (mc_rt_hosts)',
  fieldInForm('routes', 'mc_rt_hosts')?.type === 'textarea');
ok('TYPE05: toggle présent dans ssh',
  (D.forms.ssh?.sections ?? []).flatMap(s => s.fields).some(f => f.type === 'toggle'));
ok('TYPE06: toggle présent dans vpn',
  (D.forms.vpn?.sections ?? []).flatMap(s => s.fields).some(f => f.type === 'toggle'));

/* ══════════════════════════════════════════════════════════════════
   VAL — validators (6 entrées exactes)
   ══════════════════════════════════════════════════════════════════ */
section('VAL — validators');
ok('VAL01: validators est tableau',
  Array.isArray(D.validators));
ok('VAL02: 6 entrées validators',
  D.validators.length === 6);
ok('VAL03: mc_ssh_host — required:true',
  D.validators.some(v => v.field === 'mc_ssh_host' && v.required === true));
ok('VAL04: mc_ftp_host — required:true',
  D.validators.some(v => v.field === 'mc_ftp_host' && v.required === true));
ok('VAL05: mc_vpn_server — required:true',
  D.validators.some(v => v.field === 'mc_vpn_server' && v.required === true));
ok('VAL06: mc_ext_url — url:true',
  D.validators.some(v => v.field === 'mc_ext_url' && v.url === true));
ok('VAL07: mc_ext_oauth_url — url:true',
  D.validators.some(v => v.field === 'mc_ext_oauth_url' && v.url === true));
ok('VAL08: mc_ext_webhook_url — url:true',
  D.validators.some(v => v.field === 'mc_ext_webhook_url' && v.url === true));

/* ══════════════════════════════════════════════════════════════════
   COND — conditions (4 règles mc_ssh_auth → show)
   ══════════════════════════════════════════════════════════════════ */
section('COND — conditions (4 règles)');
ok('COND01: exactement 4 conditions',
  D.conditions.length === 4);
ok('COND02: toutes portent sur mc_ssh_auth',
  D.conditions.every(c => c.when?.field === 'mc_ssh_auth'));
ok('COND03: key → show mc_ssh_key', (() => {
  const c = D.conditions.find(c => c.when.eq === 'key');
  return Array.isArray(c?.show) && c.show.includes('mc_ssh_key') && c.show.length === 1;
})());
ok('COND04: password → show mc_ssh_pass', (() => {
  const c = D.conditions.find(c => c.when.eq === 'password');
  return Array.isArray(c?.show) && c.show.includes('mc_ssh_pass') && c.show.length === 1;
})());
ok('COND05: key+password → show mc_ssh_key + mc_ssh_pass', (() => {
  const c = D.conditions.find(c => c.when.eq === 'key+password');
  return Array.isArray(c?.show)
    && c.show.includes('mc_ssh_key')
    && c.show.includes('mc_ssh_pass')
    && c.show.length === 2;
})());
ok('COND06: certificate → show mc_ssh_cert', (() => {
  const c = D.conditions.find(c => c.when.eq === 'certificate');
  return Array.isArray(c?.show) && c.show.includes('mc_ssh_cert') && c.show.length === 1;
})());

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (7 champs)
   ══════════════════════════════════════════════════════════════════ */
section('S — sensitive F-15 (7 champs)');
const sensitiveExpected = [
  'mc_ssh_pass','mc_ftp_pass',
  'mc_vpn_privkey','mc_vpn_psk',
  'mc_ext_api_key','mc_ext_client_secret','mc_ext_webhook_secret',
];
ok('S01: mc_ssh_pass — password + sensitive (ssh)', (() => {
  const f = fieldInForm('ssh', 'mc_ssh_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S02: mc_ftp_pass — password + sensitive (sftp_ftp)', (() => {
  const f = fieldInForm('sftp_ftp', 'mc_ftp_pass');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S03: mc_vpn_privkey — password + sensitive (vpn)', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_privkey');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S04: mc_vpn_psk — password + sensitive (vpn)', (() => {
  const f = fieldInForm('vpn', 'mc_vpn_psk');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S05: mc_ext_api_key — password + sensitive (external_apps)', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_api_key');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S06: mc_ext_client_secret — password + sensitive (external_apps)', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_client_secret');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S07: mc_ext_webhook_secret — password + sensitive (external_apps)', (() => {
  const f = fieldInForm('external_apps', 'mc_ext_webhook_secret');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S08: aucun autre champ sensitive hors des 7 attendus', (() => {
  const ids = allFields().filter(f => f.sensitive === true).map(f => f.id).sort().join(',');
  return ids === sensitiveExpected.slice().sort().join(',');
})());

/* ══════════════════════════════════════════════════════════════════
   TOT — Total champs
   ══════════════════════════════════════════════════════════════════ */
section('TOT — Total champs');
ok('TOT01: 65 champs au total (12+14+9+12+6+12)',
  allFields().length === 65);
ok('TOT02: tous les champs ont un id string non vide',
  allFields().every(f => typeof f.id === 'string' && f.id.length > 0));
ok('TOT03: exactement 7 champs sensitive:true (F-15)',
  allFields().filter(f => f.sensitive === true).length === 7);
ok('TOT04: exactement 7 champs type=password',
  allFields().filter(f => f.type === 'password').length === 7);

/* ─── résultat ──────────────────────────────────────────────────── */
const total = pass + fail;
console.log('\n' + '═'.repeat(58));
console.log(`  Résultat : ${total} tests — ${pass} ✓  ${fail} ✗`);
console.log(`  STATUT : ${fail === 0 ? 'PASS' : 'FAIL'}`);
if (fail > 0) process.exit(1);
