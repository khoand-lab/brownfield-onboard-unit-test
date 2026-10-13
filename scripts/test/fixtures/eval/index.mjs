// Builds a throwaway repo for eval tests: fixture core/adapters (see ../../fixture.mjs), the real
// plan/report templates, the fake "shop" example and an eval config with one fake client per scenario.
import { cpSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../../../build.mjs';
import { REPO_ROOT, writeText } from '../../../lib.mjs';
import { makeFixture } from '../../fixture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const FAKE_AGENT = join(HERE, 'fake-agent.mjs');
export const SCENARIOS = ['good', 'edits-prod', 'writes-in-plan', 'leaves-build', 'deletes-old-test-line', 'short-report', 'bad-marker'];

export function fakeClient(scenario, extra = {}) {
  return {
    executable: process.execPath,
    versionArgs: ['--version'],
    adapter: 'alpha',
    turns: {
      auto: [FAKE_AGENT, '{prompt}'],
      confirmPlan: [FAKE_AGENT, '{prompt}'],
      confirmApprove: [FAKE_AGENT, '--session', '{sessionId}', '{prompt}'],
    },
    sessionId: { fromOutput: 'SESSION=(\\S+)' },
    promptPrefix: '/unit-test ',
    transcriptFormat: 'text',
    timeoutMinutes: 1,
    env: { FAKE_SCENARIO: scenario },
    ...extra,
  };
}

export const SHOP_STACK = {
  example: 'shop',
  scope: 'src',
  testCommand: [process.execPath, 'run-tests.mjs'],
  prodPaths: ['src/**'],
  testPaths: ['test/**'],
  buildDirs: ['build', 'coverage'],
  expectedFailures: [{ file: 'test/tax.test.mjs', name: 'tax > adds VAT' }],
  failurePattern: '^FAIL (.+)$',
  badMarkers: ['\\.only\\('],
  hardUnits: [{ file: 'src/invoice-exporter.mjs', name: 'InvoiceExporter' }],
};

export function makeEvalFixture({ clients } = {}) {
  const fx = makeFixture();
  build({ root: fx.root });
  for (const t of ['plan.md', 'report.md']) {
    writeText(join(fx.root, 'core', 'templates', t), readFileSync(join(REPO_ROOT, 'core', 'templates', t), 'utf8'));
  }
  cpSync(join(HERE, 'shop'), join(fx.root, 'examples', 'shop'), { recursive: true });
  const config = {
    examplesDir: 'examples',
    clients: clients ?? Object.fromEntries(SCENARIOS.map((s) => [`fake-${s}`, fakeClient(s)])),
    stacks: { shop: SHOP_STACK },
  };
  const configFile = join(fx.root, 'eval.config.json');
  writeText(configFile, JSON.stringify(config, null, 2));
  return { root: fx.root, configFile, config, cleanup: fx.cleanup };
}
