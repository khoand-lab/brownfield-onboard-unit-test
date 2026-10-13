#!/usr/bin/env node
// Build dist/<client>/ from core/ (the single source of agent content) and adapters/<client>/ (client wrapper).
//
// Usage: node scripts/build.mjs [--client <name>] [--root <dir>] [--out <dir>]
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CORE_RESOURCES, MANIFEST_FILE, REPO_ROOT, SKILL_NAME,
  copyDir, listClients, listFiles, loadAdapter, parseArgs, parseFrontmatter,
  readText, renderFrontmatter, sha256, writeText,
} from './lib.mjs';

/**
 * Compute the skill files derived from core/, as { relativePath: content }.
 * Used by build (to write them) and by check (to detect drift).
 */
export function coreSkillFiles(root, adapter = {}) {
  const coreDir = join(root, 'core');
  const agentFile = join(coreDir, 'AGENT.md');
  if (!existsSync(agentFile)) throw new Error(`Missing ${agentFile}`);

  const { data, body } = parseFrontmatter(readText(agentFile));
  const frontmatter = { ...data, ...(adapter.skillFrontmatter ?? {}) };
  const files = { 'SKILL.md': renderFrontmatter(frontmatter) + body };

  for (const resource of CORE_RESOURCES) {
    for (const rel of listFiles(join(coreDir, resource), coreDir)) {
      files[rel] = readText(join(coreDir, rel));
    }
  }
  return files;
}

function templateVars(root, adapter, skillFrontmatter) {
  const pkgFile = join(root, 'package.json');
  const version = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, 'utf8')).version ?? '0.0.0' : '0.0.0';
  return {
    SKILL_NAME,
    SKILL_PATH: adapter.skillPath,
    SKILL_DESCRIPTION: skillFrontmatter.description ?? '',
    VERSION: version,
  };
}

function applyTemplate(text, vars) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
}

export function buildClient(root, client, outRoot = join(root, 'dist')) {
  const adapter = loadAdapter(root, client);
  if (!adapter.skillPath) throw new Error(`adapters/${client}/adapter.json must define "skillPath"`);

  const outDir = join(outRoot, client);
  rmSync(outDir, { recursive: true, force: true });

  // 1. Skill derived from core/.
  const skillFiles = coreSkillFiles(root, adapter);
  const manifest = { client, skillPath: adapter.skillPath, files: {} };
  for (const [rel, content] of Object.entries(skillFiles)) {
    const target = `${adapter.skillPath}/${rel}`;
    writeText(join(outDir, target), content);
    manifest.files[target] = sha256(content);
  }

  // 2. Client wrapper files, with {{VAR}} placeholders filled in.
  const { data: fm } = parseFrontmatter(skillFiles['SKILL.md']);
  const vars = templateVars(root, adapter, fm);
  const wrapperDir = join(root, 'adapters', client, 'files');
  for (const rel of listFiles(wrapperDir)) {
    const content = applyTemplate(readText(join(wrapperDir, rel)), vars);
    writeText(join(outDir, rel), content);
  }

  // 3. Install docs travel with the build so dist/<client> is self-contained.
  const installDoc = join(root, 'adapters', client, 'INSTALL.md');
  if (existsSync(installDoc)) copyDir(installDoc, join(outDir, 'INSTALL.md'));

  writeText(join(outDir, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + '\n');
  return { client, outDir, files: Object.keys(manifest.files).length };
}

export function build({ root = REPO_ROOT, clients, outRoot } = {}) {
  const targets = clients?.length ? clients : listClients(root);
  if (!targets.length) throw new Error('No adapters found under adapters/');
  return targets.map((c) => buildClient(root, c, outRoot ?? join(root, 'dist')));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  try {
    const results = build({
      root: args.root ? resolve(args.root) : REPO_ROOT,
      clients: typeof args.client === 'string' ? [args.client] : undefined,
      outRoot: args.out ? resolve(args.out) : undefined,
    });
    for (const r of results) console.log(`built ${r.client}: ${r.files} skill files -> ${r.outDir}`);
  } catch (err) {
    console.error(`build failed: ${err.message}`);
    process.exit(1);
  }
}
