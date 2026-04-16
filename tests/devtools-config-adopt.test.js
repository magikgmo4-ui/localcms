/**
 * tests/devtools-config-adopt.test.js
 * LocalCMS · GO_LOCALCMS_DEVTOOLS_CONFIG_ADOPT_01 · GO-5/8
 *
 * Adopt test DATA-ONLY pour modules/devtools-config.js — MOD_DEVTOOLS_CFG_DATA
 *
 * Module  : devtools_cfg
 * Forms   : eslint(18) / prettier(15) / typescript(28) / vite(18)
 *           jest(12) / python_tools(16) / editorconfig(13) / precommit(17) = 137 champs
 * F-15    : 0 sensitive (aucun champ password)
 * C/V/B   : conditions[] vide · validators[] vide · profile_bindings[] vide
 *
 * Pattern : eval(src.replace(/\bconst\s+MOD_DEVTOOLS_CFG_DATA\b/, 'globalThis.MOD_DEVTOOLS_CFG_DATA'))
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
const src = fs.readFileSync(path.join(__dirname, '../modules/devtools-config.js'), 'utf8');
eval(src.replace(/\bconst\s+MOD_DEVTOOLS_CFG_DATA\b/, 'globalThis.MOD_DEVTOOLS_CFG_DATA'));
const D = globalThis.MOD_DEVTOOLS_CFG_DATA;

/* ─── helpers ───────────────────────────────────────────────────── */
const allFields   = () => Object.values(D.forms).flatMap(f => f.sections.flatMap(s => s.fields));
const fieldInForm = (fk, id) => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).find(f => f.id === id);
const countInForm = (fk) => (D.forms[fk]?.sections ?? []).reduce((n, s) => n + s.fields.length, 0);

/* ══════════════════════════════════════════════════════════════════
   BANNER
   ══════════════════════════════════════════════════════════════════ */
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  DEVTOOLS_CFG ADOPT — Tests adoption MOD_DEVTOOLS_CFG   ║');
console.log('╚══════════════════════════════════════════════════════════╝');

/* ══════════════════════════════════════════════════════════════════
   INIT — Chargement module
   ══════════════════════════════════════════════════════════════════ */
section('INIT — Chargement module');
ok('INIT01: MOD_DEVTOOLS_CFG_DATA est un objet non-null',
  D !== null && typeof D === 'object');
ok('INIT02: id = "devtools_cfg"',
  D.id === 'devtools_cfg');

/* ══════════════════════════════════════════════════════════════════
   M — Identité
   ══════════════════════════════════════════════════════════════════ */
section('M — Identité');
ok('M01: label = "Dev Tools"',
  D.label === 'Dev Tools');
ok('M02: version semver x.y.z',
  /^\d+\.\d+\.\d+$/.test(D.version));
ok('M03: type = "config"',
  D.type === 'config');
ok('M04: capabilities inclut "render"',
  Array.isArray(D.capabilities) && D.capabilities.includes('render'));
ok('M05: capabilities inclut "generate"',
  D.capabilities.includes('generate'));
ok('M06: meta.activeDefault = "eslint"',
  D.meta?.activeDefault === 'eslint');
ok('M07: meta.typeLabels.typescript contient "TypeScript"',
  typeof D.meta?.typeLabels?.typescript === 'string' && D.meta.typeLabels.typescript.includes('TypeScript'));
ok('M08: meta.typeLabels.python_tools = "Python/pyproject"',
  D.meta?.typeLabels?.python_tools === 'Python/pyproject');

/* ══════════════════════════════════════════════════════════════════
   K — Structure
   ══════════════════════════════════════════════════════════════════ */
section('K — Structure');
ok('K01: forms est un objet (non-Array)',
  D.forms !== null && typeof D.forms === 'object' && !Array.isArray(D.forms));
ok('K02: exactement 8 forms déclarés',
  Object.keys(D.forms).length === 8);
ok('K03: clés forms attendues présentes',
  ['eslint','prettier','typescript','vite','jest','python_tools','editorconfig','precommit']
    .every(k => k in D.forms));
ok('K04: conditions[] vide',
  Array.isArray(D.conditions) && D.conditions.length === 0);
ok('K05: validators[] vide',
  Array.isArray(D.validators) && D.validators.length === 0);
ok('K06: profile_bindings[] vide',
  Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0);

/* ══════════════════════════════════════════════════════════════════
   F1 — form eslint (18 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F1 — form eslint (18 champs)');
ok('F1-01: 18 champs dans eslint',
  countInForm('eslint') === 18);
ok('F1-02: id form = "dt-eslint"',
  D.forms.eslint?.id === 'dt-eslint');
ok('F1-03: el_tool — select, value "eslint"', (() => {
  const f = fieldInForm('eslint', 'el_tool');
  return f?.type === 'select' && f?.value === 'eslint';
})());
ok('F1-04: el_env_browser — toggle, value true', (() => {
  const f = fieldInForm('eslint', 'el_env_browser');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F1-05: el_max_len — number, value "120"', (() => {
  const f = fieldInForm('eslint', 'el_max_len');
  return f?.type === 'number' && f?.value === '120';
})());

/* ══════════════════════════════════════════════════════════════════
   F2 — form prettier (15 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F2 — form prettier (15 champs)');
ok('F2-01: 15 champs dans prettier',
  countInForm('prettier') === 15);
ok('F2-02: id form = "dt-prettier"',
  D.forms.prettier?.id === 'dt-prettier');
ok('F2-03: pr_print_width — number, value "100"', (() => {
  const f = fieldInForm('prettier', 'pr_print_width');
  return f?.type === 'number' && f?.value === '100';
})());
ok('F2-04: pr_single_quote — toggle, value true', (() => {
  const f = fieldInForm('prettier', 'pr_single_quote');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F2-05: pr_trailing_comma — select, value "es5"', (() => {
  const f = fieldInForm('prettier', 'pr_trailing_comma');
  return f?.type === 'select' && f?.value === 'es5';
})());

/* ══════════════════════════════════════════════════════════════════
   F3 — form typescript (28 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F3 — form typescript (28 champs)');
ok('F3-01: 28 champs dans typescript',
  countInForm('typescript') === 28);
ok('F3-02: id form = "dt-tsconfig"',
  D.forms.typescript?.id === 'dt-tsconfig');
ok('F3-03: ts_target — select, value "ES2022"', (() => {
  const f = fieldInForm('typescript', 'ts_target');
  return f?.type === 'select' && f?.value === 'ES2022';
})());
ok('F3-04: ts_strict — toggle, value true', (() => {
  const f = fieldInForm('typescript', 'ts_strict');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F3-05: ts_skip_lib_check — toggle, value true', (() => {
  const f = fieldInForm('typescript', 'ts_skip_lib_check');
  return f?.type === 'toggle' && f?.value === true;
})());

/* ══════════════════════════════════════════════════════════════════
   F4 — form vite (18 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F4 — form vite (18 champs)');
ok('F4-01: 18 champs dans vite',
  countInForm('vite') === 18);
ok('F4-02: id form = "dt-vite"',
  D.forms.vite?.id === 'dt-vite');
ok('F4-03: vt_framework — select, value "react"', (() => {
  const f = fieldInForm('vite', 'vt_framework');
  return f?.type === 'select' && f?.value === 'react';
})());
ok('F4-04: vt_port — number, value "5173"', (() => {
  const f = fieldInForm('vite', 'vt_port');
  return f?.type === 'number' && f?.value === '5173';
})());
ok('F4-05: vt_file_ext — file-ext, value "js"', (() => {
  const f = fieldInForm('vite', 'vt_file_ext');
  return f?.type === 'file-ext' && f?.value === 'js';
})());

/* ══════════════════════════════════════════════════════════════════
   F5 — form jest (12 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F5 — form jest (12 champs)');
ok('F5-01: 12 champs dans jest',
  countInForm('jest') === 12);
ok('F5-02: id form = "dt-jest"',
  D.forms.jest?.id === 'dt-jest');
ok('F5-03: jt_tool — select, value "vitest"', (() => {
  const f = fieldInForm('jest', 'jt_tool');
  return f?.type === 'select' && f?.value === 'vitest';
})());
ok('F5-04: jt_coverage — toggle, value true', (() => {
  const f = fieldInForm('jest', 'jt_coverage');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F5-05: jt_coverage_threshold — number, value "70"', (() => {
  const f = fieldInForm('jest', 'jt_coverage_threshold');
  return f?.type === 'number' && f?.value === '70';
})());

/* ══════════════════════════════════════════════════════════════════
   F6 — form python_tools (16 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F6 — form python_tools (16 champs)');
ok('F6-01: 16 champs dans python_tools',
  countInForm('python_tools') === 16);
ok('F6-02: id form = "dt-pytools"',
  D.forms.python_tools?.id === 'dt-pytools');
ok('F6-03: py_version — text, value "0.1.0"', (() => {
  const f = fieldInForm('python_tools', 'py_version');
  return f?.type === 'text' && f?.value === '0.1.0';
})());
ok('F6-04: py_ruff — toggle, value true', (() => {
  const f = fieldInForm('python_tools', 'py_ruff');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F6-05: py_file_ext — file-ext, value "toml"', (() => {
  const f = fieldInForm('python_tools', 'py_file_ext');
  return f?.type === 'file-ext' && f?.value === 'toml';
})());

/* ══════════════════════════════════════════════════════════════════
   F7 — form editorconfig (13 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F7 — form editorconfig (13 champs)');
ok('F7-01: 13 champs dans editorconfig',
  countInForm('editorconfig') === 13);
ok('F7-02: id form = "dt-editor"',
  D.forms.editorconfig?.id === 'dt-editor');
ok('F7-03: ec_indent_style — select, value "space"', (() => {
  const f = fieldInForm('editorconfig', 'ec_indent_style');
  return f?.type === 'select' && f?.value === 'space';
})());
ok('F7-04: ec_trim_trailing — toggle, value true', (() => {
  const f = fieldInForm('editorconfig', 'ec_trim_trailing');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F7-05: ec_max_line — select, value "120"', (() => {
  const f = fieldInForm('editorconfig', 'ec_max_line');
  return f?.type === 'select' && f?.value === '120';
})());

/* ══════════════════════════════════════════════════════════════════
   F8 — form precommit (17 champs)
   ══════════════════════════════════════════════════════════════════ */
section('F8 — form precommit (17 champs)');
ok('F8-01: 17 champs dans precommit',
  countInForm('precommit') === 17);
ok('F8-02: id form = "dt-precommit"',
  D.forms.precommit?.id === 'dt-precommit');
ok('F8-03: pc_prettier — toggle, value true', (() => {
  const f = fieldInForm('precommit', 'pc_prettier');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F8-04: pc_detect_secrets — toggle, value true', (() => {
  const f = fieldInForm('precommit', 'pc_detect_secrets');
  return f?.type === 'toggle' && f?.value === true;
})());
ok('F8-05: pc_file_ext — file-ext, value "yaml"', (() => {
  const f = fieldInForm('precommit', 'pc_file_ext');
  return f?.type === 'file-ext' && f?.value === 'yaml';
})());

/* ══════════════════════════════════════════════════════════════════
   TYPE — Types critiques
   ══════════════════════════════════════════════════════════════════ */
section('TYPE — Types critiques');
ok('TYPE01: multiselect présent (el_extends)',
  fieldInForm('eslint', 'el_extends')?.type === 'multiselect');
ok('TYPE02: multiselect présent (vt_lib_formats)',
  fieldInForm('vite', 'vt_lib_formats')?.type === 'multiselect');
ok('TYPE03: textarea présent (pr_overrides)',
  fieldInForm('prettier', 'pr_overrides')?.type === 'textarea');
ok('TYPE04: textarea présent (ts_paths)',
  fieldInForm('typescript', 'ts_paths')?.type === 'textarea');
ok('TYPE05: file-ext présent dans chaque form', (() => {
  return ['eslint','prettier','typescript','vite','jest','python_tools','editorconfig','precommit']
    .every(fk => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).some(f => f.type === 'file-ext'));
})());
ok('TYPE06: toggle présent dans chaque form', (() => {
  return ['eslint','prettier','typescript','vite','jest','python_tools','editorconfig','precommit']
    .every(fk => (D.forms[fk]?.sections ?? []).flatMap(s => s.fields).some(f => f.type === 'toggle'));
})());

/* ══════════════════════════════════════════════════════════════════
   S — sensitive F-15 (0 champ sensitive attendu)
   ══════════════════════════════════════════════════════════════════ */
section('S — sensitive F-15 (aucun)');
ok('S01: aucun champ sensitive:true dans le module (F-15 = 0)',
  allFields().filter(f => f.sensitive === true).length === 0);
ok('S02: aucun champ type=password',
  allFields().filter(f => f.type === 'password').length === 0);
ok('S03: vt_base — value "/" conforme P0 (racine générique)', (() => {
  const f = fieldInForm('vite', 'vt_base');
  return f?.value === '/';
})());

/* ══════════════════════════════════════════════════════════════════
   TOT — Total champs
   ══════════════════════════════════════════════════════════════════ */
section('TOT — Total champs');
ok('TOT01: 137 champs au total (18+15+28+18+12+16+13+17)',
  allFields().length === 137);
ok('TOT02: tous les champs ont un id string non vide',
  allFields().every(f => typeof f.id === 'string' && f.id.length > 0));
ok('TOT03: 0 champ sensitive:true (F-15 conforme)',
  allFields().filter(f => f.sensitive === true).length === 0);
ok('TOT04: champs file-ext = 8 (1 par form)',
  allFields().filter(f => f.type === 'file-ext').length === 8);

/* ─── résultat ──────────────────────────────────────────────────── */
const total = pass + fail;
console.log('\n' + '═'.repeat(58));
console.log(`  Résultat : ${total} tests — ${pass} ✓  ${fail} ✗`);
console.log(`  STATUT : ${fail === 0 ? 'PASS' : 'FAIL'}`);
if (fail > 0) process.exit(1);
