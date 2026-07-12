import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const out = resolve('apps/playground/public/build-info.js');

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'dev';
  }
}

const commit = gitCommit();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  `globalThis.__TSAI_PE_PLAYGROUND_COMMIT__ = ${JSON.stringify(commit)};\n`,
);
console.log(`Wrote ${out} (${commit})`);
