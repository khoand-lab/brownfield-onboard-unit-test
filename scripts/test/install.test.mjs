import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { build } from '../build.mjs';
import { install, uninstall } from '../install.mjs';
import { writeText } from '../lib.mjs';
import { makeFixture } from './fixture.mjs';

describe('install', () => {
  let fx;
  let target;
  beforeEach(() => {
    fx = makeFixture();
    build({ root: fx.root });
    target = mkdtempSync(join(tmpdir(), 'but-target-'));
  });
  afterEach(() => {
    fx.cleanup();
    rmSync(target, { recursive: true, force: true });
  });

  it('copies the files declared for a project install', () => {
    install({ root: fx.root, client: 'alpha', target: 'project', path: target });
    assert.ok(existsSync(join(target, '.alpha', 'skills', 'brownfield-unit-test', 'SKILL.md')));
    assert.ok(existsSync(join(target, '.alpha', 'skills', 'brownfield-unit-test', 'playbooks', 'nodejs.md')));
    assert.ok(existsSync(join(target, '.alpha', 'commands', 'unit-test.md')));
  });

  it('uses the user mapping for a user install', () => {
    install({ root: fx.root, client: 'alpha', target: 'user', path: target });
    assert.ok(existsSync(join(target, '.alpha', 'skills', 'brownfield-unit-test', 'SKILL.md')));
    assert.ok(!existsSync(join(target, '.alpha', 'commands')));
  });

  it('replaces a previous install instead of merging stale files', () => {
    const stale = join(target, '.alpha', 'skills', 'brownfield-unit-test', 'playbooks', 'old.md');
    writeText(stale, 'stale');
    install({ root: fx.root, client: 'alpha', target: 'project', path: target });
    assert.ok(!existsSync(stale));
  });

  it('uninstall removes installed files and empty parent folders but keeps unrelated files', () => {
    writeText(join(target, 'README.md'), 'keep me');
    install({ root: fx.root, client: 'alpha', target: 'project', path: target });
    uninstall({ root: fx.root, client: 'alpha', target: 'project', path: target });
    assert.ok(!existsSync(join(target, '.alpha')));
    assert.ok(existsSync(join(target, 'README.md')));
  });

  it('rejects a target the adapter does not support', () => {
    assert.throws(
      () => install({ root: fx.root, client: 'beta', target: 'user', path: target }),
      /adapter beta does not support --target user/,
    );
  });

  it('asks for a build when dist is missing', () => {
    rmSync(join(fx.root, 'dist'), { recursive: true, force: true });
    assert.throws(
      () => install({ root: fx.root, client: 'alpha', target: 'project', path: target }),
      /run: node scripts\/build\.mjs --client alpha/,
    );
  });
});
