import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { resolveExecutable, runCommand } from '../eval/runner.mjs';

const IS_WIN = process.platform === 'win32';
const TRICKY = [
  '$brownfield-unit-test scope=src mode=auto',
  'a b',
  'say "hi"',
  'đồng ý kế hoạch, làm tiếp',
  'Read,Write,Bash(mvn:*),PowerShell(Get-ChildItem:*)',
  'a&b|c<d>e',
  'x^y',
  'coverage 80% %PATH% !x!',
  'trailing\\',
  '',
];

describe('eval runner', () => {
  const dir = mkdtempSync(join(tmpdir(), 'but-runner-'));
  after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'echo-args.mjs'), 'console.log(JSON.stringify(process.argv.slice(2)));\n');
  // An npm-style shim: cmd re-expands %* once more, which is what breaks naive quoting.
  writeFileSync(join(dir, 'echo-args.cmd'), `@"${process.execPath}" "%~dp0echo-args.mjs" %*\r\n`);

  it('passes tricky arguments through unchanged', async () => {
    const res = await runCommand({ executable: process.execPath, args: [join(dir, 'echo-args.mjs'), ...TRICKY] });
    assert.equal(res.exitCode, 0, res.stderr);
    assert.deepEqual(JSON.parse(res.stdout), TRICKY);
  });

  it('passes tricky arguments through a .cmd shim on Windows', { skip: !IS_WIN }, async () => {
    const res = await runCommand({ executable: join(dir, 'echo-args.cmd'), args: TRICKY });
    assert.equal(res.exitCode, 0, res.stderr);
    assert.deepEqual(JSON.parse(res.stdout), TRICKY);
  });

  it('runs a .cmd shim whose path contains spaces', { skip: !IS_WIN }, async () => {
    const spaced = join(dir, 'Tool Kit (x86)');
    mkdirSync(spaced, { recursive: true });
    writeFileSync(join(spaced, 'echo-args.cmd'), `@"${process.execPath}" "${join(dir, 'echo-args.mjs')}" %*
`);
    const res = await runCommand({ executable: join(spaced, 'echo-args.cmd'), args: ['-q', 'test', 'a b'] });
    assert.equal(res.exitCode, 0, res.stderr);
    assert.deepEqual(JSON.parse(res.stdout), ['-q', 'test', 'a b']);
  });

  it('kills the process tree on timeout', async () => {
    const res = await runCommand({
      executable: process.execPath,
      args: ['-e', "require('child_process').spawn(process.execPath,['-e','setTimeout(()=>{},60000)'],{stdio:'inherit'}); setTimeout(()=>{},60000)"],
      timeoutMs: 500,
    });
    assert.equal(res.timedOut, true);
    assert.ok(res.durationMs < 15_000, `took ${res.durationMs}ms`);
  });

  it('finishes when the process exits even if a detached grandchild keeps its stdout open', async () => {
    // Like a Gradle daemon started by the agent: it outlives the client and inherits the client's pipes.
    const res = await runCommand({
      executable: process.execPath,
      args: ['-e', "require('child_process').spawn(process.execPath,['-e','setTimeout(()=>{},8000)'],{stdio:'inherit',detached:true}).unref(); console.log('done')"],
      timeoutMs: 30_000,
      exitGraceMs: 500,
    });
    assert.equal(res.timedOut, false);
    assert.equal(res.exitCode, 0);
    assert.match(res.stdout, /done/);
    assert.ok(res.durationMs < 5_000, `took ${res.durationMs}ms`);
  });

  it('sends the prompt on stdin and writes logs', async () => {
    const logFile = join(dir, 'logs', 'turn1.log');
    const res = await runCommand({
      executable: process.execPath,
      args: ['-e', "process.stdin.pipe(process.stdout); console.error('warn')"],
      input: 'đồng ý $x "q"',
      logFile,
    });
    assert.equal(res.stdout, 'đồng ý $x "q"');
    assert.equal(readFileSync(logFile, 'utf8'), 'đồng ý $x "q"');
    assert.ok(existsSync(join(dir, 'logs', 'turn1.err.log')));
  });

  it('reports a missing executable instead of throwing', async () => {
    const res = await runCommand({ executable: 'definitely-not-a-cli-xyz' });
    assert.equal(res.exitCode, null);
    assert.match(res.error, /executable not found/);
    assert.equal(resolveExecutable('definitely-not-a-cli-xyz'), null);
  });

  it('resolves executables from PATH and env-expanded absolute paths', () => {
    assert.ok(resolveExecutable('node'));
    assert.equal(resolveExecutable('%BUT_DIR%/echo-args.mjs', { ...process.env, BUT_DIR: dir }), `${dir}/echo-args.mjs`);
  });
});

describe('eval turns', async () => {
  const { checkRequirements, runTurns } = await import('../eval/runner.mjs');
  const { fakeClient, SHOP_STACK } = await import('./fixtures/eval/index.mjs');
  const { cpSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const shop = fileURLToPath(new URL('./fixtures/eval/shop', import.meta.url));
  const base = mkdtempSync(join(tmpdir(), 'but-turns-'));
  after(() => rmSync(base, { recursive: true, force: true }));
  const workspace = (name) => {
    const workdir = join(base, name);
    cpSync(shop, workdir, { recursive: true });
    return { workdir, metaDir: join(base, `${name}.meta`) };
  };

  it('runs plan then approval on the same session for mode=confirm, with a hook in between', async () => {
    const { workdir, metaDir } = workspace('confirm');
    let between = 0;
    const res = await runTurns({
      client: fakeClient('good'), stack: SHOP_STACK, mode: 'confirm', workdir, metaDir,
      onBetweenTurns: () => {
        between++;
        assert.ok(!existsSync(join(workdir, 'test', 'discount.test.mjs')), 'nothing written after the plan turn');
      },
    });
    assert.equal(res.status, 'ok', res.reason);
    assert.equal(between, 1);
    assert.deepEqual(res.turns.map((t) => t.name), ['confirmPlan', 'confirmApprove']);
    assert.equal(res.sessionId, 'fake-session-1', 'session id parsed from the first turn');
    assert.match(res.turns[1].command, /--session fake-session-1/);
    assert.equal(res.turns[0].prompt, '/unit-test scope=src');
    assert.equal(res.turns[1].prompt, 'đồng ý kế hoạch, làm tiếp');
    assert.ok(existsSync(join(metaDir, 'turn2.log')));
    assert.ok(existsSync(join(workdir, 'test', 'discount.test.mjs')));
  });

  it('runs a single turn with mode=auto and can pass the prompt on stdin', async () => {
    const { workdir, metaDir } = workspace('auto');
    const client = fakeClient('good', {
      promptVia: 'stdin',
      turns: { auto: [fakeClient('good').turns.auto[0]], confirmPlan: [], confirmApprove: [] },
    });
    const res = await runTurns({ client, stack: SHOP_STACK, mode: 'auto', workdir, metaDir });
    assert.equal(res.status, 'ok', res.reason);
    assert.equal(res.turns.length, 1);
    assert.match(res.turns[0].stdout, /# Báo cáo unit test/);
  });

  it('marks a failing or missing client as not-run without throwing, so later runs continue', async () => {
    const results = [];
    for (const client of [
      fakeClient('good', { executable: 'no-such-client-cli' }),
      fakeClient('good', { env: { FAKE_SCENARIO: 'good', FAKE_EXIT: '3' } }),
      fakeClient('good'),
    ]) {
      const { workdir, metaDir } = workspace(`loop-${results.length}`);
      results.push(await runTurns({ client, stack: SHOP_STACK, mode: 'auto', workdir, metaDir }));
    }
    assert.deepEqual(results.map((r) => r.status), ['not-run', 'not-run', 'ok']);
    assert.match(results[0].reason, /executable not found/);
    assert.match(results[1].reason, /exit 3/);
  });

  it('reports a timeout as not-run', async () => {
    const { workdir, metaDir } = workspace('slow');
    const client = fakeClient('good', { timeoutMinutes: 0.01, env: { FAKE_SCENARIO: 'good', FAKE_SLEEP_MS: '20000' } });
    const res = await runTurns({ client, stack: SHOP_STACK, mode: 'auto', workdir, metaDir });
    assert.equal(res.status, 'not-run');
    assert.match(res.reason, /quá thời gian/);
  });

  it('checks the client CLI and the toolchain before running', async () => {
    assert.equal(await checkRequirements(fakeClient('good'), SHOP_STACK), null);
    assert.match(await checkRequirements(fakeClient('good', { executable: 'no-such-client-cli' }), SHOP_STACK), /thiếu CLI/);
    assert.match(await checkRequirements(fakeClient('good'), { ...SHOP_STACK, requires: [['no-such-tool-xyz', '-v']] }), /thiếu toolchain: no-such-tool-xyz/);
  });
});

describe('eval runner relative executables', () => {
  it('resolves a relative executable against the working directory', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'but-rel-'));
    try {
      writeFileSync(join(dir, 'hello.mjs'), "console.log('hi from ' + process.cwd().split(/[\\/]/).pop())");
      const { runCommand: run } = await import('../eval/runner.mjs');
      const res = await run({ executable: process.execPath, args: ['./hello.mjs'], cwd: dir });
      assert.match(res.stdout, /hi from/);
      const { resolveExecutable: resolveExe } = await import('../eval/runner.mjs');
      assert.equal(resolveExe('./hello.mjs', process.env, dir), join(dir, 'hello.mjs'));
      assert.equal(resolveExe('./nope.exe', process.env, dir), null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('eval runner plain batch files', () => {
  it('escapes arguments once for a non-npm .cmd (like mvn.cmd)', { skip: !IS_WIN }, async () => {
    const { isNpmShim, runCommand: run } = await import('../eval/runner.mjs');
    const dir = mkdtempSync(join(tmpdir(), 'but-bat-'));
    try {
      const bat = join(dir, 'Tool Kit', 'mvn.cmd');
      mkdirSync(join(dir, 'Tool Kit'));
      writeFileSync(bat, '@echo off\r\necho [%~1] [%~2]\r\n');
      assert.equal(isNpmShim(bat), false);
      const res = await run({ executable: bat, args: ['-q', 'a b'] });
      assert.equal(res.exitCode, 0, res.stderr);
      assert.equal(res.stdout.trim(), '[-q] [a b]');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('eval runner failure detail', () => {
  it('prefers the JSON error event over noisy stderr', async () => {
    const { failureDetail } = await import('../eval/runner.mjs');
    const stdout = [
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'x' } }),
      JSON.stringify({ type: 'error', message: "You've hit your usage limit." }),
      JSON.stringify({ type: 'turn.failed', error: { message: "You've hit your usage limit. Try again later." } }),
    ].join('\n');
    assert.equal(failureDetail(stdout, 'ERROR exec_command rejected: blocked by policy'), "You've hit your usage limit. Try again later.");
    assert.equal(failureDetail('', 'plain failure'), 'plain failure');
    assert.equal(failureDetail(JSON.stringify({ type: 'result', is_error: true, result: 'API Error' }), ''), 'API Error');
  });
});
