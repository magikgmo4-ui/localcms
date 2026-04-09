#!/usr/bin/env node
/**
 * tests/memory-view-adopt.test.js
 * GO_MEMORY_VIEW_ADOPT_TESTS_01 — Tests adoption MOD_MEMORY_VIEW
 * Run : node tests/memory-view-adopt.test.js
 *
 * Blocs testés :
 *   N  — normalizeEntry        (8 tests)  — normalisations champs polymorphes
 *   RE — resolveEntries        (6 tests)  — payloads Array/.entries/.items/.bricks
 *   F  — rebuildFilters simulé (8 tests)  — filtres search/type/status via _state
 *   U  — utilitaires pures     (5 tests)  — escapeHtml / normalizePath / unique
 *   P  — findPathMatch         (3 tests)  — résolution path exact / fallback endsWith
 *
 * Pattern d'extraction : regex IIFE sur localcms-v5.html + mocks FN/BUS minimaux.
 * Aucune dépendance browser. State manipulé via __test_helpers._state.
 *
 * Contrat V1 retenu (CLOSEOUT_MEMORY_VIEW_V1.txt) :
 *   index/index_full.json  → liste + filtres
 *   bricks/MB-*.md         → détail lisible (non couvert ici : async File API)
 */
'use strict';

const fs   = require('fs');
const path = require('path');

/* ── Extraction IIFE depuis le HTML ─────────────────────── */

const htmlSrc = fs.readFileSync(path.join(__dirname, '../localcms-v5.html'), 'utf8');
const start   = htmlSrc.indexOf('const MOD_MEMORY_VIEW = (() => {');
const end     = htmlSrc.indexOf('})();', start) + 5;
if (start < 0 || end <= start) throw new Error('MOD_MEMORY_VIEW introuvable dans localcms-v5.html');
const iifeSrc = htmlSrc.slice(start, end);

/* ── Mocks minimaux ─────────────────────────────────────── */

const FN  = { el: () => null, html: () => {} };
const BUS = { emit: () => {} };

/* ── Évaluation de l'IIFE en Node.js ───────────────────── */

eval(iifeSrc.replace(/\bconst\s+MOD_MEMORY_VIEW\b/, 'globalThis.MOD_MEMORY_VIEW')); // eslint-disable-line

const M = globalThis.MOD_MEMORY_VIEW;
const H = M.__test_helpers;

/* ── Harness ────────────────────────────────────────────── */

let _p = 0, _f = 0;
const test   = (label, fn) => {
  try   { fn(); process.stdout.write(`  ✓  ${label}\n`); _p++; }
  catch (e) { process.stderr.write(`  ✗  ${label}\n     → ${e.message}\n`); _f++; }
};
const assert = (c, m) => { if (!c) throw new Error(m ?? 'assertion échouée'); };

/* ── Helpers de test ────────────────────────────────────── */

const resetState = (overrides = {}) => {
  const s = H._state;
  s.entries      = overrides.entries      ?? [];
  s.filtered     = overrides.filtered     ?? [];
  s.search       = overrides.search       ?? '';
  s.typeFilter   = overrides.typeFilter   ?? 'all';
  s.statusFilter = overrides.statusFilter ?? 'all';
  s.filesByPath  = overrides.filesByPath  ?? new Map();
  s.markdownById = overrides.markdownById ?? new Map();
};

/* ═══════════════════════════════════════════════════════════ */

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  MEMORY_VIEW ADOPT — Tests d\'intégration        ║');
console.log('╚══════════════════════════════════════════════════╝\n');

/* ── INIT : vérification module ────────────────────────── */

console.log('INIT — Module et __test_helpers\n');

test('INIT01: MOD_MEMORY_VIEW est un objet', () => assert(M && typeof M === 'object'));
test('INIT02: API publique présente', () => {
  ['init','render','openPicker','loadFromInput','loadFiles','setSearch','setTypeFilter','setStatusFilter','selectBrick'].forEach(k => {
    assert(typeof M[k] === 'function', `M.${k} manquant`);
  });
});
test('INIT03: __test_helpers est un objet', () => assert(H && typeof H === 'object'));
test('INIT04: helpers attendus présents', () => {
  ['normalizeEntry','resolveEntries','escapeHtml','normalizePath','unique','rebuildFilters','findPathMatch','_state'].forEach(k => {
    assert(k in H, `H.${k} manquant`);
  });
});

/* ── N : normalizeEntry ─────────────────────────────────── */

console.log('\nN — normalizeEntry\n');

test('N01: champs standards passent inchangés', () => {
  const e = H.normalizeEntry({ id:'MB-00001', title:'Mon titre', type:'session', status:'active',
    date:'2026-04-01', project:'localcms', module:'tests', summary_short:'résumé',
    resume_point:'reprise', tags:['a','b'], path:'bricks/MB-00001.md' });
  assert(e.id === 'MB-00001', 'id');
  assert(e.title === 'Mon titre', 'title');
  assert(e.type === 'session', 'type');
  assert(e.status === 'active', 'status');
  assert(e.path === 'bricks/MB-00001.md', 'path');
});

test('N02: brick_id accepté quand id absent', () => {
  const e = H.normalizeEntry({ brick_id:'MB-00002', title:'T' });
  assert(e.id === 'MB-00002', `attendu MB-00002, obtenu ${e.id}`);
});

test('N03: summary_short utilisé si title absent', () => {
  const e = H.normalizeEntry({ id:'x', summary_short:'Court résumé' });
  assert(e.title === 'Court résumé', `attendu 'Court résumé', obtenu '${e.title}'`);
});

test('N04: id utilisé comme title de repli si summary_short absent', () => {
  const e = H.normalizeEntry({ id:'MB-00003' });
  assert(e.title === 'MB-00003', `attendu 'MB-00003', obtenu '${e.title}'`);
});

test('N05: title par défaut = (sans titre) quand rien', () => {
  const e = H.normalizeEntry({});
  assert(e.title === '(sans titre)', `attendu '(sans titre)', obtenu '${e.title}'`);
});

test('N06: path polymorphe — file accepté', () => {
  const e = H.normalizeEntry({ id:'x', file:'bricks/MB-00001__seed.md' });
  assert(e.path === 'bricks/MB-00001__seed.md', `path: ${e.path}`);
});

test('N07: path polymorphe — relative_path accepté', () => {
  const e = H.normalizeEntry({ id:'x', relative_path:'bricks/MB-00001.md' });
  assert(e.path === 'bricks/MB-00001.md', `path: ${e.path}`);
});

test('N08: tags non-tableau normalisé en tableau vide', () => {
  const e = H.normalizeEntry({ id:'x', tags:'mauvais type' });
  assert(Array.isArray(e.tags), 'tags doit être Array');
  assert(e.tags.length === 0, `tags.length attendu 0, obtenu ${e.tags.length}`);
});

/* ── RE : resolveEntries ────────────────────────────────── */

console.log('\nRE — resolveEntries\n');

test('RE01: payload Array direct retourné tel quel', () => {
  const arr = [{id:'a'},{id:'b'}];
  const r = H.resolveEntries(arr);
  assert(r === arr, 'doit retourner la même référence');
});

test('RE02: payload .entries extrait', () => {
  const arr = [{id:'a'}];
  const r = H.resolveEntries({ entries: arr });
  assert(r === arr, 'doit retourner payload.entries');
});

test('RE03: payload .items extrait', () => {
  const arr = [{id:'b'}];
  const r = H.resolveEntries({ items: arr });
  assert(r === arr, 'doit retourner payload.items');
});

test('RE04: payload .bricks extrait', () => {
  const arr = [{id:'c'}];
  const r = H.resolveEntries({ bricks: arr });
  assert(r === arr, 'doit retourner payload.bricks');
});

test('RE05: payload vide retourne tableau vide', () => {
  const r = H.resolveEntries({});
  assert(Array.isArray(r) && r.length === 0, `attendu [], obtenu ${JSON.stringify(r)}`);
});

test('RE06: payload non reconnu retourne tableau vide', () => {
  const r = H.resolveEntries({ foo: 'bar', count: 3 });
  assert(Array.isArray(r) && r.length === 0, `attendu [], obtenu ${JSON.stringify(r)}`);
});

/* ── F : rebuildFilters ─────────────────────────────────── */

console.log('\nF — rebuildFilters\n');

const BRICK_A = H.normalizeEntry({ id:'MB-00001', title:'Seed LocalCMS', type:'session', status:'active', tags:['seed','localcms'] });
const BRICK_B = H.normalizeEntry({ id:'MB-00002', title:'Read-only viewer', type:'doc', status:'done', tags:['viewer'] });
const BRICK_C = H.normalizeEntry({ id:'MB-00003', title:'Dataset prêt', type:'session', status:'done', tags:[] });

test('F01: sans filtre — toutes les bricks passent', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C] });
  H.rebuildFilters();
  assert(H._state.filtered.length === 3, `attendu 3, obtenu ${H._state.filtered.length}`);
});

test('F02: typeFilter session — 2 bricks retenues', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], typeFilter: 'session' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 2, `attendu 2, obtenu ${H._state.filtered.length}`);
});

test('F03: typeFilter doc — 1 brick retenue', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], typeFilter: 'doc' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 1, `attendu 1, obtenu ${H._state.filtered.length}`);
  assert(H._state.filtered[0].id === 'MB-00002', `id: ${H._state.filtered[0].id}`);
});

test('F04: statusFilter done — 2 bricks retenues', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], statusFilter: 'done' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 2, `attendu 2, obtenu ${H._state.filtered.length}`);
});

test('F05: search par id — 1 brick retenue', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], search: 'MB-00002' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 1, `attendu 1, obtenu ${H._state.filtered.length}`);
  assert(H._state.filtered[0].id === 'MB-00002', `id: ${H._state.filtered[0].id}`);
});

test('F06: search par tag — 1 brick retenue', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], search: 'viewer' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 1, `attendu 1, obtenu ${H._state.filtered.length}`);
  assert(H._state.filtered[0].id === 'MB-00002', `id: ${H._state.filtered[0].id}`);
});

test('F07: search insensible à la casse', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], search: 'SEED' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 1, `attendu 1, obtenu ${H._state.filtered.length}`);
  assert(H._state.filtered[0].id === 'MB-00001', `id: ${H._state.filtered[0].id}`);
});

test('F08: type + status combinés — 0 résultat possible', () => {
  resetState({ entries: [BRICK_A, BRICK_B, BRICK_C], typeFilter: 'doc', statusFilter: 'active' });
  H.rebuildFilters();
  assert(H._state.filtered.length === 0, `attendu 0, obtenu ${H._state.filtered.length}`);
});

/* ── U : utilitaires pures ──────────────────────────────── */

console.log('\nU — escapeHtml / normalizePath / unique\n');

test('U01: escapeHtml — & < > " \' échappés', () => {
  const r = H.escapeHtml('<script>alert("XSS")&\'</script>');
  assert(!r.includes('<'), `< non échappé: ${r}`);
  assert(!r.includes('>'), `> non échappé: ${r}`);
  assert(!r.includes('"'), `" non échappé: ${r}`);
  assert(!r.includes("'"), `' non échappé: ${r}`);
  assert(r.includes('&amp;'), `& non échappé: ${r}`);
});

test('U02: escapeHtml — valeur undefined traitée comme string vide', () => {
  const r = H.escapeHtml(undefined);
  assert(typeof r === 'string', `attendu string, obtenu ${typeof r}`);
});

test('U03: normalizePath — backslash converti en slash', () => {
  const r = H.normalizePath('bricks\\MB-00001.md');
  assert(r === 'bricks/MB-00001.md', `obtenu: ${r}`);
});

test('U04: normalizePath — ./ de tête retiré', () => {
  const r = H.normalizePath('./bricks/MB-00001.md');
  assert(r === 'bricks/MB-00001.md', `obtenu: ${r}`);
});

test('U05: unique — déduplique et trie', () => {
  const r = H.unique(['b','a','a','c','b']);
  assert(r.length === 3, `attendu 3, obtenu ${r.length}`);
  assert(r[0] === 'a' && r[1] === 'b' && r[2] === 'c', `ordre: ${JSON.stringify(r)}`);
});

/* ── P : findPathMatch ──────────────────────────────────── */

console.log('\nP — findPathMatch\n');

test('P01: correspondance exacte dans filesByPath', () => {
  const fakeFile = { name: 'MB-00001.md' };
  resetState({ filesByPath: new Map([['bricks/MB-00001.md', fakeFile]]) });
  const r = H.findPathMatch('bricks/MB-00001.md');
  assert(r === fakeFile, 'doit retourner le fichier exact');
});

test('P02: correspondance fallback endsWith', () => {
  const fakeFile = { name: 'MB-00002.md' };
  resetState({ filesByPath: new Map([['memory_bricks_source/bricks/MB-00002.md', fakeFile]]) });
  const r = H.findPathMatch('bricks/MB-00002.md');
  assert(r === fakeFile, 'doit retourner via endsWith');
});

test('P03: retourne null si path inconnu', () => {
  resetState({ filesByPath: new Map([['bricks/MB-00001.md', {}]]) });
  const r = H.findPathMatch('bricks/MB-99999.md');
  assert(r === null, `attendu null, obtenu ${JSON.stringify(r)}`);
});

/* ═══════════════════════════════════════════════════════════ */

const total = _p + _f;
console.log(`\n${'═'.repeat(50)}`);
console.log(`Résultat : ${_p}/${total} tests réussis`);
if (_f > 0) {
  console.error(`ÉCHEC : ${_f} test(s) ont échoué`);
  process.exit(1);
} else {
  console.log('PASS');
  process.exit(0);
}
