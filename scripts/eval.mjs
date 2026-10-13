#!/usr/bin/env node
// Evaluate the brownfield-unit-test agent on example projects (see examples/EVALUATION.md, "Chạy tự động").
//
// Automatic runs:
//   node scripts/eval.mjs --client <a,b> --stack <x,y> [--mode confirm|auto|both] [--out <file>] [--dry-run]
// Verify-only (you run the agent yourself):
//   node scripts/eval.mjs --prepare --client <name> --stack <name> --mode <confirm|auto> [--adapter <name>]
//   node scripts/eval.mjs --mark-mid <workdir>          (mode=confirm: after the plan turn, before approving)
//   node scripts/eval.mjs --verify <workdir> --report-output <file> [--plan-output <file>]
// Other options: --config <file> (default eval.config.json), --run-dir <dir>, --skip-check.
// Exit codes: 0 all graded items pass or need manual review, 1 some item failed or a run could not run, 2 usage/config error.
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from './build.mjs';
import { runChecks } from './check.mjs';
import { REPO_ROOT, parseArgs } from './lib.mjs';
import {
  EvalConfigError, MODES, fill, listArg, loadConfig, promptFor, selectRuns,
} from './eval/config.mjs';
import { evaluateRun, loadTemplates, verifyWorkdir } from './eval/evaluate.mjs';
import { renderResults, runLabel, summarize } from './eval/report.mjs';
import { displayCommand } from './eval/runner.mjs';
import { defaultRunDir, prepareWorkspace, snapshot } from './eval/workspace.mjs';

class UsageError extends Error {}

// Time-ordered and unique: two evals started in the same second must not share a run directory.
export function newRunId(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  return `${stamp}-${randomBytes(2).toString('hex')}`;
}

function agentVersion(root) {
  try {
    return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version ?? 'không rõ';
  } catch {
    return 'không rõ';
  }
}

function turnsFor(mode) {
  return mode === 'auto' ? ['auto'] : ['confirmPlan', 'confirmApprove'];
}

function dryRun(cfg, runs, log) {
  log(`Dry run: ${runs.length} lượt, không tạo bản copy và không gọi agent.`);
  for (const run of runs) {
    const client = cfg.clients[run.client];
    const stack = cfg.stacks[run.stack];
    log(`\n${runLabel(run)}`);
    for (const t of turnsFor(run.mode)) {
      const prompt = promptFor(client, stack, t);
      const args = client.turns[t].map((a) => fill(a, { prompt, sessionId: '<session-id>', workdir: '<workdir>' }));
      const stdin = client.promptVia === 'stdin' ? `   (stdin: ${JSON.stringify(prompt)})` : '';
      log(`  ${t}: ${displayCommand(client.executable, args)}${stdin}`);
    }
  }
}

function runCheck(root, skip) {
  if (skip) return { skipped: true };
  build({ root });
  const { errors } = runChecks({ root });
  return { errors };
}

async function runAll({ root, cfg, runs, args, log }) {
  const runId = newRunId();
  const baseDir = typeof args['run-dir'] === 'string' ? resolve(args['run-dir'], runId) : defaultRunDir(runId);
  mkdirSync(baseDir, { recursive: true });
  const out = resolve(typeof args.out === 'string' ? args.out : join(root, '.eval', runId, 'results.md'));

  log(`Sẽ chạy ${runs.length} lượt đánh giá: ${runs.map(runLabel).join('; ')}`);
  log('Cảnh báo: agent chạy với quyền rộng theo eval.config.json (ví dụ --trust-all-tools, danger-full-access), chỉ trên bản copy tại');
  log(`  ${baseDir}`);
  log('Mỗi lượt gọi agent thật và tốn hạn mức/credit của client.');

  const check = runCheck(root, args['skip-check']);
  if (check.errors?.length) log(`npm run check lỗi: ${check.errors.join('; ')}`);
  const templates = loadTemplates(root);
  const results = [];
  for (const [i, run] of runs.entries()) {
    log(`[${i + 1}/${runs.length}] ${runLabel(run)}…`);
    const res = await evaluateRun({ root, cfg, run, runDir: baseDir, templates, check });
    const s = summarize([res]);
    log(res.status === 'ok' ? `  xong: ${s.failed.length} mục không đạt, ${s.manual} mục cần chấm tay` : `  không chạy được: ${res.reason}`);
    results.push(res);
    writeFileSync(join(baseDir, 'results.json'), JSON.stringify(results, null, 2));
  }
  const meta = { runId, startedAt: new Date().toISOString(), agentVersion: agentVersion(root), configFile: cfg.file, runDir: baseDir, check };
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, renderResults({ results, meta }));
  const s = summarize(results);
  log(`\nKết quả: ${out}`);
  log(`${results.length} lượt, ${s.notRun.length} không chạy được, ${s.failed.length} mục không đạt, ${s.manual} mục cần chấm tay.`);
  for (const f of s.failed) log(`  ✖ ${f.label} ${f.id}: ${f.evidence}`);
  return s.exitCode;
}

// ---- verify-only ----

function clientFor(cfg, args) {
  const name = args.client;
  if (cfg.clients[name]) return { name, client: cfg.clients[name] };
  if (typeof args.adapter !== 'string') {
    throw new UsageError(`client "${name}" không có trong cấu hình; với --prepare hãy truyền thêm --adapter <tên adapter>. Client có sẵn: ${Object.keys(cfg.clients).join(', ')}`);
  }
  return { name, client: { adapter: args.adapter, transcriptFormat: 'text', manual: true } };
}

async function prepareOnly({ root, cfg, args, log }) {
  if (typeof args.client !== 'string' || typeof args.stack !== 'string' || !MODES.includes(args.mode)) {
    throw new UsageError('--prepare cần --client, --stack và --mode confirm|auto');
  }
  const { name, client } = clientFor(cfg, args);
  cfg.clients[name] = client;
  selectRuns(cfg, { clients: [name], stacks: [args.stack], mode: args.mode });
  const baseDir = typeof args['run-dir'] === 'string' ? resolve(args['run-dir']) : defaultRunDir(`manual-${newRunId()}`);
  const run = { client: name, stack: args.stack, mode: args.mode };
  const ws = await prepareWorkspace({ root, cfg, run, runDir: baseDir });
  writeFileSync(join(ws.metaDir, 'client.json'), JSON.stringify(client, null, 2));
  const stack = cfg.stacks[args.stack];
  log(`Bản copy đã sẵn sàng: ${ws.workdir}`);
  log(`Chạy agent trong thư mục đó với: scope=${stack.scope}${args.mode === 'auto' ? ' mode=auto' : ''}`);
  if (args.mode === 'confirm') log(`Sau lượt kế hoạch, trước khi xác nhận: node scripts/eval.mjs --mark-mid "${ws.workdir}"`);
  log(`Khi xong: node scripts/eval.mjs --verify "${ws.workdir}" --report-output <file báo cáo>${args.mode === 'confirm' ? ' --plan-output <file kế hoạch>' : ''}`);
  return ws.workdir;
}

function readMeta(workdir) {
  const metaDir = `${resolve(workdir)}.meta`;
  const file = join(metaDir, 'before.json');
  if (!existsSync(file)) throw new UsageError(`không thấy ${file}; thư mục này có được tạo bằng --prepare không?`);
  return { metaDir, ...JSON.parse(readFileSync(file, 'utf8')) };
}

function markMid(workdir, log) {
  const meta = readMeta(workdir);
  const mid = snapshot(resolve(workdir), meta.snapOpts);
  writeFileSync(join(meta.metaDir, 'mid.json'), JSON.stringify(mid, null, 2));
  log(`Đã lưu snapshot sau lượt kế hoạch: ${join(meta.metaDir, 'mid.json')}`);
}

/** Pasted text or a saved transcript: JSON-lines transcripts use the client format, anything else is plain text. */
function readOutput(file, client) {
  if (typeof file !== 'string') return undefined;
  const raw = readFileSync(resolve(file), 'utf8');
  const first = raw.split('\n').find((l) => l.trim());
  return { raw, format: first?.trim().startsWith('{') ? client.transcriptFormat : 'text' };
}

async function verifyOnly({ root, cfg, args, log }) {
  const workdir = resolve(args.verify);
  const meta = readMeta(workdir);
  const client = cfg.clients[meta.run.client] ?? JSON.parse(readFileSync(join(meta.metaDir, 'client.json'), 'utf8'));
  cfg.clients[meta.run.client] = client;
  const midFile = join(meta.metaDir, 'mid.json');
  const mid = existsSync(midFile) ? JSON.parse(readFileSync(midFile, 'utf8')) : undefined;
  if (meta.run.mode === 'confirm' && !mid) log('Cảnh báo: chưa có snapshot sau lượt kế hoạch (--mark-mid), mục A3 sẽ không kiểm được.');
  const report = readOutput(args['report-output'], client);
  const plan = readOutput(args['plan-output'], client) ?? report;
  const verifyCfg = { ...cfg, clients: { ...cfg.clients, [meta.run.client]: { ...client, transcriptFormat: report?.format ?? 'text' } } };
  const check = runCheck(root, args['skip-check']);
  const { items } = await verifyWorkdir({
    cfg: verifyCfg, run: meta.run, workdir, metaDir: meta.metaDir, snapOpts: meta.snapOpts, before: meta.before,
    mid: mid ?? (meta.run.mode === 'confirm' ? meta.before : undefined),
    planRaw: plan?.raw, reportRaw: report?.raw, templates: loadTemplates(root), check,
    logs: [args['plan-output'], args['report-output']].filter((x) => typeof x === 'string'),
  });
  const result = { run: meta.run, status: 'ok', items, workdir, metaDir: meta.metaDir, turns: [], durationMs: 0, version: 'chạy tay' };
  if (meta.run.mode === 'confirm' && !mid) {
    const a3 = items.find((i) => i.id === 'A3');
    Object.assign(a3, { result: 'Cần chấm tay', evidence: 'không có snapshot sau lượt kế hoạch (--mark-mid)' });
  }
  const out = resolve(typeof args.out === 'string' ? args.out : join(meta.metaDir, 'results.md'));
  const runId = `${basename(workdir)}-verify`;
  writeFileSync(out, renderResults({ results: [result], meta: { runId, startedAt: new Date().toISOString(), agentVersion: agentVersion(root), configFile: cfg.file, runDir: dirname(workdir), check } }));
  const s = summarize([result]);
  log(`Kết quả: ${out}`);
  log(`${s.failed.length} mục không đạt, ${s.manual} mục cần chấm tay.`);
  for (const f of s.failed) log(`  ✖ ${f.id}: ${f.evidence}`);
  return s.exitCode;
}

export async function main(argv, { log = console.log, error = console.error } = {}) {
  const args = parseArgs(argv);
  const root = resolve(typeof args.root === 'string' ? args.root : REPO_ROOT);
  try {
    if (typeof args['mark-mid'] === 'string') {
      markMid(args['mark-mid'], log);
      return 0;
    }
    const cfg = loadConfig(typeof args.config === 'string' ? args.config : join(root, 'eval.config.json'));
    if (typeof args.verify === 'string') return await verifyOnly({ root, cfg, args, log });
    if (args.prepare) {
      await prepareOnly({ root, cfg, args, log });
      return 0;
    }
    const runs = selectRuns(cfg, { clients: listArg(args.client), stacks: listArg(args.stack), mode: typeof args.mode === 'string' ? args.mode : 'both' });
    if (args['dry-run']) {
      dryRun(cfg, runs, log);
      return 0;
    }
    return await runAll({ root, cfg, runs, args, log });
  } catch (err) {
    if (err instanceof EvalConfigError || err instanceof UsageError) {
      error(`eval: ${err.message}`);
      return 2;
    }
    throw err;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
