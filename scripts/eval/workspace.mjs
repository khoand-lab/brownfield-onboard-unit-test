// Isolated copies of example projects, adapter install, and file snapshots / comparisons.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { install } from '../install.mjs';
import { loadAdapter, sha256, toPosix } from '../lib.mjs';
import { DEFAULT_MANIFESTS, installCommands } from './config.mjs';
import { runCommand } from './runner.mjs';

export function defaultRunDir(runId) {
  return join(tmpdir(), 'brownfield-eval', runId);
}

/** Top-level directories an adapter installs into a project (e.g. ".claude"), ignored by snapshots. */
export function adapterDirs(root, adapterName) {
  const adapter = loadAdapter(root, adapterName);
  return [...new Set((adapter.install?.project ?? []).map((m) => m.to.split('/')[0]))];
}

/** Turn a glob (**, *, ?) into an anchored regex over posix relative paths. */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        re += '(?:.*/)?';
        i += 2;
      } else {
        re += '.*';
        i += 1;
      }
    } else if (ch === '*') re += '[^/]*';
    else if (ch === '?') re += '[^/]';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

export const matchesAny = (path, globs = []) => globs.some((g) => globToRegExp(g).test(path));

/** Copy an example without build output and dependency folders. */
export function copyExample(src, dest, { buildDirs = [], depsDir } = {}) {
  cpSync(src, dest, {
    recursive: true,
    filter: (from) => {
      const rel = toPosix(relative(src, from));
      if (!rel) return true;
      if (depsDir && rel === depsDir) return false;
      return !buildDirs.includes(basename(from));
    },
  });
}

/**
 * Snapshot a directory: sha256 per file, text of files matching textGlobs, and which build dirs exist.
 * Ignored top-level entries (adapter dirs, dependency dirs) are skipped entirely; build dirs are
 * recorded but not descended into.
 */
export function snapshot(dir, { ignore = [], buildDirs = [], textGlobs = [] } = {}) {
  const files = {};
  const texts = {};
  const builds = [];
  const walk = (abs) => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const full = join(abs, entry.name);
      const rel = toPosix(relative(dir, full));
      if (ignore.includes(rel)) continue;
      if (entry.isDirectory()) {
        if (buildDirs.includes(entry.name)) builds.push(rel);
        else walk(full);
      } else {
        const content = readFileSync(full);
        files[rel] = sha256(content);
        if (matchesAny(rel, textGlobs)) texts[rel] = content.toString('utf8');
      }
    }
  };
  walk(dir);
  return { files, texts, buildDirs: builds.sort() };
}

export function classify(path, stack) {
  if (matchesAny(path, stack.testPaths)) return 'test';
  if ((stack.manifests ?? DEFAULT_MANIFESTS).includes(basename(path))) return 'config';
  if (matchesAny(path, stack.prodPaths)) return 'production';
  return 'other';
}

/** Lines of the old text that are missing (or appear fewer times) in the new text; blank lines ignored. */
export function removedLines(oldText, newText) {
  const norm = (t) => t.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
  const counts = new Map();
  for (const l of norm(newText)) counts.set(l, (counts.get(l) ?? 0) + 1);
  const removed = [];
  for (const l of norm(oldText)) {
    const n = counts.get(l) ?? 0;
    if (n > 0) counts.set(l, n - 1);
    else removed.push(l);
  }
  return removed;
}

/** Compare two snapshots: classified changes, build dirs that appeared, and removed lines in pre-existing tests. */
export function compareSnapshots(before, after, stack, { afterTexts } = {}) {
  const changes = [];
  for (const [path, hash] of Object.entries(after.files)) {
    if (!(path in before.files)) changes.push({ path, change: 'added', kind: classify(path, stack) });
    else if (before.files[path] !== hash) changes.push({ path, change: 'modified', kind: classify(path, stack) });
  }
  for (const path of Object.keys(before.files)) {
    if (!(path in after.files)) changes.push({ path, change: 'removed', kind: classify(path, stack) });
  }
  changes.sort((a, b) => a.path.localeCompare(b.path));
  const newBuildDirs = after.buildDirs.filter((d) => !before.buildDirs.includes(d));
  const testDiffs = {};
  const texts = afterTexts ?? after.texts ?? {};
  for (const c of changes) {
    if (c.kind !== 'test' || c.change === 'added') continue;
    const removed = c.change === 'removed' ? ['(file removed)'] : removedLines(before.texts?.[c.path] ?? '', texts[c.path] ?? '');
    testDiffs[c.path] = { removed };
  }
  return { changes, newBuildDirs, testDiffs };
}

/** Create the isolated copy for one run, install the adapter and take the "before" snapshot. */
export async function prepareWorkspace({ root, cfg, run, runDir }) {
  const client = cfg.clients[run.client];
  const stack = cfg.stacks[run.stack];
  const src = join(cfg.examplesDir, stack.example);
  if (!existsSync(src)) throw new Error(`example not found: ${src}`);
  const name = `${run.client}-${run.stack}-${run.mode}`;
  const workdir = join(runDir, name);
  const metaDir = join(runDir, `${name}.meta`);
  if (existsSync(workdir)) throw new Error(`workdir already exists: ${workdir}`);
  mkdirSync(metaDir, { recursive: true });

  const depsDir = stack.deps?.dir;
  copyExample(src, workdir, { buildDirs: stack.buildDirs, depsDir });
  if (depsDir && existsSync(join(src, depsDir))) {
    cpSync(join(src, depsDir), join(workdir, depsDir), { recursive: true });
  } else if (depsDir && stack.deps.install) {
    for (const [i, [executable, ...args]] of installCommands(stack.deps.install).entries()) {
      const res = await runCommand({ executable, args, cwd: workdir, logFile: join(metaDir, `deps${i + 1}.log`), timeoutMs: 15 * 60_000 });
      if (res.exitCode !== 0) throw new Error(`dependency install failed (${res.command}): ${res.error ?? `exit ${res.exitCode}`}`);
    }
  }
  install({ root, client: client.adapter, target: 'project', path: workdir });

  const ignore = [...adapterDirs(root, client.adapter), ...(depsDir ? [depsDir] : [])];
  const snapOpts = { ignore, buildDirs: stack.buildDirs, textGlobs: stack.testPaths };
  const before = snapshot(workdir, snapOpts);
  writeFileSync(join(metaDir, 'before.json'), JSON.stringify({ run, snapOpts, before }, null, 2));
  return { workdir, metaDir, snapOpts, before };
}
