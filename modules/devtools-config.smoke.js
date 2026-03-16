/**
 * modules/devtools-config.smoke.js — Smoke tests M-4.4 v1.0
 * LocalCMS · modules/devtools-config.js
 *
 * Blocs :
 *   P  — Pureté
 *   M  — Identité
 *   K  — Structure (forms, meta, conditions, validators, bindings)
 *   F1 — eslint        (18 champs)
 *   F2 — prettier      (15 champs)
 *   F3 — typescript    (28 champs)
 *   F4 — vite          (18 champs)
 *   F5 — jest          (12 champs)
 *   F6 — python_tools  (16 champs)
 *   F7 — editorconfig  (13 champs)
 *   F8 — precommit     (18 champs)
 *   S  — F-15 sensitive (0 champ — vérification explicite)
 *   P0 — Conformité P0
 *   C  — Conditions (vide)
 *   V  — Validators (vide)
 *   B  — Profile bindings
 *
 * Exécution : node modules/devtools-config.smoke.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'devtools-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_DEVTOOLS_CFG_DATA\b/, 'globalThis.MOD_DEVTOOLS_CFG_DATA'));

const D = globalThis.MOD_DEVTOOLS_CFG_DATA;

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
ok('P-1  MOD_DEVTOOLS_CFG_DATA est un objet',  typeof D === 'object' && D !== null);
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
ok('M-1  id = "devtools_cfg"',        D.id            === 'devtools_cfg');
ok('M-2  label non vide',             typeof D.label  === 'string' && D.label.length > 0);
ok('M-3  version semver',             /^\d+\.\d+\.\d+$/.test(D.version ?? ''));
ok('M-4  type = "config"',            D.type          === 'config');
ok('M-5  os_compat includes "all"',   (D.os_compat ?? []).includes('all'));
ok('M-6  capabilities includes "generate"', (D.capabilities ?? []).includes('generate'));

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 K \u00b7 Structure \u2500\u2500');
ok('K-1  meta pr\u00e9sent',                    D.meta && typeof D.meta === 'object');
ok('K-2  meta.activeDefault = "eslint"',        D.meta?.activeDefault === 'eslint');
ok('K-3  meta.typeIcons pr\u00e9sent (8)',       Object.keys(D.meta?.typeIcons ?? {}).length === 8);
ok('K-4  meta.typeLabels pr\u00e9sent (8)',      Object.keys(D.meta?.typeLabels ?? {}).length === 8);
ok('K-5  forms pr\u00e9sent',                   D.forms && typeof D.forms === 'object');
ok('K-6  8 forms d\u00e9clar\u00e9s',           Object.keys(D.forms ?? {}).length === 8);
['eslint','prettier','typescript','vite','jest','python_tools','editorconfig','precommit']
  .forEach((k,i) => ok(`K-${7+i}  forms contient "${k}"`, k in (D.forms ?? {})));
ok('K-15 chaque form a id',
   Object.values(D.forms ?? {}).every(f => typeof f.id === 'string' && f.id.length > 0));
ok('K-16 chaque form a sections[]',
   Object.values(D.forms ?? {}).every(f => Array.isArray(f.sections) && f.sections.length > 0));
ok('K-17 conditions tableau',    Array.isArray(D.conditions));
ok('K-18 validators tableau',    Array.isArray(D.validators));
ok('K-19 profile_bindings tab.', Array.isArray(D.profile_bindings));
ok('K-20 pas de cl\u00e9 "generators"', !('generators' in D));

/* ══════════════════════════════════════════════════════════════════
   F1 — eslint (18 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F1 \u00b7 eslint (18 champs) \u2500\u2500');
const elIds = fieldsOf('eslint').map(f => f.id);
const EXP_EL = [
  'el_tool','el_extends','el_parser','el_env_browser','el_env_node','el_env_es2022',
  'el_ecma_version','el_source_type','el_jsx',
  'el_no_console','el_no_unused','el_semi','el_quotes','el_indent',
  'el_max_len','el_eol_last','el_ignore_patterns','el_file_ext'
];
ok('F1-1  18 champs', elIds.length === 18);
EXP_EL.forEach((id,i) => ok(`F1-${i+2}  "${id}"`, elIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F2 — prettier (15 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F2 \u00b7 prettier (15 champs) \u2500\u2500');
const prIds = fieldsOf('prettier').map(f => f.id);
const EXP_PR = [
  'pr_print_width','pr_tab_width','pr_use_tabs','pr_semi','pr_single_quote',
  'pr_jsx_single','pr_trailing_comma','pr_bracket_spacing','pr_bracket_same_line',
  'pr_arrow_parens','pr_end_of_line','pr_prose_wrap','pr_html_whitespace',
  'pr_overrides','pr_file_ext'
];
ok('F2-1  15 champs', prIds.length === 15);
EXP_PR.forEach((id,i) => ok(`F2-${i+2}  "${id}"`, prIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F3 — typescript (28 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F3 \u00b7 typescript (28 champs) \u2500\u2500');
const tsIds = fieldsOf('typescript').map(f => f.id);
const EXP_TS = [
  'ts_target','ts_lib','ts_module','ts_module_resolution','ts_jsx',
  'ts_out_dir','ts_root_dir','ts_base_url','ts_paths',
  'ts_strict','ts_no_implicit_any','ts_strict_null',
  'ts_no_unused_locals','ts_no_unused_params',
  'ts_exact_opt_props','ts_no_unchecked_idx',
  'ts_es_module_interop','ts_allow_synth','ts_skip_lib_check',
  'ts_declaration','ts_source_map','ts_inline_source_map',
  'ts_resolve_json','ts_incremental','ts_composite',
  'ts_include','ts_exclude','ts_file_ext'
];
ok('F3-1  28 champs', tsIds.length === 28);
EXP_TS.forEach((id,i) => ok(`F3-${i+2}  "${id}"`, tsIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F4 — vite (18 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F4 \u00b7 vite (18 champs) \u2500\u2500');
const vtIds = fieldsOf('vite').map(f => f.id);
const EXP_VT = [
  'vt_framework','vt_root','vt_base','vt_out_dir','vt_target',
  'vt_source_map','vt_min','vt_chunk_size','vt_lib_mode','vt_lib_entry',
  'vt_lib_formats','vt_host','vt_port','vt_https','vt_open',
  'vt_cors','vt_proxy','vt_file_ext'
];
ok('F4-1  18 champs', vtIds.length === 18);
EXP_VT.forEach((id,i) => ok(`F4-${i+2}  "${id}"`, vtIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F5 — jest (12 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F5 \u00b7 jest (12 champs) \u2500\u2500');
const jtIds = fieldsOf('jest').map(f => f.id);
const EXP_JT = [
  'jt_tool','jt_test_env','jt_transform','jt_coverage',
  'jt_coverage_provider','jt_coverage_threshold','jt_setup_files',
  'jt_test_match','jt_module_name','jt_globals',
  'jt_watch_exclude','jt_file_ext'
];
ok('F5-1  12 champs', jtIds.length === 12);
EXP_JT.forEach((id,i) => ok(`F5-${i+2}  "${id}"`, jtIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F6 — python_tools (16 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F6 \u00b7 python_tools (16 champs) \u2500\u2500');
const pyIds = fieldsOf('python_tools').map(f => f.id);
const EXP_PY = [
  'py_name','py_version','py_python_req','py_build_backend',
  'py_ruff','py_ruff_line','py_ruff_select',
  'py_black','py_black_line','py_mypy','py_mypy_strict',
  'py_pytest_dir','py_pytest_cov','py_cov_threshold',
  'py_isort','py_file_ext'
];
ok('F6-1  16 champs', pyIds.length === 16);
EXP_PY.forEach((id,i) => ok(`F6-${i+2}  "${id}"`, pyIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F7 — editorconfig (13 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F7 \u00b7 editorconfig (13 champs) \u2500\u2500');
const ecIds = fieldsOf('editorconfig').map(f => f.id);
const EXP_EC = [
  'ec_indent_style','ec_indent_size','ec_end_of_line','ec_charset',
  'ec_trim_trailing','ec_insert_final','ec_max_line',
  'ec_makefile_tab','ec_md_trim','ec_py_indent',
  'ec_go_indent','ec_yaml_indent','ec_file_ext'
];
ok('F7-1  13 champs', ecIds.length === 13);
EXP_EC.forEach((id,i) => ok(`F7-${i+2}  "${id}"`, ecIds.includes(id)));

/* ══════════════════════════════════════════════════════════════════
   F8 — precommit (18 champs)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 F8 \u00b7 precommit (18 champs) \u2500\u2500');
const pcIds = fieldsOf('precommit').map(f => f.id);
const EXP_PC = [
  'pc_prettier','pc_eslint','pc_black','pc_ruff','pc_mypy',
  'pc_trailing_ws','pc_end_of_file','pc_check_yaml','pc_check_json',
  'pc_check_merge','pc_detect_secrets','pc_commit_lint','pc_commit_msg',
  'pc_hadolint','pc_shellcheck','pc_gitleaks','pc_file_ext'
];
ok('F8-1  16 hooks + 1 file_ext = 17', pcIds.length === 17);
EXP_PC.forEach((id,i) => ok(`F8-${i+2}  "${id}"`, pcIds.includes(id)));

const af = allFields();
ok('F-TOTAL  137 champs au total', af.length === 137);

/* ══════════════════════════════════════════════════════════════════
   S — F-15 sensitive (0 champ)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 S \u00b7 F-15 sensitive (0 attendu) \u2500\u2500');
const sensitiveIds = af.filter(f => f.sensitive === true).map(f => f.id);
ok('S-1  0 champ sensitive',           sensitiveIds.length === 0);
ok('S-2  0 champ de type password',    af.filter(f => f.type === 'password').length === 0);

/* ══════════════════════════════════════════════════════════════════
   P0 — Conformité
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 P0 \u00b7 Conformit\u00e9 P0 \u2500\u2500');
const fld = (id) => af.find(f => f.id === id);

ok('P0-1  pas de /etc/ en value',
   !af.some(f => typeof f.value === 'string' && /^\/etc\//.test(f.value)));
ok('P0-2  pas de /var/ en value',
   !af.some(f => typeof f.value === 'string' && /^\/var\//.test(f.value)));
ok('P0-3  pas de example.com en value',
   !af.some(f => typeof f.value === 'string' && f.value.includes('example.com')));
ok('P0-4  pas de localhost:PORT concret en value (sauf hint/proxy non structurel)',
   !af.some(f => typeof f.value === 'string' &&
     /localhost:\d{4,5}/.test(f.value) &&
     !['vt_proxy'].includes(f.id)));
ok('P0-5  pas de localStorage.setItem', !src.includes('localStorage.setItem'));
ok('P0-6  pas de document.write',       !src.includes('document.write'));
ok('P0-7  vt_base value="/" conserv\u00e9',   fld('vt_base')?.value === '/');
ok('P0-8  vt_host value="localhost" conserv\u00e9', fld('vt_host')?.value === 'localhost');
ok('P0-9  ts_out_dir value="./dist"',  fld('ts_out_dir')?.value === './dist');
ok('P0-10 ts_root_dir value="./src"',  fld('ts_root_dir')?.value === './src');

/* ══════════════════════════════════════════════════════════════════
   C — Conditions (vide)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 C \u00b7 Conditions \u2500\u2500');
ok('C-1  conditions vide', Array.isArray(D.conditions) && D.conditions.length === 0);

/* ══════════════════════════════════════════════════════════════════
   V — Validators (vide)
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 V \u00b7 Validators (vide) \u2500\u2500');
ok('V-1  validators vide (aucun required dans l\'inline)',
   Array.isArray(D.validators) && D.validators.length === 0);

/* ══════════════════════════════════════════════════════════════════
   B — Profile bindings
   ══════════════════════════════════════════════════════════════════ */
console.log('\n\u2500\u2500 B \u00b7 Profile bindings \u2500\u2500');
ok('B-1  profile_bindings vide',
   Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* Résumé */
const tot = _pass + _fail;
console.log(`\n${'─'.repeat(60)}`);
console.log(`  devtools-config.smoke v1.0  \u00b7  ${tot} assertions`);
console.log(`  ${_pass} \u2713  ${_fail > 0 ? _fail + ' \u2717  \u2190 ECHECS' : '0 \u2717'}`);
if (_fail > 0) { console.error('\n  STATUT : FAILED'); process.exit(1); }
console.log('  STATUT : OK\n');
