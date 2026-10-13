import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { build } from '../build.mjs';
import { MANIFEST_FILE, parseFrontmatter } from '../lib.mjs';
import { makeFixture } from './fixture.mjs';

describe('build', () => {
  let fx;
  beforeEach(() => { fx = makeFixture(); });
  afterEach(() => fx.cleanup());

  it('builds every adapter and ignores directories starting with "_"', () => {
    const results = build({ root: fx.root });
    assert.deepEqual(results.map((r) => r.client), ['alpha', 'beta']);
    assert.ok(!existsSync(join(fx.root, 'dist', '_draft')));
  });

  it('builds only the requested client', () => {
    build({ root: fx.root, clients: ['beta'] });
    assert.ok(existsSync(join(fx.root, 'dist', 'beta', 'beta-skill', 'SKILL.md')));
    assert.ok(!existsSync(join(fx.root, 'dist', 'alpha')));
  });

  it('turns core/AGENT.md into SKILL.md with adapter frontmatter merged in', () => {
    build({ root: fx.root, clients: ['alpha'] });
    const skill = readFileSync(join(fx.root, 'dist', 'alpha', 'skills', 'brownfield-unit-test', 'SKILL.md'), 'utf8');
    const { data, body } = parseFrontmatter(skill);
    assert.equal(data.name, 'brownfield-unit-test');
    assert.equal(data.description, 'Writes unit tests');
    assert.equal(data['allowed-tools'], 'all');
    assert.equal(body, 'Follow the phases.\n');
  });

  it('copies core resources next to SKILL.md', () => {
    build({ root: fx.root, clients: ['alpha'] });
    const skillDir = join(fx.root, 'dist', 'alpha', 'skills', 'brownfield-unit-test');
    for (const rel of ['phases/01-analyze.md', 'playbooks/nodejs.md', 'templates/report.md', 'detection.md']) {
      assert.ok(existsSync(join(skillDir, rel)), `missing ${rel}`);
    }
  });

  it('fills {{VAR}} placeholders in adapter wrapper files and ships INSTALL.md', () => {
    build({ root: fx.root, clients: ['alpha'] });
    const out = join(fx.root, 'dist', 'alpha');
    assert.equal(readFileSync(join(out, 'commands', 'unit-test.md'), 'utf8'), 'Use brownfield-unit-test v1.2.3: Writes unit tests\n');
    assert.ok(existsSync(join(out, 'INSTALL.md')));
  });

  it('writes a manifest with a hash for every skill file', () => {
    build({ root: fx.root, clients: ['alpha'] });
    const manifest = JSON.parse(readFileSync(join(fx.root, 'dist', 'alpha', MANIFEST_FILE), 'utf8'));
    assert.equal(manifest.skillPath, 'skills/brownfield-unit-test');
    assert.equal(Object.keys(manifest.files).length, 5);
    assert.match(manifest.files['skills/brownfield-unit-test/SKILL.md'], /^[0-9a-f]{64}$/);
  });

  it('fails clearly for an unknown client', () => {
    assert.throws(() => build({ root: fx.root, clients: ['nope'] }), /Adapter "nope" not found/);
  });
});
