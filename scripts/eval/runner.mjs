// Run a client CLI (or any command) without a shell: Windows .cmd shims, timeouts, process-tree kill, logs.
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { expandEnv, fill, promptFor } from './config.mjs';

const IS_WIN = process.platform === 'win32';

/** Find an executable: absolute/relative paths are used as is (after env expansion), bare names are searched in PATH. */
export function resolveExecutable(name, env = process.env, cwd = process.cwd()) {
  const value = expandEnv(name, env);
  if (isAbsolute(value)) return existsSync(value) ? value : null;
  if (value.includes('/') || value.includes('\\')) {
    const full = resolve(cwd, value); // e.g. .venv/Scripts/python.exe inside the workdir
    return existsSync(full) ? full : null;
  }
  const exts = IS_WIN ? ['', ...(env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';').map((e) => e.toLowerCase())] : [''];
  for (const dir of (env.PATH ?? env.Path ?? '').split(delimiter).filter(Boolean)) {
    for (const ext of exts) {
      const candidate = join(dir, value + ext);
      if (existsSync(candidate) && (ext || !IS_WIN || extname(candidate))) return candidate;
    }
  }
  return null;
}

/** Human-readable command line for logs and reports (not used to execute anything). */
export function displayCommand(executable, args) {
  return [executable, ...args].map((a) => (a === '' || /[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
}

const CMD_META = /([()\][%!^"`<>&|;, *?])/g;

/**
 * Quote one argument for `cmd.exe /d /s /c "<line>"`.
 * First the MSVCRT rules (backslashes before quotes are doubled), then cmd metacharacters get a caret.
 * `.cmd` shims re-expand %* once more, so their arguments are escaped twice (same as cross-spawn).
 */
export function quoteCmdArg(arg, { doubleEscape = false } = {}) {
  let quoted = `"${String(arg).replace(/(\\*)"/g, '$1$1\\"').replace(/(\\*)$/, '$1$1')}"`;
  quoted = quoted.replace(CMD_META, '^$1');
  if (doubleEscape) quoted = quoted.replace(CMD_META, '^$1');
  return quoted;
}

/** An npm cmd-shim (e.g. claude.cmd, codex.cmd, npx.cmd) forwards %* to node; detect it from the file content. */
export function isNpmShim(file) {
  try {
    const text = readFileSync(file, 'utf8');
    return /%\*/.test(text) && /node_modules|node\.exe|%_prog%|npm-cli\.js|npx-cli\.js/i.test(text);
  } catch {
    return true;
  }
}

/** How to spawn `file args` without a shell: .cmd/.bat files go through cmd.exe with explicit quoting. */
export function spawnPlan(file, args) {
  if (IS_WIN && /\.(cmd|bat)$/i.test(file)) {
    // The command itself is only caret-escaped (a quoted command breaks cmd's /s parsing when the path has spaces).
    // npm-style shims pass %* into another command line, so their arguments need a second round of escaping;
    // ordinary batch files (mvn.cmd, gradlew.bat) must get exactly one.
    const doubleEscape = isNpmShim(file);
    const line = [file.replace(CMD_META, '^$1'), ...args.map((a) => quoteCmdArg(a, { doubleEscape }))].join(' ');
    return { command: process.env.ComSpec ?? 'cmd.exe', args: ['/d', '/s', '/c', `"${line}"`], windowsVerbatimArguments: true };
  }
  return { command: file, args, windowsVerbatimArguments: false };
}

export function killTree(child) {
  if (!child.pid) return;
  if (IS_WIN) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  else {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
  }
}

/**
 * Run a command and collect its output.
 * A process that survives the command (e.g. a Gradle daemon) can inherit its pipes, so 'close' may never come:
 * once the command itself has exited, wait at most `exitGraceMs` for the pipes, then stop reading.
 * @returns {Promise<{exitCode:number|null, timedOut:boolean, durationMs:number, command:string, stdout:string, stderr:string, error?:string}>}
 */
export function runCommand({ executable, args = [], cwd, env, input, timeoutMs = 30 * 60_000, exitGraceMs = 5_000, logFile }) {
  const started = Date.now();
  const display = displayCommand(executable, args);
  const fullEnv = { ...process.env, ...(env ?? {}) };
  const file = resolveExecutable(executable, fullEnv, cwd);
  if (!file) {
    return Promise.resolve({ exitCode: null, timedOut: false, durationMs: 0, command: display, stdout: '', stderr: '', error: `executable not found: ${executable}` });
  }
  const plan = spawnPlan(file, args);
  return new Promise((resolvePromise) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const child = spawn(plan.command, plan.args, {
      cwd,
      env: fullEnv,
      shell: false,
      detached: !IS_WIN,
      windowsHide: true,
      windowsVerbatimArguments: plan.windowsVerbatimArguments,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    child.stdout.setEncoding('utf8').on('data', (d) => { stdout += d; });
    child.stderr.setEncoding('utf8').on('data', (d) => { stderr += d; });
    child.stdin.on('error', () => {});
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeoutMs);
    let done = false;
    let grace;
    const finish = (exitCode, error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(grace);
      if (logFile) {
        mkdirSync(dirname(logFile), { recursive: true });
        writeFileSync(logFile, stdout);
        if (stderr) writeFileSync(logFile.replace(/\.log$/, '') + '.err.log', stderr);
      }
      resolvePromise({ exitCode, timedOut, durationMs: Date.now() - started, command: display, stdout, stderr, ...(error ? { error } : {}) });
    };
    child.on('error', (err) => finish(null, err.message));
    child.on('exit', (code) => {
      grace = setTimeout(() => {
        child.stdout.destroy();
        child.stderr.destroy();
        finish(code);
      }, exitGraceMs);
    });
    child.on('close', (code) => finish(code));
  });
}

const tail = (s, n = 400) => (s.length > n ? `…${s.slice(-n)}` : s).trim();

/** The most useful failure message: the last JSON error event (Codex/Claude streams), else the tail of stderr/stdout. */
export function failureDetail(stdout, stderr) {
  let message;
  for (const line of `${stdout}\n${stderr}`.split(/\r?\n/)) {
    if (!line.trim().startsWith('{')) continue;
    try {
      const ev = JSON.parse(line);
      const text = ev.type === 'error' ? ev.message : ev.type === 'turn.failed' ? ev.error?.message : ev.is_error ? ev.result : undefined;
      if (typeof text === 'string' && text) message = text;
    } catch {
      // not JSON
    }
  }
  return message ?? tail(stderr || stdout);
}

/** Check the client CLI and the stack toolchain before preparing anything. Returns a reason string or null. */
export async function checkRequirements(client, stack) {
  if (!resolveExecutable(client.executable, { ...process.env, ...(client.env ?? {}) })) {
    return `thiếu CLI của client: ${client.executable}`;
  }
  for (const [executable, ...args] of stack.requires ?? []) {
    const res = await runCommand({ executable, args, timeoutMs: 120_000 });
    if (res.error || res.exitCode !== 0) return `thiếu toolchain: ${[executable, ...args].join(' ')} (${res.error ?? `exit ${res.exitCode}`})`;
  }
  return null;
}

export async function clientVersion(client) {
  if (!client.versionArgs) return 'không rõ';
  const res = await runCommand({ executable: client.executable, args: client.versionArgs, env: client.env, timeoutMs: 60_000 });
  return (res.stdout || res.stderr).trim().split('\n')[0] || 'không rõ';
}

/**
 * Run the agent for one run: one turn for mode=auto, or plan + approval on the same session for
 * mode=confirm, calling onBetweenTurns() after the plan turn (used for the "mid" snapshot).
 * Never throws for client failures: returns { status: 'not-run', reason } instead.
 */
export async function runTurns({ client, stack, mode, workdir, metaDir, onBetweenTurns }) {
  const timeoutMs = (client.timeoutMinutes ?? 30) * 60_000;
  const names = mode === 'auto' ? ['auto'] : ['confirmPlan', 'confirmApprove'];
  let sessionId = client.sessionId?.generate === 'uuid' ? randomUUID() : undefined;
  const turns = [];
  for (const [i, name] of names.entries()) {
    const prompt = promptFor(client, stack, name);
    const viaStdin = client.promptVia === 'stdin';
    const vars = { prompt, sessionId: sessionId ?? '', workdir };
    const args = client.turns[name].map((a) => fill(a, vars));
    const logFile = join(metaDir, `turn${i + 1}.log`);
    const res = await runCommand({
      executable: client.executable, args, cwd: workdir, env: client.env, timeoutMs, logFile,
      input: viaStdin ? prompt : undefined,
    });
    turns.push({ name, prompt, command: res.command, exitCode: res.exitCode, durationMs: res.durationMs, logFile, stdout: res.stdout });
    if (res.error || res.timedOut || res.exitCode !== 0) {
      const why = res.error ?? (res.timedOut ? `quá thời gian ${client.timeoutMinutes ?? 30} phút` : `exit ${res.exitCode}`);
      return { status: 'not-run', reason: `lượt ${i + 1} lỗi: ${why}. ${failureDetail(res.stdout, res.stderr)}`.trim(), turns, sessionId };
    }
    if (i === 0 && client.sessionId?.fromOutput) {
      const m = new RegExp(client.sessionId.fromOutput).exec(res.stdout + res.stderr);
      if (!m && names.length > 1) return { status: 'not-run', reason: `không tìm thấy id phiên theo ${client.sessionId.fromOutput}`, turns };
      sessionId = m?.[1];
    }
    if (i === 0 && names.length > 1 && onBetweenTurns) await onBetweenTurns();
  }
  return { status: 'ok', turns, sessionId };
}
