import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { REPO_ROOT } from '../lib.mjs';
import {
  PLAN_TITLE, REPORT_TITLE, extractDocument, extractText, missingSections, section, stripAnsi,
} from '../eval/transcript.mjs';

const REPORT_TEMPLATE = readFileSync(join(REPO_ROOT, 'core', 'templates', 'report.md'), 'utf8');
const PLAN_TEMPLATE = readFileSync(join(REPO_ROOT, 'core', 'templates', 'plan.md'), 'utf8');

const REPORT = `# Báo cáo unit test

## 1. Tóm tắt
ok
## 2. Test đã tạo
## 3. Coverage
14.3% -> 58.9%
## 4. Test fail đã xử lý (\`failed-test-policy=remove\`)
## 5. Nghi vấn bug
## 6. Đơn vị bỏ qua
InvoiceExporter
## 7. Vấn đề và khuyến nghị
## 8. Thay đổi file`;

// Shapes seen in real runs: Claude Code stream-json, Codex exec --json, Kiro plain text with ANSI codes.
const CLAUDE = [
  JSON.stringify({ type: 'system', subtype: 'init' }),
  JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'Đã đọc skill.' }, { type: 'tool_use', name: 'Read' }] } }),
  JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: REPORT }] } }),
  JSON.stringify({ type: 'result', result: REPORT }),
].join('\n');
const CODEX = [
  'Reading additional input from stdin...',
  JSON.stringify({ type: 'thread.started', thread_id: 'abc' }),
  JSON.stringify({ type: 'item.completed', item: { type: 'command_execution', command: 'mvn test' } }),
  JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: REPORT.replace(/^## /gm, '### ').replace('# Báo cáo', '## Báo cáo') } }),
  JSON.stringify({ type: 'turn.completed' }),
].join('\n');
const KIRO = `\x1b[38;5;141m[tool]\x1b[0m Reading SKILL.md\r\n\x1b]0;kiro\x07${REPORT.replace(/\n/g, '\r\n')}\r\n`;

describe('eval transcript', () => {
  it('extracts assistant text from the three formats', () => {
    for (const [format, raw] of [['claude-stream-json', CLAUDE], ['codex-jsonl', CODEX], ['text', KIRO]]) {
      const text = extractText(format, raw);
      const report = extractDocument(text, REPORT_TITLE);
      assert.ok(report, `${format}: report found`);
      assert.deepEqual(missingSections(report, REPORT_TEMPLATE), [], `${format}: all sections, heading level ignored`);
    }
    assert.ok(!extractText('claude-stream-json', CLAUDE).includes('tool_use'));
    assert.equal(stripAnsi('\x1b[1mbold\x1b[0m'), 'bold');
  });

  it('finds a missing section and tolerates the parenthesised suffix', () => {
    const short = REPORT.replace(/## 6\.[\s\S]*$/, '');
    assert.deepEqual(missingSections(short, REPORT_TEMPLATE), ['6. Đơn vị bỏ qua', '7. Vấn đề và khuyến nghị', '8. Thay đổi file']);
  });

  it('splits plan and report printed in the same turn', () => {
    const text = `Bắt đầu.\n## Kế hoạch unit test\n### 1. Tham số đã hiểu\nx\n### 8. Xác nhận\nChế độ tự động.\nĐang sinh test...\n${REPORT}`;
    const plan = extractDocument(text, PLAN_TITLE);
    assert.ok(plan.includes('8. Xác nhận'));
    assert.ok(!plan.includes('Báo cáo'));
    assert.deepEqual(missingSections(plan, PLAN_TEMPLATE).length, 6);
    assert.equal(extractDocument('no headings here', PLAN_TITLE), null);
  });

  it('returns a section body for evidence', () => {
    assert.match(section(REPORT, '3. Coverage'), /14\.3% -> 58\.9%/);
    assert.match(section(REPORT, '6. Đơn vị bỏ qua'), /InvoiceExporter/);
    assert.equal(section(REPORT, '9. Không có'), null);
  });
});

describe('eval transcript heading matching', async () => {
  const { headingMatches } = await import('../eval/transcript.mjs');
  it('accepts a shortened title with the same number but not a renamed or renumbered one', () => {
    assert.ok(headingMatches('6. Thay đổi cấu hình/dependency', '6. Thay đổi cấu hình/dependency cần chấp thuận'));
    assert.ok(headingMatches('4. Test fail đã xử lý (`failed-test-policy=remove`)', '4. Test fail đã xử lý (`failed-test-policy=<remove/disable>`)'));
    assert.ok(!headingMatches('6. Cấu hình/dependency', '6. Thay đổi cấu hình/dependency cần chấp thuận'));
    assert.ok(!headingMatches('8. Tiếp tục', '8. Xác nhận'));
    assert.ok(headingMatches('Đơn vị bỏ qua', '6. Đơn vị bỏ qua'));
    assert.ok(!headingMatches('7. Thay đổi cấu hình', '6. Thay đổi cấu hình/dependency cần chấp thuận'));
  });
});

describe('eval transcript titles with a suffix', () => {
  it('finds a report whose title has a suffix and reports its non-template sections as missing', () => {
    const text = 'Done.\n# Báo cáo unit test — brownfield\n## Tham số đã dùng\nx\n## Đơn vị bỏ qua\nInvoiceExporter';
    const report = extractDocument(text, REPORT_TITLE);
    assert.match(report, /InvoiceExporter/);
    assert.equal(missingSections(report, REPORT_TEMPLATE).length, 7, 'the unnumbered "Đơn vị bỏ qua" still counts');
  });
});

describe('eval transcript documents without a title line', async () => {
  const { findDocument } = await import('../eval/transcript.mjs');
  it('finds an untitled report by its first section and keeps it apart from the plan', () => {
    const text = `## Kế hoạch unit test\n### 1. Tham số đã hiểu\nx\n### 8. Xác nhận\nauto\nĐang làm...\n${REPORT.replace('# Báo cáo unit test\n', '')}`;
    const { doc, titled } = findDocument(text, REPORT_TITLE);
    assert.equal(titled, false);
    assert.ok(doc.startsWith('## 1. Tóm tắt'));
    assert.ok(!doc.includes('Tham số đã hiểu'));
    assert.deepEqual(missingSections(doc, REPORT_TEMPLATE), []);
    assert.equal(findDocument(text, PLAN_TITLE).titled, true);
    assert.deepEqual(findDocument('no headings', REPORT_TITLE), { doc: null, titled: false });
  });

  it('finds an untitled plan and stops before the report', () => {
    const text = `### 1. Tham số đã hiểu\nx\n### 8. Xác nhận\nauto\n${REPORT}`;
    const { doc, titled } = findDocument(text, PLAN_TITLE);
    assert.equal(titled, false);
    assert.ok(doc.includes('8. Xác nhận'));
    assert.ok(!doc.includes('Tóm tắt'));
  });
});
