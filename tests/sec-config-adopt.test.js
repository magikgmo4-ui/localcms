#!/usr/bin/env node
/**
 * tests/sec-config-adopt.test.js
 * GO_LOCALCMS_SEC_CONFIG_ADOPT_01 — Tests adoption MOD_SEC_CFG_DATA
 * Run : node tests/sec-config-adopt.test.js
 *
 * Blocs testés :
 *   INIT (~2)  — chargement module
 *   M    (~6)  — identité (id, version, type, capabilities, meta)
 *   K    (~6)  — structure (forms 6 clés, conditions/validators/profile_bindings)
 *   F1   (~5)  — form ssl       (28 champs) — IDs + types critiques
 *   F2   (~5)  — form fail2ban  (20 champs) — IDs + types critiques
 *   F3   (~5)  — form gpg       (14 champs) — IDs + F-15 sensitive
 *   F4   (~4)  — form secrets    (7 champs) — IDs + types
 *   F5   (~5)  — form ssh_hardening (20 champs) — IDs + types
 *   F6   (~5)  — form scan      (19 champs) — IDs + types
 *   TOT  (~4)  — 108 champs, IDs uniques, 1 sensitive, 1 password
 *   VAL  (~3)  — 1 validator ssl_domain required
 *
 * Pattern DATA-ONLY : eval du const vers globalThis.
 * Aucun mock FN/BUS/DOM. Aucun patch HTML. Aucun __test_helpers.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

/* ── Chargement du module ─────────────────────────────────────── */

const src = fs.readFileSync(
  path.join(__dirname, '../modules/sec-config.js'), 'utf8'
);
// eslint-disable-next-line no-eval
eval(src.replace(/\bconst\s+MOD_SEC_CFG_DATA\b/, 'globalThis.MOD_SEC_CFG_DATA'));
const D = globalThis.MOD_SEC_CFG_DATA;

/* ── Harness ──────────────────────────────────────────────────── */

let _p = 0, _f = 0;
const test   = (label, fn) => {
  try   { fn(); process.stdout.write(`  ✓  ${label}\n`); _p++; }
  catch (e) { process.stderr.write(`  ✗  ${label}\n     → ${e.message}\n`); _f++; }
};
const assert = (c, m) => { if (!c) throw new Error(m ?? 'assertion échouée'); };

/* ── Helpers ──────────────────────────────────────────────────── */

const allFields = () =>
  Object.values(D.forms).flatMap(form =>
    form.sections.flatMap(s => s.fields)
  );

const fieldInForm = (formKey, id) =>
  (D.forms[formKey]?.sections ?? [])
    .flatMap(s => s.fields)
    .find(f => f.id === id);

const countInForm = (formKey) =>
  (D.forms[formKey]?.sections ?? []).reduce((n, s) => n + s.fields.length, 0);

/* ═══════════════════════════════════════════════════════════════════ */

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  SEC_CONFIG ADOPT — Tests adoption MOD_SEC_CFG_DATA     ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

/* ── INIT ─────────────────────────────────────────────────────── */

console.log('INIT — Chargement module\n');

test('INIT01: MOD_SEC_CFG_DATA est un objet non-null', () =>
  assert(D !== null && typeof D === 'object' && !Array.isArray(D)));
test('INIT02: id = "sec_cfg"', () =>
  assert(D.id === 'sec_cfg', `obtenu: ${JSON.stringify(D.id)}`));

/* ── M — Identité ─────────────────────────────────────────────── */

console.log('\nM — Identité\n');

test('M01: version semver x.y.z', () =>
  assert(/^\d+\.\d+\.\d+$/.test(D.version ?? ''), `obtenu: ${D.version}`));
test('M02: type = "config"', () =>
  assert(D.type === 'config', `obtenu: ${D.type}`));
test('M03: capabilities inclut "render"', () =>
  assert((D.capabilities ?? []).includes('render')));
test('M04: capabilities inclut "generate"', () =>
  assert((D.capabilities ?? []).includes('generate')));
test('M05: meta.activeDefault = "ssl"', () =>
  assert(D.meta?.activeDefault === 'ssl', `obtenu: ${D.meta?.activeDefault}`));
test('M06: meta.typeLabels.ssl = "SSL/TLS"', () =>
  assert(D.meta?.typeLabels?.ssl === 'SSL/TLS'));

/* ── K — Structure ────────────────────────────────────────────── */

console.log('\nK — Structure\n');

test('K01: forms est un objet (non-Array)', () =>
  assert(D.forms && typeof D.forms === 'object' && !Array.isArray(D.forms)));
test('K02: exactement 6 forms déclarés', () =>
  assert(Object.keys(D.forms).length === 6,
    `attendu 6, obtenu ${Object.keys(D.forms).length}`));
test('K03: clés forms = ssl/fail2ban/gpg/secrets/ssh_hardening/scan', () => {
  const expected = ['ssl','fail2ban','gpg','secrets','ssh_hardening','scan'];
  const keys = Object.keys(D.forms);
  assert(expected.every(k => keys.includes(k)),
    `clés manquantes: ${expected.filter(k => !keys.includes(k)).join(', ')}`);
});
test('K04: conditions[] vide', () =>
  assert(Array.isArray(D.conditions) && D.conditions.length === 0));
test('K05: validators[] non vide (1 entrée)', () =>
  assert(Array.isArray(D.validators) && D.validators.length === 1,
    `attendu 1, obtenu ${D.validators?.length}`));
test('K06: profile_bindings[] vide', () =>
  assert(Array.isArray(D.profile_bindings) && D.profile_bindings.length === 0));

/* ── F1 — form ssl ────────────────────────────────────────────── */

console.log('\nF1 — form ssl (28 champs)\n');

test('F1-01: 28 champs dans ssl', () => {
  const n = countInForm('ssl');
  assert(n === 28, `attendu 28, obtenu ${n}`);
});
test('F1-02: ssl_method — select, value "certbot"', () => {
  const f = fieldInForm('ssl', 'ssl_method');
  assert(f && f.type === 'select' && f.value === 'certbot');
});
test('F1-03: ssl_domain — text, value vide, placeholder P0', () => {
  const f = fieldInForm('ssl', 'ssl_domain');
  assert(f && f.type === 'text' && f.value === '' && f.placeholder === '<domaine>',
    `value=${f?.value} placeholder=${f?.placeholder}`);
});
test('F1-04: ssl_auto_renew — toggle, value true', () => {
  const f = fieldInForm('ssl', 'ssl_auto_renew');
  assert(f && f.type === 'toggle' && f.value === true);
});
test('F1-05: ssl_key_size — select, options inclut 4096', () => {
  const f = fieldInForm('ssl', 'ssl_key_size');
  assert(f && f.type === 'select' && f.options.includes('4096'));
});

/* ── F2 — form fail2ban ───────────────────────────────────────── */

console.log('\nF2 — form fail2ban (20 champs)\n');

test('F2-01: 20 champs dans fail2ban', () => {
  const n = countInForm('fail2ban');
  assert(n === 20, `attendu 20, obtenu ${n}`);
});
test('F2-02: f2b_bantime — select, value "1h"', () => {
  const f = fieldInForm('fail2ban', 'f2b_bantime');
  assert(f && f.type === 'select' && f.value === '1h');
});
test('F2-03: f2b_maxretry — number, value "5"', () => {
  const f = fieldInForm('fail2ban', 'f2b_maxretry');
  assert(f && f.type === 'number' && f.value === '5');
});
test('F2-04: f2b_ignoreip — value conservée (localhost standard)', () => {
  const f = fieldInForm('fail2ban', 'f2b_ignoreip');
  assert(f && f.value === '127.0.0.1/8 ::1', `obtenu: ${f?.value}`);
});
test('F2-05: f2b_ssh — toggle, value true', () => {
  const f = fieldInForm('fail2ban', 'f2b_ssh');
  assert(f && f.type === 'toggle' && f.value === true);
});

/* ── F3 — form gpg ────────────────────────────────────────────── */

console.log('\nF3 — form gpg (14 champs)\n');

test('F3-01: 14 champs dans gpg', () => {
  const n = countInForm('gpg');
  assert(n === 14, `attendu 14, obtenu ${n}`);
});
test('F3-02: gpg_action — select, value "genkey"', () => {
  const f = fieldInForm('gpg', 'gpg_action');
  assert(f && f.type === 'select' && f.value === 'genkey');
});
test('F3-03: gpg_passphrase — type password (F-15)', () => {
  const f = fieldInForm('gpg', 'gpg_passphrase');
  assert(f && f.type === 'password', `type obtenu: ${f?.type}`);
});
test('F3-04: gpg_passphrase — sensitive:true (F-15)', () => {
  const f = fieldInForm('gpg', 'gpg_passphrase');
  assert(f && f.sensitive === true);
});
test('F3-05: gpg_recipient — value vide, placeholder neutre (P0)', () => {
  const f = fieldInForm('gpg', 'gpg_recipient');
  assert(f && f.value === '' && f.placeholder === '<fingerprint-ou-email>',
    `value=${f?.value} placeholder=${f?.placeholder}`);
});

/* ── F4 — form secrets ────────────────────────────────────────── */

console.log('\nF4 — form secrets (7 champs)\n');

test('F4-01: 7 champs dans secrets', () => {
  const n = countInForm('secrets');
  assert(n === 7, `attendu 7, obtenu ${n}`);
});
test('F4-02: sec_tool — select, value "sops"', () => {
  const f = fieldInForm('secrets', 'sec_tool');
  assert(f && f.type === 'select' && f.value === 'sops');
});
test('F4-03: sec_backend — select, options inclut age/pgp/local', () => {
  const f = fieldInForm('secrets', 'sec_backend');
  assert(f && f.type === 'select');
  assert(['local','pgp','age'].every(o => f.options.includes(o)));
});
test('F4-04: sec_vars — textarea, value est template clé=vide', () => {
  const f = fieldInForm('secrets', 'sec_vars');
  assert(f && f.type === 'textarea' && f.value.includes('DB_PASSWORD='),
    `value: ${f?.value?.slice(0,40)}`);
});

/* ── F5 — form ssh_hardening ──────────────────────────────────── */

console.log('\nF5 — form ssh_hardening (20 champs)\n');

test('F5-01: 20 champs dans ssh_hardening', () => {
  const n = countInForm('ssh_hardening');
  assert(n === 20, `attendu 20, obtenu ${n}`);
});
test('F5-02: sshh_root — select, value "no"', () => {
  const f = fieldInForm('ssh_hardening', 'sshh_root');
  assert(f && f.type === 'select' && f.value === 'no');
});
test('F5-03: sshh_password — toggle, value false (désactivé)', () => {
  const f = fieldInForm('ssh_hardening', 'sshh_password');
  assert(f && f.type === 'toggle' && f.value === false);
});
test('F5-04: sshh_pubkey — toggle, value true', () => {
  const f = fieldInForm('ssh_hardening', 'sshh_pubkey');
  assert(f && f.type === 'toggle' && f.value === true);
});
test('F5-05: sshh_banner — value vide (P0 — chemin absolu vidé)', () => {
  const f = fieldInForm('ssh_hardening', 'sshh_banner');
  assert(f && f.value === '', `obtenu: ${f?.value}`);
});

/* ── F6 — form scan ───────────────────────────────────────────── */

console.log('\nF6 — form scan (19 champs)\n');

test('F6-01: 19 champs dans scan', () => {
  const n = countInForm('scan');
  assert(n === 19, `attendu 19, obtenu ${n}`);
});
test('F6-02: scan_trivy — toggle, value true', () => {
  const f = fieldInForm('scan', 'scan_trivy');
  assert(f && f.type === 'toggle' && f.value === true);
});
test('F6-03: scan_trivy_severity — select, value "HIGH"', () => {
  const f = fieldInForm('scan', 'scan_trivy_severity');
  assert(f && f.type === 'select' && f.value === 'HIGH');
});
test('F6-04: scan_pwd_len — number, value "12"', () => {
  const f = fieldInForm('scan', 'scan_pwd_len');
  assert(f && f.type === 'number' && f.value === '12');
});
test('F6-05: scan_2fa — toggle, value false', () => {
  const f = fieldInForm('scan', 'scan_2fa');
  assert(f && f.type === 'toggle' && f.value === false);
});

/* ── TOT — total champs ───────────────────────────────────────── */

console.log('\nTOT — Total champs\n');

test('TOT01: 108 champs au total (28+20+14+7+20+19)', () => {
  const n = allFields().length;
  assert(n === 108, `attendu 108, obtenu ${n}`);
});
test('TOT02: tous les champs ont un id string non vide', () => {
  const bad = allFields().filter(f => !f.id || typeof f.id !== 'string');
  assert(bad.length === 0, `${bad.length} champ(s) sans id valide`);
});
test('TOT03: exactement 1 champ sensitive:true (gpg_passphrase)', () => {
  const sens = allFields().filter(f => f.sensitive === true);
  assert(sens.length === 1, `attendu 1, obtenu ${sens.length}`);
  assert(sens[0].id === 'gpg_passphrase', `id: ${sens[0].id}`);
});
test('TOT04: exactement 1 champ type=password (gpg_passphrase)', () => {
  const pwd = allFields().filter(f => f.type === 'password');
  assert(pwd.length === 1, `attendu 1, obtenu ${pwd.length}`);
  assert(pwd[0].id === 'gpg_passphrase');
});

/* ── VAL — validators ─────────────────────────────────────────── */

console.log('\nVAL — validators\n');

test('VAL01: validators est tableau', () =>
  assert(Array.isArray(D.validators)));
test('VAL02: 1 entrée validators', () =>
  assert(D.validators.length === 1, `attendu 1, obtenu ${D.validators.length}`));
test('VAL03: ssl_domain required:true', () => {
  const v = D.validators.find(x => x.field === 'ssl_domain');
  assert(v?.required === true, `entrée: ${JSON.stringify(v)}`);
});

/* ── Résumé ───────────────────────────────────────────────────── */

const w = 58;
console.log(`\n${'═'.repeat(w)}`);
console.log(`  Résultat : ${_p + _f} tests — ${_p} ✓  ${_f > 0 ? _f + ' ✗' : '0 ✗'}`);
if (_f > 0) {
  console.error(`  STATUT : FAILED (${_f} échec(s))\n`);
  process.exit(1);
}
console.log('  STATUT : PASS\n');
