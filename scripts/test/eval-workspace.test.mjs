import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { loadConfig } from '../eval/config.mjs';
import {
  classify, compareSnapshots, globToRegExp, prepareWorkspace, removedLines, snapshot,
} from '../eval/workspace.mjs';
import { SHOP_STACK, makeEvalFixture } from './fixtures/eval/index.mjs';

describe('eval workspace', () => {
  let fx;
  let runDir;
  before(() => {
    fx = makeEvalFixture();
    runDir = mkdtempSync(join(tmpdir(), 'but-evalws-'));
  });
  after(() => {
    fx.cleanup();
    rmSync(runDir, { recursive: true, force: true });
  });

  it('copies the example without build dirs, installs the adapter, and snapshots without adapter files', async () => {
    const example = join(fx.root, 'examples', 'shop');
    writeFileSync(join(example, 'stale.txt'), 'x');
    mkdirSync(join(example, 'build'), { recursive: true });
    writeFileSync(join(example, 'build', 'old.log'), 'x');
    const exampleBefore = snapshot(example);

    const cfg = loadConfig(fx.configFile);
    const ws = await prepareWorkspace({ root: fx.root, cfg, run: { client: 'fake-good', stack: 'shop', mode: 'auto' }, runDir });

    assert.ok(!existsSync(join(ws.workdir, 'build')), 'build dir must not be copied');
    assert.ok(existsSync(join(ws.workdir, '.alpha', 'skills', 'brownfield-unit-test', 'SKILL.md')), 'adapter installed');
    assert.ok(Object.keys(ws.before.files).every((f) => !f.startsWith('.alpha/')), 'snapshot ignores adapter files');
    assert.ok('src/price.mjs' in ws.before.files);
    assert.ok('test/price.test.mjs' in ws.before.texts, 'test file text kept for diffs');
    assert.ok(existsSync(join(ws.metaDir, 'before.json')), 'snapshot saved outside the workdir');
    assert.ok(!ws.metaDir.startsWith(ws.workdir + '\\') && !ws.metaDir.startsWith(ws.workdir + '/'));
    assert.deepEqual(snapshot(example), exampleBefore, 'example left untouched');
  });

  it('copies an existing dependency folder but leaves it out of the snapshot', async () => {
    const example = join(fx.root, 'examples', 'shop');
    mkdirSync(join(example, 'node_modules', 'lib'), { recursive: true });
    writeFileSync(join(example, 'node_modules', 'lib', 'index.js'), 'module.exports = 1;');
    const cfg = loadConfig(fx.configFile);
    cfg.stacks.shop = { ...cfg.stacks.shop, deps: { dir: 'node_modules', install: ['npm', 'ci'] } };
    const ws = await prepareWorkspace({ root: fx.root, cfg, run: { client: 'fake-good', stack: 'shop', mode: 'confirm' }, runDir });
    assert.ok(existsSync(join(ws.workdir, 'node_modules', 'lib', 'index.js')), 'deps copied instead of installed');
    assert.ok(Object.keys(ws.before.files).every((f) => !f.startsWith('node_modules/')));
    rmSync(join(example, 'node_modules'), { recursive: true, force: true });
  });

  it('refuses to reuse an existing workdir', async () => {
    const cfg = loadConfig(fx.configFile);
    await assert.rejects(
      prepareWorkspace({ root: fx.root, cfg, run: { client: 'fake-good', stack: 'shop', mode: 'auto' }, runDir }),
      /workdir already exists/,
    );
  });
});

describe('snapshot comparison', () => {
  const snap = (files, texts = {}, buildDirs = []) => ({ files, texts, buildDirs });

  it('matches globs', () => {
    assert.ok(globToRegExp('src/**').test('src/a/b.mjs'));
    assert.ok(globToRegExp('**/__tests__/**').test('src/x/__tests__/a.test.ts'));
    assert.ok(globToRegExp('src/**/*.java').test('src/A.java'));
    assert.ok(!globToRegExp('test/*.mjs').test('test/a/b.mjs'));
  });

  it('classifies test, production, config and other files', () => {
    assert.equal(classify('test/a.test.mjs', SHOP_STACK), 'test');
    assert.equal(classify('src/price.mjs', SHOP_STACK), 'production');
    assert.equal(classify('package.json', SHOP_STACK), 'config');
    assert.equal(classify('notes.txt', SHOP_STACK), 'other');
  });

  it('reports added, modified and removed files and new build dirs', () => {
    const b = snap({ 'src/a.mjs': '1', 'test/a.test.mjs': '2', 'README.md': '3' }, { 'test/a.test.mjs': 'x\n' });
    const a = snap({ 'src/a.mjs': '9', 'test/a.test.mjs': '2', 'test/b.test.mjs': '4' }, { 'test/a.test.mjs': 'x\n' }, ['build']);
    const { changes, newBuildDirs } = compareSnapshots(b, a, SHOP_STACK);
    assert.deepEqual(changes, [
      { path: 'README.md', change: 'removed', kind: 'other' },
      { path: 'src/a.mjs', change: 'modified', kind: 'production' },
      { path: 'test/b.test.mjs', change: 'added', kind: 'test' },
    ]);
    assert.deepEqual(newBuildDirs, ['build']);
  });

  it('accepts appended lines in an existing test but flags a modified line', () => {
    const old = 'import x;\n\ntest one\ntest two\n';
    assert.deepEqual(removedLines(old, 'import x;\n\ntest one\ntest two\ntest three\n'), []);
    assert.deepEqual(removedLines(old, 'import x;\ntest one\ntest TWO\n'), ['test two']);
    assert.deepEqual(removedLines('a\r\nb\r\n', 'a\nb\n'), [], 'line endings are ignored');

    const b = snap({ 'test/a.test.mjs': '1' }, { 'test/a.test.mjs': old });
    const a = snap({ 'test/a.test.mjs': '2' }, { 'test/a.test.mjs': 'import x;\ntest one\n' });
    assert.deepEqual(compareSnapshots(b, a, SHOP_STACK).testDiffs, { 'test/a.test.mjs': { removed: ['test two'] } });
  });

  it('reads real files: a deleted line in an old test shows up', () => {
    const dir = mkdtempSync(join(tmpdir(), 'but-snap-'));
    try {
      writeFileSync(join(dir, 'keep.txt'), 'k');
      mkdirSync(join(dir, 'test'));
      writeFileSync(join(dir, 'test', 'old.test.mjs'), 'one\ntwo\n');
      const opts = { textGlobs: ['test/**'], buildDirs: ['build'] };
      const b = snapshot(dir, opts);
      writeFileSync(join(dir, 'test', 'old.test.mjs'), 'one\n');
      mkdirSync(join(dir, 'build'));
      const a = snapshot(dir, opts);
      const cmp = compareSnapshots(b, a, SHOP_STACK);
      assert.deepEqual(cmp.testDiffs['test/old.test.mjs'].removed, ['two']);
      assert.deepEqual(cmp.newBuildDirs, ['build']);
      assert.equal(readFileSync(join(dir, 'keep.txt'), 'utf8'), 'k');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
