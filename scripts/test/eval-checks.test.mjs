import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { FAIL, ITEMS, MANUAL, NA, PASS, cell, testNames } from '../eval/checks.mjs';
import { loadConfig } from '../eval/config.mjs';
import { evaluateRun, loadTemplates } from '../eval/evaluate.mjs';
import { snapshot } from '../eval/workspace.mjs';
import { makeEvalFixture } from './fixtures/eval/index.mjs';

// Items that need a human to read the content: the tool must never mark them "Đạt".
const UNDERSTANDING = ['A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C1', 'C3', 'C4', 'C5', 'D2', 'D3', 'D4', 'D6', 'D7', 'E2', 'E3', 'E4'];

describe('eval checks with the fake client', () => {
  let fx;
  let cfg;
  let runDir;
  let templates;
  let exampleBefore;
  const results = {};
  const evaluate = async (client, mode) => {
    const res = await evaluateRun({ root: fx.root, cfg, run: { client, stack: 'shop', mode }, runDir, templates, check: { errors: [] } });
    results[`${client}/${mode}`] = res;
    return res;
  };
  const item = (res, id) => res.items.find((i) => i.id === id);
  const failed = (res) => res.items.filter((i) => i.result === FAIL).map((i) => i.id);

  before(async () => {
    fx = makeEvalFixture();
    cfg = loadConfig(fx.configFile);
    runDir = mkdtempSync(join(tmpdir(), 'but-evalchk-'));
    templates = loadTemplates(fx.root);
    exampleBefore = snapshot(join(fx.root, 'examples', 'shop'));
  });
  after(() => {
    fx.cleanup();
    rmSync(runDir, { recursive: true, force: true });
  });

  it('good: nothing fails in either mode', async () => {
    for (const mode of ['auto', 'confirm']) {
      const res = await evaluate('fake-good', mode);
      assert.equal(res.status, 'ok', res.reason);
      assert.deepEqual(failed(res), [], JSON.stringify(res.items.filter((i) => i.result === FAIL)));
      assert.equal(res.items.length, ITEMS.length);
      for (const id of ['A5', 'A7', 'A8', 'C2', 'D1', 'D5', 'D8', 'E1', 'F1', 'F2']) assert.equal(item(res, id).result, PASS, `${mode} ${id}: ${item(res, id).evidence}`);
      assert.equal(item(res, 'A3').result, mode === 'confirm' ? PASS : NA);
      assert.equal(item(res, 'A4').result, mode === 'auto' ? PASS : NA);
    }
  });

  it('edits-prod: A5 and D8 fail, and D1 catches the old test it broke', async () => {
    const res = await evaluate('fake-edits-prod', 'auto');
    assert.deepEqual(failed(res).sort(), ['A5', 'D1', 'D8']);
    assert.match(item(res, 'D1').evidence, /price > lineTotal rejects zero/);
    assert.match(item(res, 'A5').evidence, /src\/price\.mjs/);
  });

  it('writes-in-plan: A3 fails in mode=confirm', async () => {
    const res = await evaluate('fake-writes-in-plan', 'confirm');
    assert.deepEqual(failed(res), ['A3']);
    assert.match(item(res, 'A3').evidence, /test\/discount\.test\.mjs/);
  });

  it('leaves-build: D8 fails and names the folder', async () => {
    const res = await evaluate('fake-leaves-build', 'auto');
    assert.deepEqual(failed(res), ['D8']);
    assert.match(item(res, 'D8').evidence, /build\//);
  });

  it('deletes-old-test-line: D5 fails with the removed line', async () => {
    const res = await evaluate('fake-deletes-old-test-line', 'auto');
    assert.deepEqual(failed(res), ['D5']);
    assert.match(item(res, 'D5').evidence, /rejects zero/);
  });

  it('short-report: E1 fails with the missing sections', async () => {
    const res = await evaluate('fake-short-report', 'auto');
    assert.deepEqual(failed(res), ['E1']);
    assert.match(item(res, 'E1').evidence, /4\. Test fail đã xử lý.*8\. Thay đổi file/);
  });

  it('bad-marker: C2 fails', async () => {
    const res = await evaluate('fake-bad-marker', 'auto');
    assert.deepEqual(failed(res), ['C2']);
    assert.match(item(res, 'C2').evidence, /test\/only\.test\.mjs:1/);
  });

  it('never marks a reading-comprehension item as passed, and gives evidence', () => {
    for (const res of Object.values(results)) {
      for (const id of UNDERSTANDING) {
        assert.equal(item(res, id).result, MANUAL, `${id} must be manual`);
        assert.ok(item(res, id).evidence.length > 0);
      }
    }
    assert.match(item(results['fake-good/auto'], 'C4').evidence, /discount > gold gets 20%/);
    assert.match(item(results['fake-good/auto'], 'E2').evidence, /Trước 40%/);
  });

  it('leaves the agent copy as the agent left it and the example untouched', () => {
    const res = results['fake-good/auto'];
    assert.ok(!existsSync(join(res.workdir, 'build')), 'verification must not create build dirs in the run copy');
    assert.ok(!readdirSync(runDir).some((d) => d.endsWith('-verify')), 'verify copy removed');
    assert.deepEqual(snapshot(join(fx.root, 'examples', 'shop')), exampleBefore);
  });

  it('reports a missing toolchain as not-run', async () => {
    cfg.stacks.shop = { ...cfg.stacks.shop, requires: [['no-such-tool-xyz']] };
    const res = await evaluateRun({ root: fx.root, cfg, run: { client: 'fake-good', stack: 'shop', mode: 'auto' }, runDir, templates, check: { errors: [] } });
    assert.equal(res.status, 'not-run');
    assert.match(res.reason, /thiếu toolchain/);
  });
});

describe('eval check helpers', () => {
  it('extracts test names across stacks', () => {
    assert.deepEqual(testNames("it('khi a thì b', () => {})\ntest.each([1])('x %s', f)"), ['khi a thì b', 'x %s']);
    assert.deepEqual(testNames('@Test\n    void givenX_whenY_thenZ() {}'), ['givenX_whenY_thenZ']);
    assert.deepEqual(testNames('def test_rate():\n    pass'), ['test_rate']);
  });

  it('makes table-safe evidence', () => {
    assert.equal(cell('a|b\nc'), 'a\\|b ⏎ c');
    assert.equal(cell('x'.repeat(500)).length, 401);
  });
});

describe('eval grade D1', async () => {
  const { grade } = await import('../eval/checks.mjs');
  const { SHOP_STACK } = await import('./fixtures/eval/index.mjs');
  const base = {
    mode: 'auto', stack: SHOP_STACK,
    final: { changes: [{ path: 'test/new.test.mjs', change: 'added', kind: 'test' }], newBuildDirs: [], testDiffs: {} },
    afterTexts: {}, plan: null, report: null, planMissing: [], reportMissing: [], check: { errors: [] }, logs: [],
  };
  it('fails when the test command errors without any parsed failure (e.g. a compile error)', () => {
    const items = grade({ ...base, verify: { ran: true, exitCode: 1, failures: [], command: 'mvn test' } });
    const d1 = items.find((i) => i.id === 'D1');
    assert.equal(d1.result, FAIL);
    assert.match(d1.evidence, /không trích được test fail/);
    assert.equal(items.find((i) => i.id === 'A7').result, FAIL, 'the deliberately failing test no longer shows up');
  });
});
