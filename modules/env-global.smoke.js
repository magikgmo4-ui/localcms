/**
 * modules/env-global.smoke.js — Smoke tests M-3.4 v1.0
 * LocalCMS · modules/env-global.js
 *
 * Orientation : équivalence réelle avec l'inline d'origine.
 *
 * Blocs :
 *   P  — Pureté (aucune fonction dans le manifeste)
 *   M  — Identité
 *   K  — Structure (groups, meta, conditions, validators, bindings)
 *   G1 — machines    (9 champs)
 *   G2 — shared_env  (9 champs)
 *   G3 — network     (7 champs)
 *   S  — sensitive F-15 (aucun — vérification explicite)
 *   P0 — Conformité P0 (paths, IPs, hostnames)
 *   C  — Conditions (tableau vide — fidèle inline)
 *   V  — Validators
 *   B  — Profile bindings
 *
 * Exécution : node modules/env-global.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'env-global.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_ENV_GLOBAL_DATA\b/, 'globalThis.MOD_ENV_GLOBAL_DATA')); // eslint-disable-line

const D = globalThis.MOD_ENV_GLOBAL_DATA;

let _pass = 0, _fail = 0;
const ok = (label, cond) => {
  if (cond) { process.stdout.write(`  \u2713  ${label}\n`); _pass++; }
  else       { process.stderr.write(`  \u2717  ${label}\n`); _fail++; }
};

const allFields = () =>
  Object.values(D.groups ?? {}).flatMap(g => g.fields ?? []);

/* ══════════════════════════════════════════════════════════════════
   P — Pureté
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P · Pureté ──');
ok('P-1  MOD_ENV_GLOBAL_DATA est un objet', typeof D === 'object' && D !== null);
ok('P-2  pas de fonction top-level',
   Object.values(D).every(v => typeof v !== 'function'));
ok('P-3  meta : pas de fonction',
   Object.values(D.meta ?? {}).every(v => typeof v !== 'function'));
ok('P-4  champs groups : pas de fonction',
   Object.values(D.groups ?? {}).every(g =>
     (g.fields ?? []).every(f =>
       Object.values(f).every(v => typeof v !== 'function'))));
ok('P-5  conditions : tableau pur',
   Array.isArray(D.conditions));

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── M · Identité ──');
ok('M-1  id = "env_global"',               D.id           === 'env_global');
ok('M-2  label non vide',                  typeof D.label === 'string' && D.label.length > 0);
ok('M-3  version semver',                  /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',                 D.type         === 'config');
ok('M-5  os_compat includes "all"',        (D.os_compat   ?? []).includes('all'));
ok('M-6  interfaces includes "config"',    (D.interfaces  ?? []).includes('config'));
ok('M-7  capabilities includes "render"',  (D.capabilities ?? []).includes('render'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── K · Structure ──');
ok('K-1  meta présent',                       D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "machines"',    D.meta?.activeDefault === 'machines');
ok('K-3  groups présent',                     D.groups && typeof D.groups === 'object');
ok('K-4  3 groupes déclarés',                 Object.keys(D.groups ?? {}).length === 3);
ok('K-5  groups contient machines',           'machines'   in (D.groups ?? {}));
ok('K-6  groups contient shared_env',         'shared_env' in (D.groups ?? {}));
ok('K-7  groups contient network',            'network'    in (D.groups ?? {}));
ok('K-8  chaque groupe a label',              Object.values(D.groups ?? {}).every(g => typeof g.label === 'string' && g.label.length > 0));
ok('K-9  chaque groupe a icon',               Object.values(D.groups ?? {}).every(g => typeof g.icon  === 'string' && g.icon.length  > 0));
ok('K-10 chaque groupe a fields[]',           Object.values(D.groups ?? {}).every(g => Array.isArray(g.fields) && g.fields.length > 0));
ok('K-11 conditions est tableau',             Array.isArray(D.conditions));
ok('K-12 validators est tableau',             Array.isArray(D.validators));
ok('K-13 profile_bindings est tableau',       Array.isArray(D.profile_bindings));
ok('K-14 pas de clé "forms" (structure GROUPS)', !('forms' in D));

/* ══════════════════════════════════════════════════════════════════
   G1 — machines (9 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── G1 · machines (9 champs) ──');
const G1 = ['eg_m_name','eg_m_host','eg_m_user','eg_m_port','eg_m_key',
            'eg_m_env','eg_m_role','eg_m_os','eg_m_tags'];
const g1Ids = (D.groups.machines?.fields ?? []).map(f => f.id);
ok('G1-1  9 champs', g1Ids.length === 9);
G1.forEach((id, i) => ok(`G1-${i+2}  "${id}" présent`, g1Ids.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   G2 — shared_env (9 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── G2 · shared_env (9 champs) ──');
const G2 = ['eg_s_domain','eg_s_app_name','eg_s_env','eg_s_tz','eg_s_db_host',
            'eg_s_redis_url','eg_s_smtp_host','eg_s_s3_region','eg_s_log_level'];
const g2Ids = (D.groups.shared_env?.fields ?? []).map(f => f.id);
ok('G2-1  9 champs', g2Ids.length === 9);
G2.forEach((id, i) => ok(`G2-${i+2}  "${id}" présent`, g2Ids.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   G3 — network (7 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── G3 · network (7 champs) ──');
const G3 = ['eg_n_subnet','eg_n_gateway','eg_n_dns1','eg_n_dns2',
            'eg_n_vpn_server','eg_n_proxy','eg_n_noproxy'];
const g3Ids = (D.groups.network?.fields ?? []).map(f => f.id);
ok('G3-1  7 champs', g3Ids.length === 7);
G3.forEach((id, i) => ok(`G3-${i+2}  "${id}" présent`, g3Ids.includes(id)));

const total = g1Ids.length + g2Ids.length + g3Ids.length;
ok('G-TOTAL  25 champs au total', total === 25);

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (aucun champ password dans ce module)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── S · sensitive F-15 ──');
const af = allFields();
ok('S-1  aucun champ type=password',
   !af.some(f => f.type === 'password'));
ok('S-2  aucun champ sensitive:true',
   !af.some(f => f.sensitive === true));

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité paths, IPs, hostnames
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P0 · Conformité P0 ──');

// Values qui devaient être vidées
const MUST_EMPTY = ['eg_m_key','eg_n_subnet','eg_n_gateway','eg_n_dns1','eg_n_dns2'];
MUST_EMPTY.forEach((id, i) => {
  const f = af.find(x => x.id === id);
  ok(`P0-${i+1}  ${id} value=''`, f?.value === '');
});

// Placeholders neutralisés
ok('P0-6  eg_m_host placeholder sans IP',
   !/\d{1,3}\.\d{1,3}/.test(af.find(f => f.id === 'eg_m_host')?.placeholder ?? ''));
ok('P0-7  eg_n_vpn_server placeholder sans hostname concret',
   !/\.com|\.net|\.org/.test(af.find(f => f.id === 'eg_n_vpn_server')?.placeholder ?? ''));
ok('P0-8  eg_n_proxy placeholder sans URL concrète',
   !/http:\/\/[a-z]+[:.]\d/.test(af.find(f => f.id === 'eg_n_proxy')?.placeholder ?? ''));
ok('P0-9  eg_s_domain placeholder sans domaine concret',
   !/^[a-z]+\.[a-z]+$/.test(af.find(f => f.id === 'eg_s_domain')?.placeholder ?? ''));

// Vérifications générales
ok('P0-10 pas de ~/.  en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('~/')));
ok('P0-11 pas de /var/ en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('/var/')));
ok('P0-12 pas de 192.168. en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('192.168.')));
ok('P0-13 pas de 1.1.1.1 ou 8.8.8.8 en value',
   !af.some(f => typeof f.value === 'string' && /^[18]\.\d+\.\d+\.\d+$/.test(f.value)));
ok('P0-14 pas de localStorage.setItem', !src.includes('localStorage.setItem'));
ok('P0-15 pas de document.write',       !src.includes('document.write'));

// Valeurs conservées (localhost, convention standard)
ok('P0-16 eg_s_redis_url conservé (localhost service)',
   af.find(f => f.id === 'eg_s_redis_url')?.value === 'redis://localhost:6379');
ok('P0-17 eg_n_noproxy conservé (convention standard)',
   af.find(f => f.id === 'eg_n_noproxy')?.value === 'localhost,127.0.0.1,.local');

/* ══════════════════════════════════════════════════════════════════
   C — Conditions (tableau vide — fidèle inline)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── C · Conditions ──');
ok('C-1  conditions vide (inline sans conditions)',
   Array.isArray(D.conditions) && D.conditions.length === 0);

/* ══════════════════════════════════════════════════════════════════
   V — Validators
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── V · Validators ──');
const vals = D.validators;
ok('V-1  validators non vide',          vals.length > 0);
ok('V-2  tous ont field string',
   vals.every(v => typeof v?.field === 'string' && v.field.length > 0));

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
console.log(`\n${'─'.repeat(56)}`);
console.log(`  env-global.smoke v1.0  ·  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
