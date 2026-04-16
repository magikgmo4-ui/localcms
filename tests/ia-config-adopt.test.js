/**
 * tests/ia-config-adopt.test.js
 * LocalCMS · GO_LOCALCMS_IA_CONFIG_ADOPT_01 · GO-7/8
 *
 * Adopt test DATA-ONLY pour modules/ia-config.js — MOD_IA_CFG_DATA
 *
 * Module  : ia_cfg
 * Forms   : endpoint(16) / prompt_template(11) / multi_ia(11) / image_ia(12) = 50 champs
 * F-15    : 2 sensitive — ia_api_key / ia_img_api_key
 * VAL     : 3 — ia_host:url · ia_api_key:required · ia_img_host:url
 * COND    : 8 — ia_provider cloud → show ia_api_key
 * BIND    : 1 — ia_machine → $USER.machines[active].id
 *
 * Pattern : eval(src.replace(/\bconst\s+MOD_IA_CFG_DATA\b/, 'globalThis.MOD_IA_CFG_DATA'))
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
const src = fs.readFileSync(path.join(__dirname, '../modules/ia-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_IA_CFG_DATA\b/, 'globalThis.MOD_IA_CFG_DATA'));
const D = globalThis.MOD_IA_CFG_DATA;

/* ─── helpers ───────────────────────────────────────────────────── */
const allFields   = () => Object.values(D.forms).flatMap(f => f.sections.flatMap(s => s.fields));
const fieldInForm = (fk, id) => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).find(f => f.id === id);
const countInForm = (fk) => (D.forms[fk]?.sections ?? []).reduce((n, s) => n + s.fields.length, 0);

/* ══════════════════════════════════════════════════════════════════
   BANNER
   ══════════════════════════════════════════════════════════════════ */
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  IA_CFG ADOPT — Tests adoption MOD_IA_CFG_DATA          ║');
console.log('╚══════════════════════════════════════════════════════════╝');

/* ══════════════════════════════════════════════════════════════════
   INIT — Chargement module
   ══════════════════════════════════════════════════════════════════ */
section('INIT — Chargement module');
ok('INIT01: MOD_IA_CFG_DATA est un objet non-null',
  D !== null && typeof D === 'object');
ok('INIT02: id = "ia_cfg"',
  D.id === 'ia_cfg');

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
section('M — Identité');
ok('M01: label = "IA / Prompts Config"',
  D.label === 'IA / Prompts Config');
ok('M02: version = "1.1.0"',
  D.version === '1.1.0');
ok('M03: type = "config"',
  D.type === 'config');
ok('M04: capabilities inclut "render"',
  Array.isArray(D.capabilities) && D.capabilities.includes('render'));
ok('M05: capabilities inclut "generate"',
  D.capabilities.includes('generate'));
ok('M06: meta.activeDefault = "endpoint"',
  D.meta?.activeDefault === 'endpoint');
ok('M07: meta.typeLabels.prompt_template = "Templates"',
  D.meta?.typeLabels?.prompt_template === 'Templates');
ok('M08: meta.typeLabels.image_ia = "Images IA"',
  D.meta?.typeLabels?.image_ia === 'Images IA');

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
section('K — Structure');
ok('K01: forms est un objet (non-Array)',
  D.forms !== null && typeof D.forms === 'object' && !Array.isArray(D.forms));
ok('K02: exactement 4 forms déclarés',
  Object.keys(D.forms).length === 4);
ok('K03: clés forms attendues présentes',
  ['endpoint','prompt_template','multi_ia','image_ia'].every(k => k in D.forms));
ok('K04: conditions[] — 8 entrées',
  Array.isArray(D.conditions) && D.conditions.length === 8);
ok('K05: validators[] — 3 entrées',
  Array.isArray(D.validators) && D.validators.length === 3);
ok('K06: profile_bindings[] — 1 entrée',
  Array.isArray(D.profile_bindings) && D.profile_bindings.length === 1);

/* ══════════════════════════════════════════════════════════════════
   F1 — form endpoint (16 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F1 — form endpoint (16 champs)');
ok('F1-01: 16 champs dans endpoint',
  countInForm('endpoint') === 16);
ok('F1-02: id form = "ia-endpoint"',
  D.forms.endpoint?.id === 'ia-endpoint');
ok('F1-03: ia_provider — select, value "ollama"', (() => {
  const f = fieldInForm('endpoint', 'ia_provider');
  return f?.type === 'select' && f?.value === 'ollama';
})());
ok('F1-04: ia_host — url, value "http://localhost:11434"', (() => {
  const f = fieldInForm('endpoint', 'ia_host');
  return f?.type === 'url' && f?.value === 'http://localhost:11434';
})());
ok('F1-05: ia_api_key — password + sensitive + value ""', (() => {
  const f = fieldInForm('endpoint', 'ia_api_key');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F1-06: ia_max_tokens — number, value "4096"', (() => {
  const f = fieldInForm('endpoint', 'ia_max_tokens');
  return f?.type === 'number' && f?.value === '4096';
})());
ok('F1-07: ia_machine — binding "$USER.machines[active].id"', (() => {
  const f = fieldInForm('endpoint', 'ia_machine');
  return f?.binding === '$USER.machines[active].id';
})());

/* ══════════════════════════════════════════════════════════════════
   F2 — form prompt_template (11 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F2 — form prompt_template (11 champs)');
ok('F2-01: 11 champs dans prompt_template',
  countInForm('prompt_template') === 11);
ok('F2-02: id form = "ia-prompt"',
  D.forms.prompt_template?.id === 'ia-prompt');
ok('F2-03: ia_tpl_role — select, value "analysis"', (() => {
  const f = fieldInForm('prompt_template', 'ia_tpl_role');
  return f?.type === 'select' && f?.value === 'analysis';
})());
ok('F2-04: ia_tpl_format — select, value "text"', (() => {
  const f = fieldInForm('prompt_template', 'ia_tpl_format');
  return f?.type === 'select' && f?.value === 'text';
})());
ok('F2-05: ia_tpl_max_tok — number, value "2048"', (() => {
  const f = fieldInForm('prompt_template', 'ia_tpl_max_tok');
  return f?.type === 'number' && f?.value === '2048';
})());
ok('F2-06: ia_tpl_active — toggle, value true', (() => {
  const f = fieldInForm('prompt_template', 'ia_tpl_active');
  return f?.type === 'toggle' && f?.value === true;
})());

/* ══════════════════════════════════════════════════════════════════
   F3 — form multi_ia (11 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F3 — form multi_ia (11 champs)');
ok('F3-01: 11 champs dans multi_ia',
  countInForm('multi_ia') === 11);
ok('F3-02: id form = "ia-multi"',
  D.forms.multi_ia?.id === 'ia-multi');
ok('F3-03: ia_router_strategy — select, value "primary_fallback"', (() => {
  const f = fieldInForm('multi_ia', 'ia_router_strategy');
  return f?.type === 'select' && f?.value === 'primary_fallback';
})());
ok('F3-04: ia_cache — toggle, value true', (() => {
  const f = fieldInForm('multi_ia', 'ia_cache');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F3-05: ia_cache_ttl — number, value "60"', (() => {
  const f = fieldInForm('multi_ia', 'ia_cache_ttl');
  return f?.type === 'number' && f?.value === '60';
})());
ok('F3-06: ia_anonymize — toggle, value true', (() => {
  const f = fieldInForm('multi_ia', 'ia_anonymize');
  return f?.type === 'toggle' && f?.value === true;
})());

/* ══════════════════════════════════════════════════════════════════
   F4 — form image_ia (12 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F4 — form image_ia (12 champs)');
ok('F4-01: 12 champs dans image_ia',
  countInForm('image_ia') === 12);
ok('F4-02: id form = "ia-image"',
  D.forms.image_ia?.id === 'ia-image');
ok('F4-03: ia_img_provider — select, value "stable-diffusion"', (() => {
  const f = fieldInForm('image_ia', 'ia_img_provider');
  return f?.type === 'select' && f?.value === 'stable-diffusion';
})());
ok('F4-04: ia_img_host — url, value "http://localhost:7860"', (() => {
  const f = fieldInForm('image_ia', 'ia_img_host');
  return f?.type === 'url' && f?.value === 'http://localhost:7860';
})());
ok('F4-05: ia_img_api_key — password + sensitive + value ""', (() => {
  const f = fieldInForm('image_ia', 'ia_img_api_key');
  return f?.type === 'password' && f?.sensitive === true && f?.value === '';
})());
ok('F4-06: ia_img_steps — number, value "20"', (() => {
  const f = fieldInForm('image_ia', 'ia_img_steps');
  return f?.type === 'number' && f?.value === '20';
})());
ok('F4-07: ia_img_sampler — select, value "DPM++ 2M Karras"', (() => {
  const f = fieldInForm('image_ia', 'ia_img_sampler');
  return f?.type === 'select' && f?.value === 'DPM++ 2M Karras';
})());

/* ══════════════════════════════════════════════════════════════════
   TYPE — Types critiques
   ══════════════════════════════════════════════════════════════════ */
section('TYPE — Types critiques');
ok('TYPE01: url présent (ia_host)',
  fieldInForm('endpoint', 'ia_host')?.type === 'url');
ok('TYPE02: url présent (ia_img_host)',
  fieldInForm('image_ia', 'ia_img_host')?.type === 'url');
ok('TYPE03: textarea présent (ia_models_list)',
  fieldInForm('endpoint', 'ia_models_list')?.type === 'textarea');
ok('TYPE04: textarea présent (ia_tpl_user)',
  fieldInForm('prompt_template', 'ia_tpl_user')?.type === 'textarea');
ok('TYPE05: toggle présent dans chaque form', (() => {
  return ['endpoint','prompt_template','multi_ia','image_ia']
    .every(fk => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).some(f => f.type === 'toggle'));
})());

/* ══════════════════════════════════════════════════════════════════
   VAL — validators (3 entrées exactes)
   ══════════════════════════════════════════════════════════════════ */
section('VAL — validators');
ok('VAL01: validators est tableau',
  Array.isArray(D.validators));
ok('VAL02: 3 entrées validators',
  D.validators.length === 3);
ok('VAL03: ia_host — url:true',
  D.validators.some(v => v.field === 'ia_host' && v.url === true));
ok('VAL04: ia_api_key — required:true',
  D.validators.some(v => v.field === 'ia_api_key' && v.required === true));
ok('VAL05: ia_img_host — url:true',
  D.validators.some(v => v.field === 'ia_img_host' && v.url === true));

/* ══════════════════════════════════════════════════════════════════
   COND — conditions (8 règles when/show)
   ══════════════════════════════════════════════════════════════════ */
section('COND — conditions (8 règles)');
const cloudProviders = ['openai','anthropic','mistral','cohere','groq','together-ai','huggingface','custom'];
ok('COND01: exactement 8 conditions',
  D.conditions.length === 8);
ok('COND02: toutes les conditions portent sur ia_provider',
  D.conditions.every(c => c.when?.field === 'ia_provider'));
ok('COND03: toutes les conditions montrent ia_api_key',
  D.conditions.every(c => Array.isArray(c.show) && c.show.includes('ia_api_key')));
ok('COND04: providers cloud couverts — openai + anthropic',
  cloudProviders.slice(0, 2).every(p =>
    D.conditions.some(c => c.when.field === 'ia_provider' && c.when.eq === p)));
ok('COND05: providers cloud couverts — mistral + cohere + groq',
  ['mistral','cohere','groq'].every(p =>
    D.conditions.some(c => c.when.field === 'ia_provider' && c.when.eq === p)));
ok('COND06: providers cloud couverts — together-ai + huggingface + custom',
  ['together-ai','huggingface','custom'].every(p =>
    D.conditions.some(c => c.when.field === 'ia_provider' && c.when.eq === p)));
ok('COND07: aucun provider local dans les conditions (ollama absent)', (() => {
  const localProviders = ['ollama','lm-studio','gpt4all','llamacpp','textgen-webui','koboldcpp'];
  return !D.conditions.some(c => localProviders.includes(c.when?.eq));
})());
ok('COND08: tous les eq correspondent exactement aux 8 providers attendus', (() => {
  const eqs = D.conditions.map(c => c.when.eq).sort().join(',');
  return eqs === cloudProviders.slice().sort().join(',');
})());

/* ══════════════════════════════════════════════════════════════════
   BIND — profile_bindings (1 entrée exacte)
   ══════════════════════════════════════════════════════════════════ */
section('BIND — profile_bindings');
ok('BIND01: profile_bindings est tableau',
  Array.isArray(D.profile_bindings));
ok('BIND02: exactement 1 binding',
  D.profile_bindings.length === 1);
ok('BIND03: field = "ia_machine"',
  D.profile_bindings[0]?.field === 'ia_machine');
ok('BIND04: source = "$USER.machines"',
  D.profile_bindings[0]?.source === '$USER.machines');
ok('BIND05: key = "active"',
  D.profile_bindings[0]?.key === 'active');
ok('BIND06: prop = "id"',
  D.profile_bindings[0]?.prop === 'id');

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (2 champs)
   ══════════════════════════════════════════════════════════════════ */
section('S — sensitive F-15 (2 champs)');
ok('S01: ia_api_key — password + sensitive (endpoint)', (() => {
  const f = fieldInForm('endpoint', 'ia_api_key');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S02: ia_img_api_key — password + sensitive (image_ia)', (() => {
  const f = fieldInForm('image_ia', 'ia_img_api_key');
  return f?.type === 'password' && f?.sensitive === true;
})());
ok('S03: aucun autre champ sensitive hors des 2 attendus', (() => {
  const ids = allFields().filter(f => f.sensitive === true).map(f => f.id).sort().join(',');
  return ids === ['ia_api_key','ia_img_api_key'].sort().join(',');
})());

/* ══════════════════════════════════════════════════════════════════
   TOT — Total champs
   ══════════════════════════════════════════════════════════════════ */
section('TOT — Total champs');
ok('TOT01: 50 champs au total (16+11+11+12)',
  allFields().length === 50);
ok('TOT02: tous les champs ont un id string non vide',
  allFields().every(f => typeof f.id === 'string' && f.id.length > 0));
ok('TOT03: exactement 2 champs sensitive:true (F-15)',
  allFields().filter(f => f.sensitive === true).length === 2);
ok('TOT04: exactement 2 champs type=password',
  allFields().filter(f => f.type === 'password').length === 2);

/* ─── résultat ──────────────────────────────────────────────────── */
const total = pass + fail;
console.log('\n' + '═'.repeat(58));
console.log(`  Résultat : ${total} tests — ${pass} ✓  ${fail} ✗`);
console.log(`  STATUT : ${fail === 0 ? 'PASS' : 'FAIL'}`);
if (fail > 0) process.exit(1);
