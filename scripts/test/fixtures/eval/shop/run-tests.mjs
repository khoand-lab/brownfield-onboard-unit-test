// Minimal test runner for the eval fixture: prints PASS/FAIL lines, exits 1 on any failure.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.test.mjs')) files.push(full);
  }
};
walk('test');
let failed = 0;
for (const file of files.sort()) {
  const { default: tests } = await import(pathToFileURL(join(process.cwd(), file)).href);
  for (const t of tests) {
    let ok = false;
    try { ok = await t.fn(); } catch { ok = false; }
    console.log(`${ok ? 'PASS' : 'FAIL'} ${t.name}`);
    if (!ok) failed++;
  }
}
process.exitCode = failed ? 1 : 0;
