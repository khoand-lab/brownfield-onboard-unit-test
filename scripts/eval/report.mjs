// Markdown output of an evaluation: summary first, then one section per run in the EVALUATION.md format.
import { FAIL, MANUAL, NA, PASS, cell } from './checks.mjs';

export const runLabel = (run) => `${run.client} · ${run.stack} · ${run.mode}`;

const minutes = (ms) => `${(ms / 60_000).toFixed(1)} phút`;

/** Counts and lists used by both the Markdown summary and the console output / exit code. */
export function summarize(results) {
  const failed = [];
  const notRun = [];
  let manual = 0;
  for (const r of results) {
    if (r.status !== 'ok') {
      notRun.push({ label: runLabel(r.run), reason: r.reason });
      continue;
    }
    for (const i of r.items) {
      if (i.result === FAIL) failed.push({ label: runLabel(r.run), id: i.id, evidence: i.evidence });
      if (i.result === MANUAL) manual++;
    }
  }
  return { failed, notRun, manual, exitCode: failed.length || notRun.length ? 1 : 0 };
}

const count = (r, result) => r.items?.filter((i) => i.result === result).length ?? '–';

export function renderResults({ results, meta }) {
  const s = summarize(results);
  const out = [];
  out.push(`# Kết quả đánh giá tự động: ${meta.runId}`, '');
  out.push(`- Thời điểm: ${meta.startedAt}`);
  out.push(`- Phiên bản agent (package.json): ${meta.agentVersion}`);
  out.push(`- Cấu hình: \`${meta.configFile}\``);
  out.push(`- Thư mục các lượt chạy: \`${meta.runDir}\``);
  out.push(`- \`npm run check\`: ${meta.check?.skipped ? 'bỏ qua (--skip-check)' : meta.check?.errors?.length ? `lỗi (${meta.check.errors.length})` : 'pass'}`, '');

  out.push('## Tóm tắt', '');
  out.push(`| Lượt | Trạng thái | ${PASS} | ${FAIL} | ${MANUAL} | ${NA} |`, '|---|---|---|---|---|---|');
  for (const r of results) {
    const status = r.status === 'ok' ? 'chạy được' : 'không chạy được';
    out.push(`| ${runLabel(r.run)} | ${status} | ${count(r, PASS)} | ${count(r, FAIL)} | ${count(r, MANUAL)} | ${count(r, NA)} |`);
  }
  out.push('');
  out.push(s.failed.length ? `**Mục không đạt (${s.failed.length}):**` : '**Mục không đạt:** không có.');
  for (const f of s.failed) out.push(`- ${f.label}: **${f.id}**: ${f.evidence}`);
  out.push('');
  out.push(s.notRun.length ? `**Lượt không chạy được (${s.notRun.length}):**` : '**Lượt không chạy được:** không có.');
  for (const n of s.notRun) out.push(`- ${n.label}: ${cell(n.reason)}`);
  out.push('', `**Còn ${s.manual} mục cần chấm tay.** Mở transcript và bản copy theo đường dẫn ở từng lượt.`, '');

  for (const r of results) {
    out.push(`## ${runLabel(r.run)}`, '');
    out.push(`- Phiên bản client: ${r.version ?? 'không rõ'}`);
    for (const [i, t] of (r.turns ?? []).entries()) {
      out.push(`- Lệnh lượt ${i + 1} (${t.name}): \`${t.command}\`, exit ${t.exitCode}, ${minutes(t.durationMs)}`);
    }
    out.push(`- Tổng thời gian: ${minutes(r.durationMs ?? 0)}`);
    if (r.workdir) out.push(`- Bản copy: \`${r.workdir}\``, `- Transcript và kết quả kiểm chứng: \`${r.metaDir}\``);
    out.push('');
    if (r.status !== 'ok') {
      out.push(`**Không chạy được:** ${cell(r.reason, 1000)}`, '');
      continue;
    }
    out.push('| # | Kết quả | Bằng chứng |', '|---|---|---|');
    for (const i of r.items) out.push(`| ${i.id} | ${i.result === FAIL ? `**${i.result}**` : i.result} | ${i.evidence} |`);
    out.push('');
  }
  return `${out.join('\n')}\n`;
}
