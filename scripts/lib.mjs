// Shared helpers for build, check and install. Node >= 18, no dependencies.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SKILL_NAME = 'brownfield-unit-test';

// Paths under core/ that are shipped inside the skill, besides AGENT.md -> SKILL.md.
export const CORE_RESOURCES = ['phases', 'playbooks', 'templates', 'detection.md'];

export const MANIFEST_FILE = '.build-manifest.json';

/** Recursively list files under dir, returned as posix paths relative to base. */
export function listFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  if (statSync(dir).isFile()) return [toPosix(relative(base, dir))];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(toPosix(relative(base, full)));
  }
  return out.sort();
}

export function toPosix(p) {
  return p.split(sep).join('/');
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

/** Normalise line endings so hashes match across Windows and Unix checkouts. */
export function readText(file) {
  return readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

export function writeText(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
}

export function copyDir(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

/** Split a Markdown file into its `---` frontmatter (flat key: value) and body. */
export function parseFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = unquote(kv[2].trim());
  }
  return { data, body: text.slice(match[0].length) };
}

export function renderFrontmatter(data) {
  const lines = Object.entries(data).map(([k, v]) => `${k}: ${quoteIfNeeded(String(v))}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function unquote(v) {
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function quoteIfNeeded(v) {
  return /[:#"'{}\[\],&*!|>%@`]/.test(v) ? JSON.stringify(v) : v;
}

export function loadAdapter(root, client) {
  const file = join(root, 'adapters', client, 'adapter.json');
  if (!existsSync(file)) throw new Error(`Adapter "${client}" not found: ${file}`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Adapter directories that contain an adapter.json (directories starting with "_" are ignored). */
export function listClients(root) {
  const dir = join(root, 'adapters');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && existsSync(join(dir, e.name, 'adapter.json')))
    .map((e) => e.name)
    .sort();
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}
