#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  }).trim();
}

function runJson(command, args) {
  const output = run(command, args);
  return output ? JSON.parse(output) : null;
}

async function main() {
  const diagnostics = runJson('node', ['--env-file=.env', 'scripts/appwrite-artifact-diagnostics.mjs']);
  const retryIds = diagnostics?.report?.retryArtifactIds || [];

  if (retryIds.length === 0) {
    process.stdout.write(
      `${JSON.stringify({ ok: true, retried: false, message: 'No failed artifacts to retry.' }, null, 2)}\n`,
    );
    return;
  }

  const retryResult = runJson('node', [
    '--env-file=.env',
    'scripts/migrate-pocketbase-to-appwrite.mjs',
    '--apply',
    '--collections=artifacts',
    `--ids=${retryIds.join(',')}`,
  ]);

  process.stdout.write(`${JSON.stringify({ ok: true, retryIds, retryResult }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
