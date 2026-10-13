// One evaluation run end to end: requirements -> workspace -> agent turns -> snapshots -> verify -> grade.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { grade, verifyTests } from './checks.mjs';
import { checkRequirements, clientVersion, runTurns } from './runner.mjs';
import {
  PLAN_TITLE, REPORT_TITLE, extractText, findDocument, missingSections,
} from './transcript.mjs';
import { compareSnapshots, prepareWorkspace, snapshot } from './workspace.mjs';

export function loadTemplates(root) {
  const read = (n) => readFileSync(join(root, 'core', 'templates', n), 'utf8');
  return { plan: read('plan.md'), report: read('report.md') };
}

/** Grade a workdir after the agent ran (shared by automatic runs and --verify). */
export async function verifyWorkdir({ cfg, run, workdir, metaDir, snapOpts, before, mid, planRaw, reportRaw, templates, check, logs }) {
  const client = cfg.clients[run.client];
  const stack = cfg.stacks[run.stack];
  const after = snapshot(workdir, snapOpts);
  const final = compareSnapshots(before, after, stack);
  const midCmp = mid ? compareSnapshots(before, mid, stack) : undefined;
  const verify = await verifyTests({ workdir, metaDir, stack });
  const planText = extractText(client.transcriptFormat, planRaw ?? '');
  const reportText = extractText(client.transcriptFormat, reportRaw ?? '');
  const { doc: plan, titled: planTitled } = findDocument(planText, PLAN_TITLE);
  const { doc: report, titled: reportTitled } = findDocument(reportText, REPORT_TITLE);
  const items = grade({
    mode: run.mode,
    stack,
    final,
    mid: midCmp,
    afterTexts: after.texts,
    verify,
    plan,
    report,
    planTitled,
    reportTitled,
    planMissing: plan ? missingSections(plan, templates.plan) : [],
    reportMissing: report ? missingSections(report, templates.report) : [],
    check,
    logs,
  });
  writeFileSync(join(metaDir, 'result.json'), JSON.stringify({ run, final, mid: midCmp, verify, items }, null, 2));
  return { final, verify, items };
}

/**
 * Evaluate one run. Never throws for client or toolchain problems: those come back as status "not-run".
 * @returns {Promise<{run, status:'ok'|'not-run', reason?, version?, workdir?, metaDir?, turns?, items?, durationMs}>}
 */
export async function evaluateRun({ root, cfg, run, runDir, templates, check }) {
  const started = Date.now();
  const client = cfg.clients[run.client];
  const stack = cfg.stacks[run.stack];
  const base = { run, durationMs: 0 };
  const reason = await checkRequirements(client, stack);
  if (reason) return { ...base, status: 'not-run', reason };
  const version = await clientVersion(client);

  let ws;
  try {
    ws = await prepareWorkspace({ root, cfg, run, runDir });
  } catch (err) {
    return { ...base, status: 'not-run', reason: `không chuẩn bị được bản copy: ${err.message}`, version };
  }
  let mid;
  const agent = await runTurns({
    client, stack, mode: run.mode, workdir: ws.workdir, metaDir: ws.metaDir,
    onBetweenTurns: () => { mid = snapshot(ws.workdir, ws.snapOpts); },
  });
  const common = { ...base, version, workdir: ws.workdir, metaDir: ws.metaDir, turns: agent.turns };
  if (agent.status !== 'ok') return { ...common, status: 'not-run', reason: agent.reason, durationMs: Date.now() - started };

  const first = agent.turns[0].stdout;
  const last = agent.turns.at(-1).stdout;
  const { items, verify } = await verifyWorkdir({
    cfg, run, workdir: ws.workdir, metaDir: ws.metaDir, snapOpts: ws.snapOpts, before: ws.before, mid,
    planRaw: first, reportRaw: last, templates, check, logs: agent.turns.map((t) => t.logFile),
  });
  return { ...common, status: 'ok', items, verify, durationMs: Date.now() - started };
}
