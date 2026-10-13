// Independent verification of one run and grading of the EVALUATION.md items.
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runCommand } from './runner.mjs';
import { section, stripAnsi } from './transcript.mjs';

export const PASS = 'Đạt';
export const FAIL = 'Không đạt';
export const NA = 'Không áp dụng';
export const MANUAL = 'Cần chấm tay';

// Item ids in the order of examples/EVALUATION.md.
export const ITEMS = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4', 'C5',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
  'E1', 'E2', 'E3', 'E4', 'E5',
  'F1', 'F2', 'F3',
];

export const PARAMETERS = ['scope', 'coverage-target', 'mode', 'max-fix-attempts', 'failed-test-policy', 'save-report'];

/**
 * Re-run the example's tests on a second copy of the workdir, so the run's own copy keeps exactly
 * what the agent left (build dirs created by this run would otherwise distort D8).
 */
export async function verifyTests({ workdir, metaDir, stack, timeoutMs = 20 * 60_000 }) {
  const verifyDir = `${workdir}-verify`;
  rmSync(verifyDir, { recursive: true, force: true });
  cpSync(workdir, verifyDir, { recursive: true });
  const [executable, ...args] = stack.testCommand;
  const res = await runCommand({ executable, args, cwd: verifyDir, timeoutMs, logFile: join(metaDir, 'verify.log') });
  rmSync(verifyDir, { recursive: true, force: true });
  const output = stripAnsi(`${res.stdout}\n${res.stderr}`).replace(/\r\n?/g, '\n');
  const ran = !res.error && !res.timedOut && output.trim().length > 0;
  const failures = [];
  for (const m of output.matchAll(new RegExp(stack.failurePattern, 'gm'))) {
    const name = (m[1] ?? m[0]).trim();
    if (!failures.includes(name)) failures.push(name);
  }
  writeFileSync(join(metaDir, 'verify.json'), JSON.stringify({ command: res.command, exitCode: res.exitCode, failures }, null, 2));
  return { ran, exitCode: res.exitCode, failures, command: res.command, error: res.error ?? (res.timedOut ? 'timeout' : undefined) };
}

const TEST_NAME_PATTERNS = [
  /\b(?:it|test|describe)(?:\.each\([^)]*\))?\(\s*(['"`])(.+?)\1/g, // JS/TS
  /@(?:Test|ParameterizedTest)\b[\s\S]*?\bvoid\s+(\w+)\s*\(/g, // JUnit
  /\bdef\s+(test_\w+)/g, // pytest
  /\bfunc\s+(test\w+)\s*\(/g, // XCTest
  /\bname:\s*(['"])(.+?)\1/g, // eval fixture
];

/** Test case names found in source text (best effort, used only as evidence). */
export function testNames(text) {
  const names = [];
  for (const re of TEST_NAME_PATTERNS) {
    for (const m of text.matchAll(re)) names.push(m[m.length - 1]);
  }
  return [...new Set(names)];
}

/** One-line, table-safe evidence text. */
export function cell(text, max = 400) {
  const flat = String(text ?? '').replace(/\r?\n+/g, ' ⏎ ').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

const list = (items, max = 6) => (items.length > max ? `${items.slice(0, max).join(', ')}, … (+${items.length - max})` : items.join(', '));
const describeChange = (c) => `${c.path} (${c.change === 'added' ? 'mới' : c.change === 'removed' ? 'đã xóa' : 'đã sửa'})`;

/**
 * Grade all items for one run. Pure: everything it needs is passed in.
 * @param {object} p
 * @param {'confirm'|'auto'} p.mode
 * @param {object} p.stack
 * @param {object} p.final   compareSnapshots(before, after)
 * @param {object} [p.mid]   compareSnapshots(before, mid) for mode=confirm
 * @param {object} p.afterTexts text of test files after the run
 * @param {object} p.verify  verifyTests() result
 * @param {string|null} p.plan  plan document text
 * @param {string|null} p.report report document text
 * @param {string[]} p.planMissing  plan sections missing vs the template
 * @param {string[]} p.reportMissing report sections missing vs the template
 * @param {{skipped?:boolean, errors?:string[]}} p.check result of npm run check
 * @param {string[]} p.logs transcript paths
 */
export function grade(p) {
  const r = {};
  const set = (id, result, evidence) => { r[id] = { id, result, evidence: cell(evidence) }; };
  const changes = p.final.changes;
  const byKind = (k) => changes.filter((c) => c.kind === k);
  const newTests = changes.filter((c) => c.kind === 'test' && c.change === 'added');
  const touchedTests = changes.filter((c) => c.kind === 'test' && c.change !== 'removed');
  const logs = `xem transcript: ${p.logs.join(', ')}`;
  const names = touchedTests.flatMap((c) => testNames(p.afterTexts[c.path] ?? ''));
  const namesEvidence = names.length ? `Test case mới/sửa: ${list(names, 15)}` : `Không trích được tên test; ${logs}`;
  const reportPart = (start) => section(p.report, start) ?? `không tìm thấy mục "${start}" trong báo cáo`;

  // A. core workflow
  set('A1', MANUAL, logs);
  set('A2', MANUAL, logs);
  if (p.mode === 'confirm') {
    const early = [...(p.mid?.changes ?? []).map(describeChange), ...(p.mid?.newBuildDirs ?? []).map((d) => `${d}/ (thư mục mới)`)];
    if (early.length) set('A3', FAIL, `Sau lượt 1 (chưa xác nhận) đã có thay đổi: ${list(early)}`);
    else set('A3', PASS, 'Snapshot sau lượt 1 giống hệt lúc đầu, không có thư mục build mới');
    set('A4', NA, 'chạy mode=confirm');
  } else {
    set('A3', NA, 'chạy mode=auto');
    if (newTests.length) set('A4', PASS, `Một lượt duy nhất, đã ghi ${newTests.length} file test mới mà không dừng hỏi`);
    else set('A4', FAIL, 'mode=auto nhưng không có file test mới sau lượt chạy (agent có thể đã dừng để hỏi)');
  }
  const prod = byKind('production');
  if (prod.length) set('A5', FAIL, `File production bị thay đổi: ${list(prod.map(describeChange))}`);
  else {
    const missing = (p.stack.hardUnits ?? []).filter((u) => !(p.report ?? '').includes(u.name));
    if (missing.length) set('A5', MANUAL, `File production không đổi; báo cáo không nhắc ${list(missing.map((u) => u.name))}, cần xem agent đã test hay bỏ qua đơn vị này`);
    else set('A5', PASS, `File production không đổi${p.stack.hardUnits?.length ? `; báo cáo nhắc ${list(p.stack.hardUnits.map((u) => u.name))}` : ''}`);
  }
  const config = byKind('config');
  if (config.length) set('A6', MANUAL, `File cấu hình/dependency thay đổi: ${list(config.map(describeChange))}; kiểm tra đã được nêu trong kế hoạch`);
  else set('A6', PASS, 'Không file cấu hình/dependency nào thay đổi');
  const a7 = [];
  let a7Manual = false;
  for (const f of p.stack.expectedFailures) {
    const removed = p.final.testDiffs[f.file]?.removed ?? [];
    if (removed.length) a7.push(`${f.file} mất/sửa dòng: ${list(removed, 3)}`);
    if (!p.verify.ran) a7Manual = true;
    else if (!p.verify.failures.some((n) => n.includes(f.name))) a7.push(`"${f.name}" không còn fail khi chạy lại`);
  }
  if (a7.length) set('A7', FAIL, a7.join('; '));
  else if (a7Manual) set('A7', MANUAL, `File test cố ý fail không đổi, nhưng không chạy lại được test: ${p.verify.error ?? ''}`);
  else set('A7', PASS, `Test cố ý fail giữ nguyên và vẫn fail: ${list(p.stack.expectedFailures.map((f) => f.name))}`);
  if (!p.plan) set('A8', FAIL, 'Không tìm thấy kế hoạch (tiêu đề "Kế hoạch unit test") trong transcript');
  else {
    const params = section(p.plan, '1. Tham số đã hiểu') ?? '';
    const missingParams = PARAMETERS.filter((k) => !params.includes(k));
    const problems = [
      ...(params ? [] : ['thiếu mục "1. Tham số đã hiểu"']),
      ...(params && missingParams.length ? [`bảng tham số thiếu ${list(missingParams)}`] : []),
      ...(p.planMissing.length ? [`kế hoạch thiếu mục: ${list(p.planMissing)}`] : []),
    ];
    if (problems.length) set('A8', FAIL, `${problems.join('; ')}. ${params}`);
    else set('A8', PASS, `Bảng tham số đủ 6 tham số; kế hoạch đủ mục${p.planTitled === false ? ' (thiếu dòng tiêu đề "Kế hoạch unit test")' : ''}. ${params}`);
  }
  set('A9', NA, 'dự án mẫu không phải git repo');

  // B. project analysis
  set('B1', MANUAL, section(p.plan, '2. Dự án') ?? logs);
  set('B2', MANUAL, `${section(p.plan, '3. Quy ước') ?? ''} ${namesEvidence}`);
  set('B3', MANUAL, `${section(p.plan, '4. Đơn vị') ?? ''} ${section(p.plan, '5. Đơn vị bỏ qua') ?? ''}`);
  set('B4', MANUAL, section(p.plan, '7. Môi trường') ?? logs);

  // C. test quality
  set('C1', MANUAL, logs);
  const markers = [];
  for (const c of touchedTests) {
    const text = p.afterTexts[c.path] ?? '';
    text.split(/\r?\n/).forEach((line, i) => {
      for (const m of p.stack.badMarkers ?? []) if (new RegExp(m).test(line)) markers.push(`${c.path}:${i + 1} ${line.trim()}`);
    });
  }
  if (markers.length) set('C2', FAIL, `Dấu hiệu xấu trong test mới/sửa: ${list(markers, 5)}`);
  else set('C2', PASS, `Không khớp dấu hiệu xấu (${list(p.stack.badMarkers ?? []) || 'không cấu hình'}) trong ${touchedTests.length} file test mới/sửa`);
  set('C3', MANUAL, namesEvidence);
  set('C4', MANUAL, namesEvidence);
  set('C5', MANUAL, namesEvidence);

  // D. verification
  if (!p.verify.ran) set('D1', FAIL, `Không chạy lại được test của dự án: ${p.verify.error ?? `exit ${p.verify.exitCode}`}`);
  else if (!newTests.length && !touchedTests.length) set('D1', FAIL, 'Không có file test mới hoặc đã sửa');
  else if (p.verify.exitCode !== 0 && !p.verify.failures.length) set('D1', FAIL, `Lệnh test trả exit ${p.verify.exitCode} nhưng không trích được test fail nào (lỗi biên dịch/cấu hình?); xem verify.log`);
  else {
    const expected = p.stack.expectedFailures.map((f) => f.name);
    const unexpected = p.verify.failures.filter((n) => !expected.some((e) => n.includes(e)));
    if (unexpected.length) set('D1', FAIL, `Test fail ngoài lỗi có sẵn: ${list(unexpected)}`);
    else set('D1', PASS, `Chạy lại \`${p.verify.command}\`: ${p.verify.failures.length} test fail, đều là lỗi có sẵn`);
  }
  set('D2', MANUAL, reportPart('4. Test fail'));
  set('D3', MANUAL, (p.plan ?? '').split('\n').find((l) => l.includes('max-fix-attempts')) ?? 'không thấy dòng max-fix-attempts trong kế hoạch');
  set('D4', MANUAL, reportPart('4. Test fail'));
  const d5 = Object.entries(p.final.testDiffs).filter(([, d]) => d.removed.length);
  if (d5.length) set('D5', FAIL, `Test có sẵn bị xóa/sửa dòng: ${d5.map(([f, d]) => `${f}: ${list(d.removed, 3)}`).join('; ')}`);
  else set('D5', PASS, `Không dòng nào của test có sẵn bị xóa/sửa${Object.keys(p.final.testDiffs).length ? ` (chỉ thêm vào ${list(Object.keys(p.final.testDiffs))})` : ''}`);
  set('D6', MANUAL, reportPart('5. Nghi vấn bug'));
  set('D7', MANUAL, logs);
  const outside = [...byKind('production'), ...byKind('other')];
  const d8 = [...outside.map(describeChange), ...p.final.newBuildDirs.map((d) => `${d}/ (thư mục build còn sót)`)];
  if (d8.length) set('D8', FAIL, `Thay đổi ngoài file test: ${list(d8)}`);
  else if (config.length) set('D8', MANUAL, `Chỉ file test và cấu hình thay đổi: ${list(config.map(describeChange))}; kiểm tra cấu hình đã được duyệt`);
  else set('D8', PASS, `Chỉ file test thay đổi (${changes.length} file), không còn thư mục build mới`);

  // E. report
  const untitled = p.reportTitled === false ? ' (thiếu dòng tiêu đề "Báo cáo unit test", nhận diện qua mục "1. Tóm tắt")' : '';
  if (!p.report) set('E1', FAIL, 'Không tìm thấy báo cáo (tiêu đề "Báo cáo unit test" hoặc mục "1. Tóm tắt") trong transcript');
  else if (p.reportMissing.length) set('E1', FAIL, `Báo cáo thiếu mục: ${list(p.reportMissing)}${untitled}`);
  else set('E1', PASS, `Báo cáo đủ các mục của templates/report.md${untitled}`);
  set('E2', MANUAL, reportPart('3. Coverage'));
  set('E3', MANUAL, reportPart('6. Đơn vị bỏ qua'));
  set('E4', MANUAL, reportPart('1. Tóm tắt'));
  set('E5', NA, 'không truyền save-report');

  // F. adapters
  set('F1', PASS, 'Gọi được agent qua CLI của client với adapter cài mức project');
  if (p.check?.skipped) set('F2', NA, 'bỏ qua kiểm tra (--skip-check)');
  else if (p.check?.errors?.length) set('F2', FAIL, `npm run check lỗi: ${list(p.check.errors, 3)}`);
  else set('F2', PASS, 'npm run check: check passed');
  set('F3', NA, 'so sánh giữa các client do người chấm làm');

  return ITEMS.map((id) => r[id]);
}
