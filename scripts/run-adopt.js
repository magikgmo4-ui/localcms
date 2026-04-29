#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const TESTS = [
  'tests/apps-config-adopt.test.js',
  'tests/data-sources-adopt.test.js',
  'tests/devtools-config-adopt.test.js',
  'tests/env-global-adopt.test.js',
  'tests/ia-config-adopt.test.js',
  'tests/machines-config-adopt.test.js',
  'tests/memory-view-adopt.test.js',
  'tests/queue-config-adopt.test.js',
  'tests/sec-config-adopt.test.js',
];

const W = 62;
let passed = 0, failed = 0;

for (const file of TESTS) {
  process.stdout.write(`\n${'─'.repeat(W)}\n▶  ${file}\n${'─'.repeat(W)}\n`);
  const r = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (r.status === 0) passed++;
  else                failed++;
}

process.stdout.write(`\n${'═'.repeat(W)}\n`);
process.stdout.write(`  ADOPT RUNNER — ${TESTS.length} suites : ${passed} PASS  ${failed} FAIL\n`);
process.stdout.write(`${'═'.repeat(W)}\n`);
process.exit(failed > 0 ? 1 : 0);
