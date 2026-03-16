/**
 * modules/data-sources.smoke.js — Smoke tests M-3.3 v1.0
 * LocalCMS · modules/data-sources.js
 *
 * Orientation : équivalence réelle avec l'inline d'origine.
 *
 * Blocs :
 *   P  — Pureté (aucune fonction dans le manifeste)
 *   M  — Identité
 *   K  — Structure (5 forms, meta, conditions, validators, bindings)
 *   F1 — database    (15 champs)
 *   F2 — api         (15 champs)
 *   F3 — files       (13 champs)
 *   F4 — images      (19 champs)
 *   F5 — computed    (10 champs)
 *   S  — sensitive F-15 (3 champs password)
 *   P0 — Conformité P0 (paths, IPs, hostnames, données réelles)
 *   C  — Conditions (tableau vide — fidèle à l'inline)
 *   V  — Validateurs
 *   B  — Profile bindings
 *
 * Exécution : node modules/data-sources.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'data-sources.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_DATA_SOURCES_DATA\b/, 'globalThis.MOD_DATA_SOURCES_DATA')); // eslint-disable-line

const D = globalThis.MOD_DATA_SOURCES_DATA;

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
ok('P-1  MOD_DATA_SOURCES_DATA est un objet', typeof D === 'object' && D !== null);
ok('P-2  pas de fonction top-level',
   Object.values(D).every(v => typeof v !== 'function'));
ok('P-3  meta : pas de fonction',
   Object.values(D.meta ?? {}).every(v => typeof v !== 'function'));
ok('P-4  champs forms : pas de fonction',
   Object.values(D.forms ?? {}).every(form =>
     (form.sections ?? []).every(sec =>
       (sec.fields ?? []).every(f =>
         Object.values(f).every(v => typeof v !== 'function')))));
ok('P-5  conditions : tableau (pas de fonctions)',
   Array.isArray(D.conditions));

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── M · Identité ──');
ok('M-1  id = "data_sources"',             D.id           === 'data_sources');
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
ok('K-1  meta présent',                         D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "database"',      D.meta?.activeDefault === 'database');
ok('K-3  meta.typeIcons (5 clés)',               Object.keys(D.meta?.typeIcons  ?? {}).length === 5);
ok('K-4  meta.typeLabels (5 clés)',              Object.keys(D.meta?.typeLabels ?? {}).length === 5);
ok('K-5  5 forms déclarés',                     Object.keys(D.forms ?? {}).length === 5);
ok('K-6  forms contient database',              'database' in (D.forms ?? {}));
ok('K-7  forms contient api',                   'api'      in (D.forms ?? {}));
ok('K-8  forms contient files',                 'files'    in (D.forms ?? {}));
ok('K-9  forms contient images',                'images'   in (D.forms ?? {}));
ok('K-10 forms contient computed',              'computed' in (D.forms ?? {}));
ok('K-11 conditions est tableau',               Array.isArray(D.conditions));
ok('K-12 validators est tableau',               Array.isArray(D.validators));
ok('K-13 profile_bindings est tableau',         Array.isArray(D.profile_bindings));

/* ══════════════════════════════════════════════════════════════════
   F1 — database (15 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F1 · database (15 champs) ──');
const F1 = ['ds_db_type','ds_db_name','ds_db_host','ds_db_port','ds_db_dbname',
            'ds_db_user','ds_db_pass','ds_db_ssl','ds_db_pool','ds_db_ro',
            'ds_db_schema','ds_db_interval','ds_db_query','ds_db_tags','ds_db_enabled'];
const f1Ids = fieldIds('database');
ok('F1-1  15 champs', f1Ids.length === 15);
F1.forEach((id, i) => ok(`F1-${i+2}  "${id}" présent`, f1Ids.includes(id)));
ok('F1-17 form id = "ds-db"',    D.forms.database?.id === 'ds-db');
ok('F1-18 section first:true',   D.forms.database?.sections?.[0]?.first === true);

/* ══════════════════════════════════════════════════════════════════
   F2 — api (15 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F2 · api (15 champs) ──');
const F2 = ['ds_api_name','ds_api_url','ds_api_type','ds_api_method','ds_api_auth',
            'ds_api_key','ds_api_key_header','ds_api_body','ds_api_headers',
            'ds_api_interval','ds_api_path','ds_api_cache','ds_api_retry',
            'ds_api_timeout','ds_api_enabled'];
const f2Ids = fieldIds('api');
ok('F2-1  15 champs', f2Ids.length === 15);
F2.forEach((id, i) => ok(`F2-${i+2}  "${id}" présent`, f2Ids.includes(id)));
ok('F2-17 form id = "ds-api"', D.forms.api?.id === 'ds-api');

/* ══════════════════════════════════════════════════════════════════
   F3 — files (13 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F3 · files (13 champs) ──');
const F3 = ['ds_f_name','ds_f_type','ds_f_path','ds_f_format','ds_f_watch',
            'ds_f_tail','ds_f_encoding','ds_f_delimiter','ds_f_headers',
            'ds_f_regex','ds_f_rotate','ds_f_machine','ds_f_enabled'];
const f3Ids = fieldIds('files');
ok('F3-1  13 champs', f3Ids.length === 13);
F3.forEach((id, i) => ok(`F3-${i+2}  "${id}" présent`, f3Ids.includes(id)));
ok('F3-15 form id = "ds-files"', D.forms.files?.id === 'ds-files');

/* ══════════════════════════════════════════════════════════════════
   F4 — images (19 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F4 · images (19 champs) ──');
const F4 = ['ds_img_storage','ds_img_path','ds_img_bucket','ds_img_endpoint',
            'ds_img_key','ds_img_secret','ds_img_cdn_url','ds_img_max_size',
            'ds_img_formats','ds_img_resize','ds_img_w','ds_img_h',
            'ds_img_quality','ds_img_thumb','ds_img_thumb_sizes','ds_img_webp',
            'ds_img_strip_meta','ds_img_public','ds_img_prefix'];
const f4Ids = fieldIds('images');
ok('F4-1  19 champs', f4Ids.length === 19);
F4.forEach((id, i) => ok(`F4-${i+2}  "${id}" présent`, f4Ids.includes(id)));
ok('F4-21 form id = "ds-images"', D.forms.images?.id === 'ds-images');

/* ══════════════════════════════════════════════════════════════════
   F5 — computed (10 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── F5 · computed (10 champs) ──');
const F5 = ['ds_c_name','ds_c_sources','ds_c_formula','ds_c_method','ds_c_window',
            'ds_c_threshold_warn','ds_c_threshold_err','ds_c_output',
            'ds_c_display','ds_c_refresh'];
const f5Ids = fieldIds('computed');
ok('F5-1  10 champs', f5Ids.length === 10);
F5.forEach((id, i) => ok(`F5-${i+2}  "${id}" présent`, f5Ids.includes(id)));
ok('F5-12 form id = "ds-computed"', D.forms.computed?.id === 'ds-computed');

const total = [f1Ids,f2Ids,f3Ids,f4Ids,f5Ids].reduce((s,a)=>s+a.length,0);
ok('F-TOTAL  72 champs au total', total === 72);

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (3 champs password)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── S · sensitive F-15 ──');
const SENSITIVE_IDS = ['ds_db_pass','ds_api_key','ds_img_secret'];
const af = allFields();
SENSITIVE_IDS.forEach((id, i) => {
  const f = af.find(x => x.id === id);
  ok(`S-${i+1}  ${id} type=password`,   f?.type      === 'password');
  ok(`S-${i+1}b ${id} sensitive:true`,  f?.sensitive === true);
});
ok('S-4  aucun champ sensitive non-password',
   af.filter(f => f.sensitive === true).every(f => f.type === 'password'));

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité chemins, IPs, hostnames, données réelles
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── P0 · Conformité P0 ──');

// Values vidées (étaient hardcodées dans l'inline)
const MUST_EMPTY = ['ds_img_path','ds_img_prefix'];
MUST_EMPTY.forEach((id, i) => {
  const f = af.find(x => x.id === id);
  ok(`P0-${i+1}  ${id} value=''`, f?.value === '');
});

// Aucun placeholder/hint contenant IP, chemin absolu, hostname concret
const BAD_PH_PATTERNS = [
  /^\//,                              // chemin absolu
  /^~/,                               // chemin utilisateur
  /\d{1,3}\.\d{1,3}\.\d{1,3}/,       // IP
  /https?:\/\/[a-z]+\.[a-z]+/i,      // URL hostname réel
  /nginx|mysql|postgres|redis/i,     // noms de services concrets dans placeholders
];
const badPh = af.filter(f => {
  const ph = f.placeholder ?? '';
  const hn = f.hint ?? '';
  return BAD_PH_PATTERNS.some(re => re.test(ph) || re.test(hn));
});
ok('P0-3  aucun placeholder avec chemin absolu/IP/hostname réel', badPh.length === 0);
if (badPh.length > 0) badPh.forEach(f => process.stderr.write(`       KO: ${f.id} ph="${f.placeholder??''}" hint="${f.hint??''}"\n`));

// Aucun path relatif en value
ok('P0-4  pas de chemin ./  en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('./')));
ok('P0-5  pas de chemin uploads/ en value',
   !af.some(f => typeof f.value === 'string' && /^uploads\//.test(f.value)));
ok('P0-6  pas de /var/ en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('/var/')));
ok('P0-7  pas de ~/.  en value',
   !af.some(f => typeof f.value === 'string' && f.value.startsWith('~/')));
ok('P0-8  pas de IP en value',
   !af.filter(f => !['ds_db_host','ds_f_machine'].includes(f.id))
       .some(f => typeof f.value === 'string' && /\d{1,3}\.\d{1,3}\.\d{1,3}/.test(f.value)));
ok('P0-9  pas de localStorage.setItem',  !src.includes('localStorage.setItem'));
ok('P0-10 pas de document.write',        !src.includes('document.write'));
ok('P0-11 sensitive:true présent source',/sensitive\s*:\s*true/.test(src));

// Hint ds_c_formula sans nom de source concret (ex: db_prod)
const formulaField = af.find(f => f.id === 'ds_c_formula');
ok('P0-12 hint ds_c_formula sans nom de source concret',
   !/(db_prod|api_prod|cpu_avg)\s*\*/.test(formulaField?.hint ?? ''));

/* ══════════════════════════════════════════════════════════════════
   C — Conditions (tableau vide — fidèle à l'inline)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── C · Conditions ──');
ok('C-1  conditions est tableau vide (inline sans conditions)', Array.isArray(D.conditions) && D.conditions.length === 0);

/* ══════════════════════════════════════════════════════════════════
   V — Validateurs
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── V · Validateurs ──');
const vals = D.validators;
ok('V-1  validators non vide',           vals.length > 0);
ok('V-2  ds_api_url url:true',           vals.some(v => v.field === 'ds_api_url'      && v.url      === true));
ok('V-3  ds_db_host required:true',      vals.some(v => v.field === 'ds_db_host'      && v.required === true));
ok('V-4  ds_img_endpoint url:true',      vals.some(v => v.field === 'ds_img_endpoint' && v.url      === true));
ok('V-5  ds_img_cdn_url url:true',       vals.some(v => v.field === 'ds_img_cdn_url'  && v.url      === true));
ok('V-6  tous ont field string',
   vals.every(v => typeof v?.field === 'string' && v.field.length > 0));

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings
   ══════════════════════════════════════════════════════════════════ */
console.log('\n── B · Profile bindings ──');
ok('B-1  profile_bindings vide (pas de binding entrant)',
   Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   Résumé
   ══════════════════════════════════════════════════════════════════ */
const tot = _pass + _fail;
console.log(`\n${'─'.repeat(56)}`);
console.log(`  data-sources.smoke v1.0  ·  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
