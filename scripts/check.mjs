#!/usr/bin/env node
// Consistency checks for the agent content and its builds.
//   (a) every playbook has the mandatory sections (spec: stack-playbooks)
//   (b) core/ stays client-agnostic: no client-specific tool names or syntax (spec: agent-core-workflow)
//   (c) dist/<client> matches core/ and has not been hand-edited (spec: client-adapters)
//
// Usage: node scripts/check.mjs [--root <dir>] [--dist <dir>] [--require-dist]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { coreSkillFiles } from './build.mjs';
import { MANIFEST_FILE, REPO_ROOT, listClients, listFiles, loadAdapter, parseArgs, readText, sha256 } from './lib.mjs';

export const SUPPORTED_STACKS = [
  'java-spring-boot', 'nodejs', 'python',
  'angular', 'react', 'vue',
  'android-java', 'ios-swift', 'flutter',
];

// Level-2 headings every playbook must contain, in any order.
export const PLAYBOOK_SECTIONS = [
  'Detection',
  'Default toolchain',
  'Test location and naming',
  'Test patterns',
  'Mocking and isolation',
  'Commands',
  'Coverage',
  'Disabling a test',
  'Common pitfalls',
];

// Names and syntax that belong to one AI client. core/ must describe actions generically instead.
export const FORBIDDEN_IN_CORE = [
  /\bClaude Code\b/, /\bClaude\b/, /\bKiro\b/, /\bCodex\b/, /\bCursor\b/, /\bCopilot\b/,
  /\bCLAUDE\.md\b/, /\bAGENTS\.md\b/, /\.kiro\//, /\.claude\//, /\.codex\//,
  /\$ARGUMENTS\b/, /\bTodoWrite\b/, /\bAskUserQuestion\b/, /\bapply_patch\b/,
  /\b(Bash|Read|Write|Edit|Glob|Grep|Task|Agent|WebFetch)\s+tool\b/,
  /\b(fsWrite|fsRead|readFile|executeBash|strReplace)\b/,
];

export function checkPlaybooks(root) {
  const errors = [];
  const dir = join(root, 'core', 'playbooks');
  const present = listFiles(dir).filter((f) => f.endsWith('.md'));
  for (const file of present) {
    const headings = new Set(
      readText(join(dir, file)).split('\n')
        .filter((l) => l.startsWith('## '))
        .map((l) => l.slice(3).trim()),
    );
    const missing = PLAYBOOK_SECTIONS.filter((s) => !headings.has(s));
    if (missing.length) errors.push(`core/playbooks/${file}: missing sections: ${missing.join(', ')}`);
  }
  const missingStacks = SUPPORTED_STACKS.filter((s) => !present.includes(`${s}.md`));
  return { errors, missingStacks };
}

export function checkCoreIsClientAgnostic(root) {
  const errors = [];
  const coreDir = join(root, 'core');
  for (const rel of listFiles(coreDir).filter((f) => f.endsWith('.md'))) {
    const lines = readText(join(coreDir, rel)).split('\n');
    lines.forEach((line, i) => {
      for (const pattern of FORBIDDEN_IN_CORE) {
        const m = pattern.exec(line);
        if (m) errors.push(`core/${rel}:${i + 1}: client-specific term "${m[0]}"`);
      }
    });
  }
  return { errors };
}

export function checkDist(root, distRoot = join(root, 'dist'), { requireDist = false } = {}) {
  const errors = [];
  const notes = [];
  for (const client of listClients(root)) {
    const outDir = join(distRoot, client);
    const manifestFile = join(outDir, MANIFEST_FILE);
    if (!existsSync(manifestFile)) {
      (requireDist ? errors : notes).push(`adapter ${client}: not built (run: node scripts/build.mjs --client ${client})`);
      continue;
    }
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
    const expected = coreSkillFiles(root, loadAdapter(root, client));
    const expectedPaths = new Set(Object.keys(expected).map((rel) => `${manifest.skillPath}/${rel}`));

    for (const [rel, content] of Object.entries(expected)) {
      const target = `${manifest.skillPath}/${rel}`;
      const file = join(outDir, target);
      if (!existsSync(file)) errors.push(`adapter ${client}: out of date, missing ${target}`);
      else if (sha256(readText(file)) !== sha256(content)) {
        errors.push(`adapter ${client}: ${target} differs from core (rebuild, or move the edit into core/)`);
      }
    }
    for (const target of Object.keys(manifest.files)) {
      if (!expectedPaths.has(target)) errors.push(`adapter ${client}: ${target} no longer exists in core (rebuild)`);
    }
  }
  return { errors, notes };
}

export function runChecks({ root = REPO_ROOT, distRoot, requireDist = false } = {}) {
  const playbooks = checkPlaybooks(root);
  const agnostic = checkCoreIsClientAgnostic(root);
  const dist = checkDist(root, distRoot ?? join(root, 'dist'), { requireDist });
  const notes = [...dist.notes];
  if (playbooks.missingStacks.length) notes.push(`playbooks not written yet: ${playbooks.missingStacks.join(', ')}`);
  return { errors: [...playbooks.errors, ...agnostic.errors, ...dist.errors], notes };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const { errors, notes } = runChecks({
    root: args.root ? resolve(args.root) : REPO_ROOT,
    distRoot: args.dist ? resolve(args.dist) : undefined,
    requireDist: Boolean(args['require-dist']),
  });
  for (const n of notes) console.log(`note: ${n}`);
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length) {
    console.error(`check failed: ${errors.length} error(s)`);
    process.exit(1);
  }
  console.log('check passed');
}
