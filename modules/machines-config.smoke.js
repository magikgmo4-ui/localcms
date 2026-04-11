/**
 * modules/machines-config.smoke.js — Smoke tests M-3.2 v1.0
 * LocalCMS · modules/machines-config.js
 *
 * Orientation : équivalence réelle avec l'inline d'origine.
 *
 * Blocs :
 *   P  — Pureté (aucune fonction dans le manifeste)
 *   M  — Manifeste identité
 *   K  — Structure (forms, meta, conditions, validators, bindings)
 *   F1 — Champs profile        (12 champs)
 *   F2 — Champs ssh            (14 champs)
 *   F3 — Champs sftp_ftp       ( 9 champs)
 *   F4 — Champs vpn            (12 champs)
 *   F5 — Champs routes         ( 6 champs)
 *   F6 — Champs external_apps  (12 champs)
 *   S  — sensitive F-15        (7 champs password)
 *   P0 — Conformité P0 (pas de paths/IPs hardcodées, pas de logique)
 *   C  — Conditions when/show
 *   V  — Validateurs
 *   B  — Profile bindings
 *
 * Exécution : node modules/machines-config.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'machines-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_MACHINES_CFG_DATA\b/, 'globalThis.MOD_MACHINES_CFG_DATA')); // eslint-disable-line

const D = globalThis.MOD_MACHINES_CFG_DATA;

let _pass = 0, _fail = 0;
const ok = (label, cond) => {
  if (cond) { process.stdout.write(`  \u2713  ${label}\n`); _pass++; }
  else       { process.stderr.write(`  \u2717  ${label}\n`); _fail++; }
};

const fieldsOf = (k) => (D.forms[k]?.sections ?? []).flatMap(s => s.fields ?? []);
const fieldIds = (k) => fieldsOf(k).map(f => f.id);
const allFields = () => Object.keys(D.forms).flatMap(k => fieldsOf(k));

/* ══════════════════════════════════════════════════════════════════
   P — Pureté
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P · Pureté ──');
ok('P-1  MOD_MACHINES_CFG_DATA est un objet', typeof D === 'object' && D !== null);
ok('P-2  pas de fonction top-level',
   Object.values(D).every(v => typeof v !== 'function'));
ok('P-3  meta : pas de fonction',
   Object.values(D.meta ?? {}).every(v => typeof v !== 'function'));
ok('P-4  champs forms : pas de fonction',
   Object.values(D.forms ?? {}).every(form =>
     (form.sections ?? []).every(sec =>
       (sec.fields ?? []).every(f =>
         Object.values(f).every(v => typeof v !== 'function')))));
ok('P-5  conditions : objets purs',
   (D.conditions ?? []).every(c => typeof c === 'object' && typeof c.when === 'object'));

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── M · Identité ──');
ok('M-1  id = "machines_cfg"',            D.id           === 'machines_cfg');
ok('M-2  label non vide',                 typeof D.label === 'string' && D.label.length > 0);
ok('M-3  version semver',                 /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',                D.type         === 'config');
ok('M-5  os_compat includes "all"',       (D.os_compat   ?? []).includes('all'));
ok('M-6  interfaces includes "config"',   (D.interfaces  ?? []).includes('config'));
ok('M-7  capabilities includes "render"', (D.capabilities ?? []).includes('render'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── K · Structure ──');
ok('K-1  meta présent',                         D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "profile"',       D.meta?.activeDefault === 'profile');
ok('K-3  meta.typeIcons (6 clés)',               Object.keys(D.meta?.typeIcons ?? {}).length === 6);
ok('K-4  meta.typeLabels (6 clés)',              Object.keys(D.meta?.typeLabels ?? {}).length === 6);
ok('K-5  6 forms déclarés',                     Object.keys(D.forms ?? {}).length === 6);
ok('K-6  forms contient profile',               'profile'       in (D.forms ?? {}));
ok('K-7  forms contient ssh',                   'ssh'           in (D.forms ?? {}));
ok('K-8  forms contient sftp_ftp',              'sftp_ftp'      in (D.forms ?? {}));
ok('K-9  forms contient vpn',                   'vpn'           in (D.forms ?? {}));
ok('K-10 forms contient routes',                'routes'        in (D.forms ?? {}));
ok('K-11 forms contient external_apps',         'external_apps' in (D.forms ?? {}));
ok('K-12 conditions est tableau',               Array.isArray(D.conditions));
ok('K-13 validators est tableau',               Array.isArray(D.validators));
ok('K-14 profile_bindings est tableau',         Array.isArray(D.profile_bindings));

/* ══════════════════════════════════════════════════════════════════
   F1 — profile (12 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F1 · profile (12 champs) ──');
const F1 = ['mc_name','mc_role','mc_env','mc_os','mc_arch','mc_provider',
            'mc_region','mc_cpu','mc_ram','mc_disk','mc_tags','mc_notes'];
const f1Ids = fieldIds('profile');
ok('F1-1  12 champs', f1Ids.length === 12);
F1.forEach((id, i) => ok(`F1-${i+2}  "${id}" présent`, f1Ids.includes(id)));
ok('F1-14 form id = "mc-profile"', D.forms.profile?.id === 'mc-profile');
ok('F1-15 section first:true',     D.forms.profile?.sections?.[0]?.first === true);

/* ══════════════════════════════════════════════════════════════════
   F2 — ssh (14 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F2 · ssh (14 champs) ──');
const F2 = ['mc_ssh_host','mc_ssh_port','mc_ssh_user','mc_ssh_auth','mc_ssh_key',
            'mc_ssh_pass','mc_ssh_cert','mc_ssh_jump','mc_ssh_timeout','mc_ssh_alive',
            'mc_ssh_compress','mc_ssh_mux','mc_ssh_agent','mc_ssh_x11'];
const f2Ids = fieldIds('ssh');
ok('F2-1  14 champs', f2Ids.length === 14);
F2.forEach((id, i) => ok(`F2-${i+2}  "${id}" présent`, f2Ids.includes(id)));
ok('F2-16 form id = "mc-ssh"', D.forms.ssh?.id === 'mc-ssh');

/* ══════════════════════════════════════════════════════════════════
   F3 — sftp_ftp (9 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F3 · sftp_ftp (9 champs) ──');
const F3 = ['mc_ftp_type','mc_ftp_host','mc_ftp_port','mc_ftp_user','mc_ftp_pass',
            'mc_ftp_root','mc_ftp_passive','mc_ftp_tls_cert','mc_ftp_timeout'];
const f3Ids = fieldIds('sftp_ftp');
ok('F3-1  9 champs', f3Ids.length === 9);
F3.forEach((id, i) => ok(`F3-${i+2}  "${id}" présent`, f3Ids.includes(id)));
ok('F3-11 form id = "mc-sftp"', D.forms.sftp_ftp?.id === 'mc-sftp');

/* ══════════════════════════════════════════════════════════════════
   F4 — vpn (12 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F4 · vpn (12 champs) ──');
const F4 = ['mc_vpn_type','mc_vpn_server','mc_vpn_port','mc_vpn_iface','mc_vpn_privkey',
            'mc_vpn_pubkey','mc_vpn_psk','mc_vpn_local_ip','mc_vpn_routes','mc_vpn_dns',
            'mc_vpn_keepalive','mc_vpn_auto'];
const f4Ids = fieldIds('vpn');
ok('F4-1  12 champs', f4Ids.length === 12);
F4.forEach((id, i) => ok(`F4-${i+2}  "${id}" présent`, f4Ids.includes(id)));
ok('F4-14 form id = "mc-vpn"', D.forms.vpn?.id === 'mc-vpn');

/* ══════════════════════════════════════════════════════════════════
   F5 — routes (6 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F5 · routes (6 champs) ──');
const F5 = ['mc_rt_hostname','mc_rt_hosts','mc_rt_default_gw',
            'mc_rt_static','mc_rt_mtu','mc_rt_netns'];
const f5Ids = fieldIds('routes');
ok('F5-1  6 champs', f5Ids.length === 6);
F5.forEach((id, i) => ok(`F5-${i+2}  "${id}" présent`, f5Ids.includes(id)));
ok('F5-8  form id = "mc-routes"', D.forms.routes?.id === 'mc-routes');

/* ══════════════════════════════════════════════════════════════════
   F6 — external_apps (12 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F6 · external_apps (12 champs) ──');
const F6 = ['mc_ext_type','mc_ext_name','mc_ext_url','mc_ext_api_key',
            'mc_ext_client_id','mc_ext_client_secret','mc_ext_oauth_url',
            'mc_ext_scope','mc_ext_webhook_url','mc_ext_webhook_secret',
            'mc_ext_enabled','mc_ext_notes'];
const f6Ids = fieldIds('external_apps');
ok('F6-1  12 champs', f6Ids.length === 12);
F6.forEach((id, i) => ok(`F6-${i+2}  "${id}" présent`, f6Ids.includes(id)));
ok('F6-14 form id = "mc-extapps"', D.forms.external_apps?.id === 'mc-extapps');

const total = [f1Ids,f2Ids,f3Ids,f4Ids,f5Ids,f6Ids].reduce((s,a)=>s+a.length,0);
ok('F-TOTAL  65 champs au total', total === 65);

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (7 champs password)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── S · sensitive F-15 ──');
const SENSITIVE_IDS = ['mc_ssh_pass','mc_ftp_pass','mc_vpn_privkey','mc_vpn_psk',
                       'mc_ext_api_key','mc_ext_client_secret','mc_ext_webhook_secret'];
const af = allFields();
SENSITIVE_IDS.forEach((id, i) => {
  const f = af.find(x => x.id === id);
  ok(`S-${i+1}  ${id} type=password`,   f?.type      === 'password');
  ok(`S-${i+1}b ${id} sensitive:true`,  f?.sensitive === true);
});
ok('S-8  aucun champ sensitive non-password',
   af.filter(f => f.sensitive === true).every(f => f.type === 'password'));

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité chemins et données utilisateur
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P0 · Conformité chemins / données ──');

// Champs qui avaient des valeurs hardcodées dans l'inline → doivent être vides
const MUST_BE_EMPTY = ['mc_ssh_key','mc_ftp_root','mc_rt_hosts','mc_rt_default_gw',
                       'mc_vpn_local_ip','mc_vpn_dns'];
MUST_BE_EMPTY.forEach((id, i) => {
  const f = af.find(x => x.id === id);
  ok(`P0-${i+1}  ${id} value=''`, f?.value === '');
});

ok('P0-7  pas de /home/ dans source',           !src.includes('/home/'));
ok('P0-8  pas de ~/.ssh hardcodé en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('~/')));
ok('P0-9  pas de /var/ hardcodé en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('/var/')));
ok('P0-10 pas de 192.168. hardcodé en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('192.168.')));
ok('P0-11 pas de IP 10.0.0. hardcodée en value (sauf mc_vpn_routes 0.0.0.0/0)',
   !af.filter(f => f.id !== 'mc_vpn_routes')
       .some(f => typeof f.value === 'string' && /\b10\.\d+\.\d+\.\d+/.test(f.value)));
ok('P0-12 pas de localStorage.setItem',         !src.includes('localStorage.setItem'));
ok('P0-13 pas de document.write',               !src.includes('document.write'));
ok('P0-14 sensitive:true présent dans source',  /sensitive\s*:\s*true/.test(src));

/* ══════════════════════════════════════════════════════════════════
   C — Conditions when/show
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── C · Conditions ──');
const conds = D.conditions;
ok('C-1  au moins 4 conditions SSH',  conds.length >= 4);
ok('C-2  toutes ont when.field',
   conds.every(c => typeof c?.when?.field === 'string'));
ok('C-3  toutes ont show[] non vide',
   conds.every(c => Array.isArray(c?.show) && c.show.length > 0));
ok('C-4  auth "key"         → show mc_ssh_key',
   conds.some(c => c.when.field === 'mc_ssh_auth' && c.when.eq === 'key' &&
     c.show.includes('mc_ssh_key')));
ok('C-5  auth "password"    → show mc_ssh_pass',
   conds.some(c => c.when.field === 'mc_ssh_auth' && c.when.eq === 'password' &&
     c.show.includes('mc_ssh_pass')));
ok('C-6  auth "key+password"→ show mc_ssh_key + mc_ssh_pass',
   conds.some(c => c.when.field === 'mc_ssh_auth' && c.when.eq === 'key+password' &&
     c.show.includes('mc_ssh_key') && c.show.includes('mc_ssh_pass')));
ok('C-7  auth "certificate" → show mc_ssh_cert',
   conds.some(c => c.when.field === 'mc_ssh_auth' && c.when.eq === 'certificate' &&
     c.show.includes('mc_ssh_cert')));
ok('C-8  show[] refs existent dans forms',
   [...new Set(conds.flatMap(c => c.show))].every(id => af.some(f => f.id === id)));

/* ══════════════════════════════════════════════════════════════════
   V — Validateurs
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── V · Validateurs ──');
const vals = D.validators;
ok('V-1  validators non vide',                  vals.length > 0);
ok('V-2  mc_ssh_host required:true',            vals.some(v => v.field === 'mc_ssh_host' && v.required === true));
ok('V-3  mc_ftp_host required:true',            vals.some(v => v.field === 'mc_ftp_host' && v.required === true));
ok('V-4  mc_vpn_server required:true',          vals.some(v => v.field === 'mc_vpn_server' && v.required === true));
ok('V-5  mc_ext_url url:true',                  vals.some(v => v.field === 'mc_ext_url' && v.url === true));
ok('V-6  mc_ext_oauth_url url:true',            vals.some(v => v.field === 'mc_ext_oauth_url' && v.url === true));
ok('V-7  mc_ext_webhook_url url:true',          vals.some(v => v.field === 'mc_ext_webhook_url' && v.url === true));
ok('V-8  tous ont field string',
   vals.every(v => typeof v?.field === 'string' && v.field.length > 0));

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── B · Profile bindings ──');
ok('B-1  profile_bindings est tableau vide (MOD_MACHINES_CFG est source, pas target)',
   Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   Résumé
   ══════════════════════════════════════════════════════════════════ */
const tot = _pass + _fail;
console.log(`\n${'─'.repeat(56)}`);
console.log(`  machines-config.smoke v1.0  ·  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
