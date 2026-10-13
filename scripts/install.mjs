#!/usr/bin/env node
// Install or uninstall a built adapter (dist/<client>) into a project or the user's home.
//
// Usage:
//   node scripts/install.mjs --client <name> --target <project|user> [--path <dir>] [--uninstall] [--dist <dir>]
//
// --target project  installs into --path (default: current directory)
// --target user     installs into --path (default: the user's home directory)
// What gets copied, and where, is declared by adapters/<client>/adapter.json -> "install".
import { existsSync, readFileSync, readdirSync, rmSync, rmdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO_ROOT, copyDir, listFiles, loadAdapter, parseArgs } from './lib.mjs';

/** Resolve the list of { from, to } copies for a client and target. */
export function plan({ root = REPO_ROOT, client, target, path, distRoot }) {
  const adapter = loadAdapter(root, client);
  const mapping = adapter.install?.[target];
  if (!mapping) {
    throw new Error(`adapter ${client} does not support --target ${target} (see adapters/${client}/INSTALL.md)`);
  }
  const srcRoot = join(distRoot ?? join(root, 'dist'), client);
  if (!existsSync(srcRoot)) throw new Error(`dist/${client} not found, run: node scripts/build.mjs --client ${client}`);
  const destRoot = resolve(path ?? (target === 'user' ? homedir() : process.cwd()));
  return mapping.map(({ from, to }) => ({ from: join(srcRoot, from), to: join(destRoot, to) }));
}

export function install(opts) {
  const steps = plan(opts);
  for (const { from, to } of steps) {
    if (!existsSync(from)) throw new Error(`nothing to install at ${from}`);
    if (existsSync(to)) rmSync(to, { recursive: true, force: true });
    copyDir(from, to);
  }
  return steps;
}

export function uninstall(opts) {
  const steps = plan(opts);
  for (const { to } of steps) {
    rmSync(to, { recursive: true, force: true });
    removeEmptyParents(dirname(to), resolve(opts.path ?? (opts.target === 'user' ? homedir() : process.cwd())));
  }
  return steps;
}

// Remove directories the install created (e.g. .claude/agents) once they are empty, never above stopAt.
function removeEmptyParents(dir, stopAt) {
  let current = dir;
  while (current.startsWith(stopAt) && current !== stopAt && existsSync(current) && readdirSync(current).length === 0) {
    rmdirSync(current);
    current = dirname(current);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const opts = {
    client: args.client,
    target: args.target ?? 'project',
    path: typeof args.path === 'string' ? args.path : undefined,
    distRoot: typeof args.dist === 'string' ? resolve(args.dist) : undefined,
  };
  if (typeof opts.client !== 'string' || !['project', 'user'].includes(opts.target)) {
    console.error('usage: node scripts/install.mjs --client <name> --target <project|user> [--path <dir>] [--uninstall]');
    process.exit(2);
  }
  try {
    const steps = args.uninstall ? uninstall(opts) : install(opts);
    const verb = args.uninstall ? 'removed' : 'installed';
    for (const s of steps) console.log(`${verb}: ${s.to}`);
    if (!args.uninstall) {
      const count = steps.reduce((n, s) => n + listFiles(s.to).length, 0);
      console.log(`${count} file(s) installed for ${opts.client} (${opts.target})`);
    }
  } catch (err) {
    console.error(`install failed: ${err.message}`);
    process.exit(1);
  }
}
