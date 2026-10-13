import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { snapshot } from '../eval/workspace.mjs';
import { FAKE_AGENT, makeEvalFixture } from './fixtures/eval/index.mjs';

const EVAL = fileURLToPath(new URL('../eval.mjs', import.meta.url));

describe('eval CLI', () => {
  let fx;
  let tmp;
  let exampleBefore;
  const evalCli = (...args) => {
    const res = spawnSync(process.execPath, [EVAL, '--root', fx.root, '--config', fx.configFile, '--run-dir', tmp, '--skip-check', ...args], { encoding: 'utf8' });
    return { code: res.status, out: res.stdout, err: res.stderr };
  };
  before(() => {
    fx = makeEvalFixture();
    tmp = mkdtempSync(join(tmpdir(), 'but-evalcli-'));
    exampleBefore = snapshot(join(fx.root, 'examples', 'shop'));
  });
  after(() => {
    fx.cleanup();
    rmSync(tmp, { recursive: true, force: true });
  });

  it('exits 0 and writes results when nothing fails', () => {
    const out = join(tmp, 'good.md');
    const res = evalCli('--client', 'fake-good', '--stack', 'shop', '--mode', 'both', '--out', out);
    assert.equal(res.code, 0, res.out + res.err);
    assert.match(res.out, /Sẽ chạy 2 lượt đánh giá/);
    assert.match(res.out, /Cảnh báo: agent chạy với quyền rộng/);
    const md = readFileSync(out, 'utf8');
    assert.match(md, /## fake-good · shop · confirm/);
    assert.match(md, /## fake-good · shop · auto/);
    assert.match(md, /\*\*Mục không đạt:\*\* không có\./);
  });

  it('exits 1 when an item fails, and keeps going after a run that cannot run', () => {
    const out = join(tmp, 'bad.md');
    const res = evalCli('--client', 'fake-edits-prod,fake-good', '--stack', 'shop', '--mode', 'auto', '--out', out);
    assert.equal(res.code, 1, res.out + res.err);
    assert.match(res.out, /✖ fake-edits-prod · shop · auto A5/);
    assert.match(readFileSync(out, 'utf8'), /## fake-good · shop · auto/, 'later runs still evaluated');
  });

  it('exits 2 for an unknown stack or client and lists the valid values', () => {
    const res = evalCli('--client', 'fake-good', '--stack', 'nope');
    assert.equal(res.code, 2);
    assert.match(res.err, /unknown stack nope\. Valid: shop/);
    assert.equal(evalCli('--client', 'ghost', '--stack', 'shop').code, 2);
  });

  it('prints the commands in --dry-run without creating copies', () => {
    const res = evalCli('--client', 'fake-good', '--stack', 'shop', '--mode', 'confirm', '--dry-run');
    assert.equal(res.code, 0, res.err);
    assert.match(res.out, /confirmPlan: .*fake-agent\.mjs" "\/unit-test scope=src"/);
    assert.match(res.out, /confirmApprove: .*--session <session-id> "đồng ý kế hoạch, làm tiếp"/);
  });

  it('verify-only gives the same result as an automatic run', () => {
    const runDir = join(tmp, 'manual');
    const prep = evalCli('--prepare', '--client', 'fake-good', '--stack', 'shop', '--mode', 'confirm', '--run-dir', runDir);
    assert.equal(prep.code, 0, prep.out + prep.err);
    const workdir = /Bản copy đã sẵn sàng: (.+)/.exec(prep.out)[1].trim();

    // The user runs the agent by hand: plan turn, mid snapshot, approval turn.
    const agent = (prompt) => spawnSync(process.execPath, [FAKE_AGENT, prompt], { cwd: workdir, encoding: 'utf8', env: { ...process.env, FAKE_SCENARIO: 'good' } }).stdout;
    writeFileSync(join(tmp, 'plan.txt'), agent('/unit-test scope=src'));
    assert.equal(evalCli('--mark-mid', workdir).code, 0);
    writeFileSync(join(tmp, 'report.txt'), agent('đồng ý kế hoạch, làm tiếp'));

    const out = join(tmp, 'manual.md');
    const res = evalCli('--verify', workdir, '--plan-output', join(tmp, 'plan.txt'), '--report-output', join(tmp, 'report.txt'), '--out', out);
    assert.equal(res.code, 0, res.out + res.err);
    const md = readFileSync(out, 'utf8');
    for (const id of ['A3', 'A5', 'A7', 'A8', 'D1', 'D5', 'D8', 'E1']) assert.match(md, new RegExp(`\\| ${id} \\| Đạt \\|`), id);

    const auto = readFileSync(join(tmp, 'good.md'), 'utf8');
    const rows = (text, section) => text.split(`## fake-good · shop · ${section}`)[1].split('\n## ')[0].split('\n').filter((l) => /^\| [A-F]\d \|/.test(l)).map((l) => l.split('|').slice(1, 3).join('|'));
    assert.deepEqual(rows(md, 'confirm').filter((r) => !r.startsWith(' F2')), rows(auto, 'confirm').filter((r) => !r.startsWith(' F2')));
  });

  it('verify-only flags a production edit made by hand', () => {
    const runDir = join(tmp, 'manual-bad');
    const prep = evalCli('--prepare', '--client', 'fake-good', '--stack', 'shop', '--mode', 'auto', '--run-dir', runDir);
    const workdir = /Bản copy đã sẵn sàng: (.+)/.exec(prep.out)[1].trim();
    const report = spawnSync(process.execPath, [FAKE_AGENT, 'scope=src mode=auto'], { cwd: workdir, encoding: 'utf8', env: { ...process.env, FAKE_SCENARIO: 'edits-prod' } }).stdout;
    writeFileSync(join(tmp, 'report-bad.txt'), report);
    const res = evalCli('--verify', workdir, '--report-output', join(tmp, 'report-bad.txt'), '--out', join(tmp, 'manual-bad.md'));
    assert.equal(res.code, 1);
    assert.match(res.out, /✖ A5/);
  });

  it('accepts a client that is not configured when --adapter is given', () => {
    const res = evalCli('--prepare', '--client', 'my-ide', '--adapter', 'alpha', '--stack', 'shop', '--mode', 'auto', '--run-dir', join(tmp, 'ide'));
    assert.equal(res.code, 0, res.err);
    assert.equal(evalCli('--prepare', '--client', 'my-ide', '--stack', 'shop', '--mode', 'auto').code, 2);
  });

  it('never touches the example project', () => {
    assert.deepEqual(snapshot(join(fx.root, 'examples', 'shop')), exampleBefore);
    assert.ok(!existsSync(join(fx.root, 'examples', 'shop', 'test', 'discount.test.mjs')));
  });
});

describe('eval run ids', () => {
  it('are unique even within the same second', async () => {
    const { newRunId } = await import('../eval.mjs');
    const now = new Date(2026, 9, 6, 10, 12, 15);
    const ids = new Set(Array.from({ length: 50 }, () => newRunId(now)));
    assert.ok(ids.size > 45, `only ${ids.size} distinct ids`);
    assert.match([...ids][0], /^20261006-101215-[0-9a-f]{4}$/);
  });
});
