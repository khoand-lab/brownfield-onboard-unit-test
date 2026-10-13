import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import {
  EvalConfigError, expandEnv, fill, listArg, loadConfig, promptFor, selectRuns, validateConfig,
} from '../eval/config.mjs';

const client = {
  executable: 'fake',
  adapter: 'alpha',
  turns: { auto: ['{prompt}'], confirmPlan: ['{prompt}'], confirmApprove: ['--resume', '{sessionId}', '{prompt}'] },
  transcriptFormat: 'text',
  promptPrefix: '/unit-test ',
};
const stack = {
  example: 'shop',
  scope: 'src',
  testCommand: ['node', 'run-tests.mjs'],
  prodPaths: ['src/**'],
  testPaths: ['test/**'],
  buildDirs: ['build'],
  expectedFailures: [{ file: 'test/tax.test.mjs', name: 'tax' }],
  failurePattern: '^FAIL (.+)$',
};
const valid = { clients: { fake: client }, stacks: { shop: stack } };

describe('eval config', () => {
  const dir = mkdtempSync(join(tmpdir(), 'but-evalcfg-'));
  after(() => rmSync(dir, { recursive: true, force: true }));

  it('loads a valid config and resolves examplesDir next to the file', () => {
    const file = join(dir, 'ok.json');
    writeFileSync(file, JSON.stringify({ ...valid, examplesDir: 'ex' }));
    const cfg = loadConfig(file);
    assert.equal(cfg.examplesDir, join(dir, 'ex'));
    assert.deepEqual(Object.keys(cfg.clients), ['fake']);
  });

  it('reports every missing required key', () => {
    const errors = validateConfig({
      clients: { c: { executable: 'x' } },
      stacks: { s: { example: 'e' } },
    });
    for (const k of ['clients.c.adapter', 'clients.c.turns.auto', 'clients.c.transcriptFormat',
      'stacks.s.scope', 'stacks.s.testCommand', 'stacks.s.expectedFailures', 'stacks.s.failurePattern']) {
      assert.ok(errors.some((e) => e.startsWith(k)), `missing error for ${k}: ${errors.join(' | ')}`);
    }
  });

  it('rejects a bad regex and a bad sessionId', () => {
    const errors = validateConfig({
      clients: { c: { ...client, sessionId: { other: 1 } } },
      stacks: { s: { ...stack, failurePattern: '(' } },
    });
    assert.ok(errors.some((e) => e.includes('sessionId')));
    assert.ok(errors.some((e) => e.includes('failurePattern is not a valid regex')));
  });

  it('throws EvalConfigError for invalid JSON files', () => {
    const file = join(dir, 'bad.json');
    writeFileSync(file, '{ nope');
    assert.throws(() => loadConfig(file), EvalConfigError);
  });

  it('builds the run matrix', () => {
    const cfg = { clients: { a: client, b: client }, stacks: { shop: stack } };
    assert.equal(selectRuns(cfg, { clients: ['a', 'b'], stacks: ['shop'], mode: 'both' }).length, 4);
    assert.deepEqual(selectRuns(cfg, { clients: ['a'], stacks: ['shop'], mode: 'auto' }), [{ client: 'a', stack: 'shop', mode: 'auto' }]);
  });

  it('rejects unknown clients and stacks and lists the valid ones', () => {
    assert.throws(() => selectRuns(valid, { clients: ['nope'], stacks: ['shop'] }), /unknown client nope\. Valid: fake/);
    assert.throws(() => selectRuns(valid, { clients: ['fake'], stacks: ['x'] }), /unknown stack x\. Valid: shop/);
    assert.throws(() => selectRuns(valid, { clients: ['fake'], stacks: ['shop'], mode: 'later' }), /unknown mode/);
    assert.throws(() => selectRuns(valid, { clients: [], stacks: ['shop'] }), /--client is required/);
  });

  it('fills placeholders, expands env vars and builds prompts', () => {
    assert.equal(fill('--resume {sessionId} {x}', { sessionId: 'abc' }), '--resume abc {x}');
    assert.equal(expandEnv('%HOME_X%/bin/$TOOL_Y', { HOME_X: 'C:/u', TOOL_Y: 'k' }), 'C:/u/bin/k');
    assert.equal(promptFor(client, stack, 'auto'), '/unit-test scope=src mode=auto');
    assert.equal(promptFor(client, stack, 'confirmPlan'), '/unit-test scope=src');
    assert.equal(promptFor(client, stack, 'confirmApprove'), 'đồng ý kế hoạch, làm tiếp');
    assert.deepEqual(listArg('a, b'), ['a', 'b']);
  });
});

describe('eval config deps.install', async () => {
  const { installCommands } = await import('../eval/config.mjs');
  it('accepts one command or a list of commands', () => {
    assert.deepEqual(installCommands(['npm', 'ci']), [['npm', 'ci']]);
    assert.deepEqual(installCommands([['python', '-m', 'venv', '.venv'], ['pip', 'install']]).length, 2);
    assert.equal(installCommands([]), null);
    assert.equal(installCommands([['ok'], []]), null);
  });
});
