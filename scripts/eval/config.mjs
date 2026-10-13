// Load and validate eval.config.json (clients + stacks), and build the run matrix.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const MODES = ['confirm', 'auto'];
export const TRANSCRIPT_FORMATS = ['claude-stream-json', 'codex-jsonl', 'text'];
export const APPROVE_MESSAGE = 'đồng ý kế hoạch, làm tiếp';

// Files that count as build/dependency configuration rather than production code.
export const DEFAULT_MANIFESTS = [
  'pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle', 'gradle.properties',
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'pyproject.toml', 'requirements.txt', 'requirements-dev.txt', 'setup.py', 'setup.cfg', 'poetry.lock',
  'pubspec.yaml', 'Package.swift', 'angular.json', 'karma.conf.js',
  'vite.config.ts', 'vite.config.js', 'vitest.config.ts', 'jest.config.js', 'tsconfig.json',
];

export class EvalConfigError extends Error {}

export function loadConfig(file) {
  const path = resolve(file);
  if (!existsSync(path)) throw new EvalConfigError(`config not found: ${path}`);
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new EvalConfigError(`config is not valid JSON (${path}): ${err.message}`);
  }
  const errors = validateConfig(raw);
  if (errors.length) throw new EvalConfigError(`invalid config ${path}:\n- ${errors.join('\n- ')}`);
  const dir = dirname(path);
  return {
    file: path,
    examplesDir: resolve(dir, raw.examplesDir ?? 'examples'),
    clients: raw.clients,
    stacks: raw.stacks,
  };
}

const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** deps.install is one command (["npm","ci"]) or several ([["python","-m","venv",".venv"], [...]]); returns the list or null. */
export function installCommands(install) {
  if (isStringArray(install) && install.length) return [install];
  if (Array.isArray(install) && install.length && install.every((c) => isStringArray(c) && c.length)) return install;
  return null;
}

export function validateConfig(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') return ['config must be an object'];
  if (!raw.clients || typeof raw.clients !== 'object' || !Object.keys(raw.clients).length) errors.push('"clients" must be a non-empty object');
  if (!raw.stacks || typeof raw.stacks !== 'object' || !Object.keys(raw.stacks).length) errors.push('"stacks" must be a non-empty object');

  for (const [id, c] of Object.entries(raw.clients ?? {})) {
    const at = `clients.${id}`;
    if (typeof c.executable !== 'string') errors.push(`${at}.executable must be a string`);
    if (typeof c.adapter !== 'string') errors.push(`${at}.adapter must be a string`);
    for (const t of ['auto', 'confirmPlan', 'confirmApprove']) {
      if (!isStringArray(c.turns?.[t])) errors.push(`${at}.turns.${t} must be an array of strings`);
    }
    if (!TRANSCRIPT_FORMATS.includes(c.transcriptFormat)) errors.push(`${at}.transcriptFormat must be one of ${TRANSCRIPT_FORMATS.join(', ')}`);
    if (c.promptVia !== undefined && !['arg', 'stdin'].includes(c.promptVia)) errors.push(`${at}.promptVia must be "arg" or "stdin"`);
    if (c.sessionId !== undefined) {
      const ok = c.sessionId.generate === 'uuid' || typeof c.sessionId.fromOutput === 'string';
      if (!ok) errors.push(`${at}.sessionId must be {"generate":"uuid"} or {"fromOutput":"<regex>"}`);
    }
    if (c.versionArgs !== undefined && !isStringArray(c.versionArgs)) errors.push(`${at}.versionArgs must be an array of strings`);
    if (c.timeoutMinutes !== undefined && !(c.timeoutMinutes > 0)) errors.push(`${at}.timeoutMinutes must be a positive number`);
    if (c.env !== undefined && (typeof c.env !== 'object' || Object.values(c.env).some((v) => typeof v !== 'string'))) {
      errors.push(`${at}.env must be an object of strings`);
    }
  }

  for (const [id, s] of Object.entries(raw.stacks ?? {})) {
    const at = `stacks.${id}`;
    for (const k of ['example', 'scope', 'failurePattern']) {
      if (typeof s[k] !== 'string') errors.push(`${at}.${k} must be a string`);
    }
    for (const k of ['testCommand', 'prodPaths', 'testPaths', 'buildDirs']) {
      if (!isStringArray(s[k])) errors.push(`${at}.${k} must be an array of strings`);
    }
    if (!Array.isArray(s.expectedFailures) || !s.expectedFailures.every((f) => typeof f?.name === 'string' && typeof f?.file === 'string')) {
      errors.push(`${at}.expectedFailures must be an array of {"file","name"}`);
    }
    for (const k of ['badMarkers', 'manifests']) {
      if (s[k] !== undefined && !isStringArray(s[k])) errors.push(`${at}.${k} must be an array of strings`);
    }
    if (s.requires !== undefined && !(Array.isArray(s.requires) && s.requires.every(isStringArray))) {
      errors.push(`${at}.requires must be an array of commands, e.g. [["mvn","-v"]]`);
    }
    if (s.hardUnits !== undefined && !(Array.isArray(s.hardUnits) && s.hardUnits.every((u) => typeof u?.file === 'string' && typeof u?.name === 'string'))) {
      errors.push(`${at}.hardUnits must be an array of {"file","name"}`);
    }
    if (s.deps !== undefined && (typeof s.deps.dir !== 'string' || (s.deps.install !== undefined && !installCommands(s.deps.install)))) {
      errors.push(`${at}.deps must be {"dir": string, "install"?: string[] | string[][]}`);
    }
    if (typeof s.failurePattern === 'string') {
      try {
        new RegExp(s.failurePattern, 'gm');
      } catch (err) {
        errors.push(`${at}.failurePattern is not a valid regex: ${err.message}`);
      }
    }
  }
  return errors;
}

/** Split "a,b" / ["a","b"] into a list. */
export function listArg(v) {
  if (v === undefined || v === true) return [];
  return (Array.isArray(v) ? v : String(v).split(',')).map((x) => x.trim()).filter(Boolean);
}

/** Expand the requested clients x stacks x modes into runs; unknown values throw with the valid list. */
export function selectRuns(cfg, { clients, stacks, mode = 'both' }) {
  const modes = mode === 'both' ? MODES : [mode];
  if (!modes.every((m) => MODES.includes(m))) {
    throw new EvalConfigError(`unknown mode "${mode}". Valid: confirm, auto, both`);
  }
  const pick = (kind, wanted, available) => {
    if (!wanted.length) throw new EvalConfigError(`--${kind} is required. Valid: ${available.join(', ')}`);
    const unknown = wanted.filter((w) => !available.includes(w));
    if (unknown.length) throw new EvalConfigError(`unknown ${kind} ${unknown.join(', ')}. Valid: ${available.join(', ')}`);
    return wanted;
  };
  const cs = pick('client', clients, Object.keys(cfg.clients));
  const ss = pick('stack', stacks, Object.keys(cfg.stacks));
  const runs = [];
  for (const client of cs) for (const stack of ss) for (const m of modes) runs.push({ client, stack, mode: m });
  return runs;
}

/** Replace {name} placeholders; unknown placeholders are left untouched. */
export function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (all, k) => (vars[k] !== undefined ? String(vars[k]) : all));
}

/** Expand %VAR% (Windows style) and ${VAR}/$VAR (POSIX style) from the environment. */
export function expandEnv(value, env = process.env) {
  return value
    .replace(/%([A-Za-z_][A-Za-z0-9_]*)%/g, (all, k) => env[k] ?? all)
    .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (all, a, b) => env[a ?? b] ?? all);
}

/** The prompt sent for a turn: `<prefix>scope=<scope>[ mode=auto]`, or the approval message. */
export function promptFor(client, stack, turn) {
  if (turn === 'confirmApprove') return APPROVE_MESSAGE;
  const mode = turn === 'auto' ? ' mode=auto' : '';
  return `${client.promptPrefix ?? ''}scope=${stack.scope}${mode}`;
}
