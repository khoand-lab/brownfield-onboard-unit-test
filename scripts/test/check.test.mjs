import assert from 'node:assert/strict';
import { appendFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { build } from '../build.mjs';
import { PLAYBOOK_SECTIONS, checkCoreIsClientAgnostic, checkDist, checkPlaybooks, runChecks } from '../check.mjs';
import { writeText } from '../lib.mjs';
import { makeFixture, playbook } from './fixture.mjs';

describe('check', () => {
  let fx;
  afterEach(() => fx?.cleanup());

  describe('playbooks', () => {
    it('passes a playbook with every mandatory section', () => {
      fx = makeFixture();
      assert.deepEqual(checkPlaybooks(fx.root).errors, []);
    });

    it('reports the missing sections of an incomplete playbook', () => {
      fx = makeFixture({ playbooks: { 'python.md': playbook('Python', PLAYBOOK_SECTIONS.slice(0, 7)) } });
      const { errors } = checkPlaybooks(fx.root);
      assert.equal(errors.length, 1);
      assert.match(errors[0], /python\.md: missing sections: Disabling a test, Common pitfalls/);
    });

    it('lists supported stacks that have no playbook yet', () => {
      fx = makeFixture();
      const { missingStacks } = checkPlaybooks(fx.root);
      assert.ok(missingStacks.includes('flutter'));
      assert.ok(!missingStacks.includes('nodejs'));
    });
  });

  describe('client-agnostic core', () => {
    it('passes generic wording', () => {
      fx = makeFixture({ agentBody: 'Read the file, then run the shell command.\n' });
      assert.deepEqual(checkCoreIsClientAgnostic(fx.root).errors, []);
    });

    it('flags client names and tool syntax with file and line', () => {
      fx = makeFixture({ agentBody: 'Intro\nUse the Bash tool here.\nPass $ARGUMENTS like in Claude Code.\n' });
      const { errors } = checkCoreIsClientAgnostic(fx.root);
      assert.ok(errors.some((e) => /core\/AGENT\.md:6: client-specific term "Bash tool"/.test(e)), errors.join('\n'));
      assert.ok(errors.some((e) => /core\/AGENT\.md:7: client-specific term "\$ARGUMENTS"/.test(e)), errors.join('\n'));
      assert.ok(errors.some((e) => /"Claude Code"/.test(e)), errors.join('\n'));
    });
  });

  describe('dist drift', () => {
    it('passes right after a build', () => {
      fx = makeFixture();
      build({ root: fx.root });
      assert.deepEqual(checkDist(fx.root).errors, []);
    });

    it('only notes unbuilt adapters unless --require-dist', () => {
      fx = makeFixture();
      assert.deepEqual(checkDist(fx.root).errors, []);
      assert.equal(checkDist(fx.root).notes.length, 2);
      assert.equal(checkDist(fx.root, undefined, { requireDist: true }).errors.length, 2);
    });

    it('names the adapter whose copy was edited by hand', () => {
      fx = makeFixture();
      build({ root: fx.root });
      appendFileSync(join(fx.root, 'dist', 'beta', 'beta-skill', 'playbooks', 'nodejs.md'), 'hand edit\n');
      const { errors } = checkDist(fx.root);
      assert.equal(errors.length, 1);
      assert.match(errors[0], /adapter beta: beta-skill\/playbooks\/nodejs\.md differs from core/);
    });

    it('detects core changes that were not rebuilt', () => {
      fx = makeFixture();
      build({ root: fx.root });
      writeText(join(fx.root, 'core', 'playbooks', 'python.md'), playbook('Python'));
      rmSync(join(fx.root, 'core', 'detection.md'));
      const { errors } = checkDist(fx.root);
      assert.ok(errors.some((e) => /adapter alpha: out of date, missing .*python\.md/.test(e)), errors.join('\n'));
      assert.ok(errors.some((e) => /adapter beta: beta-skill\/detection\.md no longer exists in core/.test(e)), errors.join('\n'));
    });
  });

  it('runChecks aggregates all errors', () => {
    fx = makeFixture({ agentBody: 'Kiro only.\n', playbooks: { 'vue.md': '# Vue\n' } });
    const { errors } = runChecks({ root: fx.root });
    assert.ok(errors.some((e) => e.includes('vue.md: missing sections')));
    assert.ok(errors.some((e) => e.includes('"Kiro"')));
  });
});
