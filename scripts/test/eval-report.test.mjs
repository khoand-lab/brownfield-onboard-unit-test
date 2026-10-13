import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FAIL, ITEMS, MANUAL, NA, PASS } from '../eval/checks.mjs';
import { renderResults, summarize } from '../eval/report.mjs';

const items = (overrides = {}) => ITEMS.map((id) => ({ id, result: overrides[id]?.[0] ?? (id.startsWith('C4') ? MANUAL : id === 'A9' ? NA : PASS), evidence: overrides[id]?.[1] ?? `bằng chứng ${id}` }));
const turn = (name, command) => ({ name, command, exitCode: 0, durationMs: 90_000, logFile: `/tmp/x/${name}.log` });

const RESULTS = [
  {
    run: { client: 'kiro', stack: 'java-spring-boot', mode: 'confirm' }, status: 'ok', version: 'kiro-cli 2.27.1', durationMs: 600_000,
    workdir: '/tmp/r/kiro-java-confirm', metaDir: '/tmp/r/kiro-java-confirm.meta',
    turns: [turn('confirmPlan', 'kiro-cli chat "scope=src"'), turn('confirmApprove', 'kiro-cli chat --resume "đồng ý"')],
    items: items(),
  },
  {
    run: { client: 'codex', stack: 'java-spring-boot', mode: 'auto' }, status: 'ok', version: 'codex-cli 0.160.0', durationMs: 300_000,
    workdir: '/tmp/r/codex', metaDir: '/tmp/r/codex.meta', turns: [turn('auto', 'codex exec ...')],
    items: items({ D8: [FAIL, 'Thay đổi ngoài file test: target/ (thư mục build còn sót)'] }),
  },
  {
    run: { client: 'claude-code', stack: 'react', mode: 'auto' }, status: 'not-run', reason: 'lượt 1 lỗi: exit 1. usage limit | x', durationMs: 1_000,
  },
];
const META = { runId: '20261005-1200', startedAt: '2026-10-05 12:00', agentVersion: '0.1.0', configFile: 'eval.config.json', runDir: '/tmp/r', check: { errors: [] } };

describe('eval report', () => {
  it('summarizes failures, not-run runs, manual items and the exit code', () => {
    const s = summarize(RESULTS);
    assert.deepEqual(s.failed.map((f) => `${f.label} ${f.id}`), ['codex · java-spring-boot · auto D8']);
    assert.deepEqual(s.notRun.map((n) => n.label), ['claude-code · react · auto']);
    assert.equal(s.manual, 2);
    assert.equal(s.exitCode, 1);
    assert.equal(summarize([RESULTS[0]]).exitCode, 0);
  });

  it('renders the summary first, then one section per run', () => {
    const md = renderResults({ results: RESULTS, meta: META });
    const lines = md.split('\n');
    assert.equal(lines[0], '# Kết quả đánh giá tự động: 20261005-1200');
    assert.ok(md.indexOf('## Tóm tắt') < md.indexOf('## kiro · java-spring-boot · confirm'));
    assert.ok(lines.includes(`| kiro · java-spring-boot · confirm | chạy được | ${ITEMS.length - 2} | 0 | 1 | 1 |`));
    assert.ok(lines.includes('| claude-code · react · auto | không chạy được | – | – | – | – |'));
    assert.ok(lines.includes('- codex · java-spring-boot · auto: **D8**: Thay đổi ngoài file test: target/ (thư mục build còn sót)'));
    assert.ok(lines.includes('- claude-code · react · auto: lượt 1 lỗi: exit 1. usage limit \\| x'));
    assert.ok(lines.includes('**Còn 2 mục cần chấm tay.** Mở transcript và bản copy theo đường dẫn ở từng lượt.'));
    assert.ok(lines.includes('- Phiên bản client: kiro-cli 2.27.1'));
    assert.ok(lines.includes('- Lệnh lượt 2 (confirmApprove): `kiro-cli chat --resume "đồng ý"`, exit 0, 1.5 phút'));
    assert.ok(lines.includes('- Bản copy: `/tmp/r/codex`'));
    assert.ok(lines.includes('| D8 | **Không đạt** | Thay đổi ngoài file test: target/ (thư mục build còn sót) |'));
    assert.ok(lines.includes('| A1 | Đạt | bằng chứng A1 |'));
    assert.ok(md.includes('**Không chạy được:** lượt 1 lỗi: exit 1. usage limit \\| x'));
  });
});
