// Builds a tiny throwaway repo (core/ + adapters/) in a temp directory for script tests.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeText } from '../lib.mjs';
import { PLAYBOOK_SECTIONS } from '../check.mjs';

export function playbook(title, sections = PLAYBOOK_SECTIONS) {
  return `# ${title}\n\n${sections.map((s) => `## ${s}\n\ncontent\n`).join('\n')}`;
}

export function makeFixture({ agentBody = 'Follow the phases.\n', playbooks = { 'nodejs.md': playbook('Node.js') } } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'but-fixture-'));
  writeText(join(root, 'package.json'), JSON.stringify({ version: '1.2.3' }));
  writeText(join(root, 'core', 'AGENT.md'), `---\nname: brownfield-unit-test\ndescription: Writes unit tests\n---\n${agentBody}`);
  writeText(join(root, 'core', 'phases', '01-analyze.md'), '# Analyze\n');
  writeText(join(root, 'core', 'templates', 'report.md'), '# Report\n');
  writeText(join(root, 'core', 'detection.md'), '# Detection\n');
  for (const [name, content] of Object.entries(playbooks)) {
    writeText(join(root, 'core', 'playbooks', name), content);
  }

  writeText(join(root, 'adapters', 'alpha', 'adapter.json'), JSON.stringify({
    skillPath: 'skills/brownfield-unit-test',
    skillFrontmatter: { 'allowed-tools': 'all' },
    install: {
      project: [{ from: 'skills', to: '.alpha/skills' }, { from: 'commands', to: '.alpha/commands' }],
      user: [{ from: 'skills', to: '.alpha/skills' }],
    },
  }));
  writeText(join(root, 'adapters', 'alpha', 'files', 'commands', 'unit-test.md'), 'Use {{SKILL_NAME}} v{{VERSION}}: {{SKILL_DESCRIPTION}}\n');
  writeText(join(root, 'adapters', 'alpha', 'INSTALL.md'), '# Install alpha\n');

  writeText(join(root, 'adapters', 'beta', 'adapter.json'), JSON.stringify({
    skillPath: 'beta-skill',
    install: { project: [{ from: 'beta-skill', to: 'tools/beta-skill' }] },
  }));

  // Directories starting with "_" are ignored by the build.
  writeText(join(root, 'adapters', '_draft', 'adapter.json'), JSON.stringify({ skillPath: 'x' }));

  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}
