/**
 * modules/ia-config.smoke.js — Smoke tests M-3.1 (corr.) v1.1
 * LocalCMS · modules/ia-config.js
 *
 * Orientation : équivalence réelle avec l'inline d'origine.
 *
 * Blocs :
 *   P  — Pureté (aucune fonction dans le manifeste)
 *   M  — Manifeste identité
 *   K  — Clés de structure (forms, meta, conditions, validators, bindings)
 *   F1 — Champs endpoint        (16 champs)
 *   F2 — Champs prompt_template (11 champs)
 *   F3 — Champs multi_ia        (11 champs)
 *   F4 — Champs image_ia        (12 champs)
 *   S  — sensitive F-15         (ia_api_key + ia_img_api_key)
 *   C  — Conditions when/show
 *   V  — Validateurs
 *   B  — Profile bindings F-14
 *   R  — Règles P0 (pas de HTML, pas de paths, pas de logique)
 *
 * Exécution : node modules/ia-config.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/* ── Chargement du manifeste ─────────────────────────────────────── */
const src = fs.readFileSync(path.join(__dirname, 'ia-config.js'), 'utf8');
// Expose MOD_IA_CFG_DATA dans le scope global pour les tests
eval(src.replace(/\bconst\s+MOD_IA_CFG_DATA\b/, 'globalThis.MOD_IA_CFG_DATA')); // eslint-disable-line

const D = globalThis.MOD_IA_CFG_DATA;

/* ── Harness ─────────────────────────────────────────────────────── */
let _pass = 0;
let _fail = 0;

const ok = (label, cond) => {
  if (cond) {
    process.stdout.write(`  \u2713  ${label}\n`);
    _pass++;
  } else {
    process.stderr.write(`  \u2717  ${label}\n`);
    _fail++;
  }
};

/* Helpers */
const fieldsOf = (formKey) =>
  (D.forms[formKey]?.sections ?? []).flatMap(s => s.fields ?? []);

const fieldIds = (formKey) => fieldsOf(formKey).map(f => f.id);

/* ══════════════════════════════════════════════════════════════════
   P — Pureté du manifeste (aucune fonction de haut niveau)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 P \u00b7 Pureté \u2014 manifeste pur données \u2500\u2500');

ok('P-1  MOD_IA_CFG_DATA est un objet',     typeof D === 'object' && D !== null);
ok('P-2  pas de propriété fonction top-level',
   Object.values(D).every(v => typeof v !== 'function'));
ok('P-3  meta : pas de fonction',
   Object.values(D.meta ?? {}).every(v => typeof v !== 'function'));
ok('P-4  forms : pas de fonction dans les champs',
   Object.values(D.forms ?? {}).every(form =>
     (form.sections ?? []).every(sec =>
       (sec.fields ?? []).every(f =>
         Object.values(f).every(v => typeof v !== 'function')
       )
     )
   ));
ok('P-5  conditions : objets purs (pas de fonction)',
   (D.conditions ?? []).every(c => typeof c === 'object' && typeof c.when === 'object'));

/* ══════════════════════════════════════════════════════════════════
   M — Manifeste identité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 M \u00b7 Identité \u2500\u2500');

ok('M-1  id = "ia_cfg"',                D.id           === 'ia_cfg');
ok('M-2  label non vide',               typeof D.label === 'string' && D.label.length > 0);
ok('M-3  version semver',               /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',              D.type         === 'config');
ok('M-5  os_compat includes "all"',     (D.os_compat ?? []).includes('all'));
ok('M-6  interfaces includes "config"', (D.interfaces ?? []).includes('config'));
ok('M-7  capabilities includes "render"', (D.capabilities ?? []).includes('render'));

/* ══════════════════════════════════════════════════════════════════
   K — Clés de structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 K \u00b7 Structure \u2500\u2500');

ok('K-1  meta présent',               D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault présent', typeof D.meta?.activeDefault === 'string');
ok('K-3  meta.typeIcons (4 clés)',    Object.keys(D.meta?.typeIcons ?? {}).length === 4);
ok('K-4  meta.typeLabels (4 clés)',   Object.keys(D.meta?.typeLabels ?? {}).length === 4);
ok('K-5  forms présent',             D.forms && typeof D.forms === 'object');
ok('K-6  4 forms déclarés',          Object.keys(D.forms ?? {}).length === 4);
ok('K-7  forms contient endpoint',        'endpoint'        in (D.forms ?? {}));
ok('K-8  forms contient prompt_template', 'prompt_template' in (D.forms ?? {}));
ok('K-9  forms contient multi_ia',        'multi_ia'        in (D.forms ?? {}));
ok('K-10 forms contient image_ia',        'image_ia'        in (D.forms ?? {}));
ok('K-11 conditions est tableau',   Array.isArray(D.conditions));
ok('K-12 validators est tableau',   Array.isArray(D.validators));
ok('K-13 profile_bindings est tableau', Array.isArray(D.profile_bindings));

/* ══════════════════════════════════════════════════════════════════
   F1 — Form endpoint (16 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F1 \u00b7 endpoint (16 champs) \u2500\u2500');

const EP_FIELDS = [
  'ia_provider','ia_name','ia_host','ia_api_key','ia_model','ia_models_list',
  'ia_timeout','ia_max_tokens','ia_temperature','ia_top_p','ia_top_k',
  'ia_context_window','ia_stream','ia_system_prompt','ia_machine','ia_enabled',
];
const epIds = fieldIds('endpoint');
ok('F1-1  16 champs dans endpoint', epIds.length === 16);
EP_FIELDS.forEach((id, i) =>
  ok(`F1-${i + 2}  "${id}" présent`, epIds.includes(id))
);
ok('F1-18 endpoint form id = "ia-endpoint"', D.forms.endpoint?.id === 'ia-endpoint');
ok('F1-19 section first:true',               D.forms.endpoint?.sections?.[0]?.first === true);

/* ══════════════════════════════════════════════════════════════════
   F2 — Form prompt_template (11 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F2 \u00b7 prompt_template (11 champs) \u2500\u2500');

const PT_FIELDS = [
  'ia_tpl_name','ia_tpl_role','ia_tpl_format','ia_tpl_input_type',
  'ia_tpl_system','ia_tpl_user','ia_tpl_model','ia_tpl_temp',
  'ia_tpl_max_tok','ia_tpl_tags','ia_tpl_active',
];
const ptIds = fieldIds('prompt_template');
ok('F2-1  11 champs dans prompt_template', ptIds.length === 11);
PT_FIELDS.forEach((id, i) =>
  ok(`F2-${i + 2}  "${id}" présent`, ptIds.includes(id))
);
ok('F2-13 form id = "ia-prompt"', D.forms.prompt_template?.id === 'ia-prompt');

/* ══════════════════════════════════════════════════════════════════
   F3 — Form multi_ia (11 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F3 \u00b7 multi_ia (11 champs) \u2500\u2500');

const MI_FIELDS = [
  'ia_router_strategy','ia_primary','ia_fallbacks','ia_timeout_fallback',
  'ia_cache','ia_cache_ttl','ia_rate_limit','ia_cost_limit_day',
  'ia_log_requests','ia_log_tokens','ia_anonymize',
];
const miIds = fieldIds('multi_ia');
ok('F3-1  11 champs dans multi_ia', miIds.length === 11);
MI_FIELDS.forEach((id, i) =>
  ok(`F3-${i + 2}  "${id}" présent`, miIds.includes(id))
);
ok('F3-13 form id = "ia-multi"', D.forms.multi_ia?.id === 'ia-multi');

/* ══════════════════════════════════════════════════════════════════
   F4 — Form image_ia (12 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F4 \u00b7 image_ia (12 champs) \u2500\u2500');

const IM_FIELDS = [
  'ia_img_provider','ia_img_host','ia_img_api_key','ia_img_model',
  'ia_img_width','ia_img_height','ia_img_steps','ia_img_cfg',
  'ia_img_sampler','ia_img_output_dir','ia_img_format','ia_img_analyze',
];
const imIds = fieldIds('image_ia');
ok('F4-1  12 champs dans image_ia', imIds.length === 12);
IM_FIELDS.forEach((id, i) =>
  ok(`F4-${i + 2}  "${id}" présent`, imIds.includes(id))
);
ok('F4-14 form id = "ia-image"', D.forms.image_ia?.id === 'ia-image');

/* Total champs */
const total_champs = epIds.length + ptIds.length + miIds.length + imIds.length;
ok('F-TOTAL  50 champs au total', total_champs === 50);

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 S \u00b7 sensitive F-15 \u2500\u2500');

const allFields = [...fieldsOf('endpoint'), ...fieldsOf('prompt_template'),
                   ...fieldsOf('multi_ia'), ...fieldsOf('image_ia')];

const apiKey    = allFields.find(f => f.id === 'ia_api_key');
const imgApiKey = allFields.find(f => f.id === 'ia_img_api_key');

ok('S-1  ia_api_key type=password',            apiKey?.type    === 'password');
ok('S-2  ia_api_key sensitive:true',           apiKey?.sensitive === true);
ok('S-3  ia_img_api_key type=password',        imgApiKey?.type === 'password');
ok('S-4  ia_img_api_key sensitive:true',       imgApiKey?.sensitive === true);
ok('S-5  aucun autre champ sensitive non-password',
   allFields.filter(f => f.sensitive === true).every(f => f.type === 'password'));

/* ══════════════════════════════════════════════════════════════════
   C — Conditions when/show
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 C \u00b7 Conditions \u2500\u2500');

const conds = D.conditions;
const cloudProviders = ['openai','anthropic','mistral','cohere','groq','together-ai','huggingface','custom'];

ok('C-1  au moins 8 conditions',   conds.length >= 8);
ok('C-2  toutes ont when.field',
   conds.every(c => typeof c?.when?.field === 'string' && c.when.field.length > 0));
ok('C-3  toutes ont show[] non vide',
   conds.every(c => Array.isArray(c?.show) && c.show.length > 0));
ok('C-4  opérateurs valides',
   conds.every(c => {
     const ops = Object.keys(c.when).filter(k => k !== 'field');
     return ops.length === 1 && ['eq','ne','in','notIn','truthy','falsy'].includes(ops[0]);
   }));

cloudProviders.forEach((p, i) =>
  ok(`C-${5 + i}  provider "${p}" → show ia_api_key`,
     conds.some(c => c.when.field === 'ia_provider' && c.when.eq === p &&
       c.show.includes('ia_api_key')))
);

ok('C-13 ia_api_key référencé dans show[] d\'au moins 1 condition',
   conds.some(c => c.show.includes('ia_api_key')));
ok('C-14 champs show[] existent dans les forms',
   [...new Set(conds.flatMap(c => c.show))].every(id =>
     allFields.some(f => f.id === id)
   ));

/* ══════════════════════════════════════════════════════════════════
   V — Validateurs
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 V \u00b7 Validateurs \u2500\u2500');

const validators = D.validators;
ok('V-1  validators non vide',          validators.length > 0);
ok('V-2  ia_host url:true',             validators.some(v => v.field === 'ia_host'    && v.url === true));
ok('V-3  ia_api_key required:true',     validators.some(v => v.field === 'ia_api_key' && v.required === true));
ok('V-4  ia_img_host url:true',         validators.some(v => v.field === 'ia_img_host' && v.url === true));
ok('V-5  tous ont field string',
   validators.every(v => typeof v?.field === 'string' && v.field.length > 0));

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings F-14
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 B \u00b7 Profile bindings F-14 \u2500\u2500');

const bindings = D.profile_bindings;
ok('B-1  au moins 1 binding',              bindings.length >= 1);
ok('B-2  ia_machine binding présent',      bindings.some(b => b.field === 'ia_machine'));
ok('B-3  ia_machine source=$USER.machines',
   bindings.find(b => b.field === 'ia_machine')?.source === '$USER.machines');
ok('B-4  ia_machine key=active',
   bindings.find(b => b.field === 'ia_machine')?.key === 'active');
ok('B-5  ia_machine prop=id',
   bindings.find(b => b.field === 'ia_machine')?.prop === 'id');
ok('B-6  binding syntaxe F-14 dans field déclaration',
   /^\$USER\.machines\[active\]\.\w+$/.test(
     allFields.find(f => f.id === 'ia_machine')?.binding ?? ''
   ));

/* ══════════════════════════════════════════════════════════════════
   R — Règles P0
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 R \u00b7 Règles P0 \u2500\u2500');

ok('R-1  pas de /home/ dans la source',         !src.includes('/home/'));
ok('R-2  pas de C:\\ dans la source',           !src.includes('C:\\'));
ok('R-3  pas de localStorage.setItem direct',   !src.includes('localStorage.setItem'));
ok('R-4  pas de localStorage.getItem direct',   !src.includes('localStorage.getItem'));
ok('R-5  pas de document.write',                !src.includes('document.write'));
ok('R-6  pas de innerHTML dans JSON du manifeste',
   !JSON.stringify(D).includes('innerHTML'));
ok('R-7  sensitive:true présent dans la source',
   /sensitive\s*:\s*true/.test(src));
ok('R-8  ia_api_key pas en clé localStorage hardcodée',
   !src.includes("setItem('ia_api_key") && !src.includes('setItem("ia_api_key'));
ok('R-9  MOD_IA_CFG_DATA exporté',      typeof globalThis.MOD_IA_CFG_DATA === 'object');
ok('R-10 aucune fonction top-level',
   !Object.values(D).some(v => typeof v === 'function'));

/* ══════════════════════════════════════════════════════════════════
   Résumé
   ══════════════════════════════════════════════════════════════════ */
const total = _pass + _fail;
console.log(`\n${'─'.repeat(56)}`);
console.log(`  ia-config.smoke v1.1  ·  ${total} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) {
  console.error('\n  STATUT : FAILED');
  process.exit(1);
}
console.log('  STATUT : OK\n');
