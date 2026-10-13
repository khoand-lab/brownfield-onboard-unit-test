// Turn raw client output into the agent's text, and find the plan / report documents in it.

/** Remove ANSI colour/cursor codes and OSC sequences (Kiro prints these). */
export function stripAnsi(text) {
  return text.replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '').replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');
}

function jsonLines(raw) {
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim().startsWith('{')) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // not a JSON event (progress output); ignore
    }
  }
  return out;
}

/** The assistant's visible text from one turn's stdout, according to the client's transcript format. */
export function extractText(format, raw) {
  if (format === 'claude-stream-json') {
    const parts = [];
    let result = '';
    for (const ev of jsonLines(raw)) {
      if (ev.type === 'assistant') {
        for (const c of ev.message?.content ?? []) if (c.type === 'text' && c.text) parts.push(c.text);
      } else if (ev.type === 'result' && typeof ev.result === 'string') result = ev.result;
    }
    return parts.length ? parts.join('\n\n') : result;
  }
  if (format === 'codex-jsonl') {
    return jsonLines(raw)
      .filter((ev) => ev.type === 'item.completed' && ev.item?.type === 'agent_message' && ev.item.text)
      .map((ev) => ev.item.text)
      .join('\n\n');
  }
  return stripAnsi(raw).replace(/\r\n/g, '\n');
}

export const PLAN_TITLE = 'Kế hoạch unit test';
export const REPORT_TITLE = 'Báo cáo unit test';

const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;

export function normalizeHeading(text) {
  return text
    .replace(/[`*_]/g, '')
    .split('(')[0]
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** All Markdown headings in a text, any level. */
export function headings(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const m = HEADING.exec(line);
    if (m) out.push({ level: m[1].length, text: m[2] });
  }
  return out;
}

/**
 * The last document titled `title` in the text: from its heading up to the heading of the other
 * document (plan <-> report) or the end. Returns null when the title never appears as a heading.
 */
// First section of each template: used to find a document whose title line was left out.
const FIRST_SECTION = { [PLAN_TITLE]: '1. Tham số đã hiểu', [REPORT_TITLE]: '1. Tóm tắt' };

/**
 * Like extractDocument, but when the title heading is missing it starts at the last heading that
 * matches the template's first section. `titled` tells whether the title line was there.
 */
export function findDocument(text, title) {
  const doc = extractDocument(text, title);
  if (doc) return { doc, titled: true };
  const lines = text.split('\n');
  let start = -1;
  lines.forEach((line, i) => {
    const m = HEADING.exec(line);
    if (m && headingMatches(m[2], FIRST_SECTION[title])) start = i;
  });
  if (start < 0) return { doc: null, titled: false };
  const rest = lines.slice(start).join('\n');
  const other = title === PLAN_TITLE ? REPORT_TITLE : PLAN_TITLE;
  const otherAt = rest.split('\n').findIndex((l, i) => {
    const m = HEADING.exec(l);
    return i > 0 && m && (normalizeHeading(m[2]).startsWith(normalizeHeading(other)) || headingMatches(m[2], FIRST_SECTION[other]));
  });
  return { doc: (otherAt > 0 ? rest.split('\n').slice(0, otherAt).join('\n') : rest).trim(), titled: false };
}

export function extractDocument(text, title) {
  const lines = text.split('\n');
  const want = normalizeHeading(title);
  const others = [PLAN_TITLE, REPORT_TITLE].map(normalizeHeading).filter((t) => t !== want);
  // A title with a suffix ("Báo cáo unit test — brownfield") still counts; its sections are checked separately.
  const isTitle = (text, title) => normalizeHeading(text).startsWith(title);
  let start = -1;
  lines.forEach((line, i) => {
    const m = HEADING.exec(line);
    if (m && isTitle(m[2], want)) start = i;
  });
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = HEADING.exec(lines[i]);
    if (m && others.some((o) => isTitle(m[2], o))) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

/** Section headings a document must contain: the level-2 headings of the template. */
export function requiredSections(templateText) {
  return headings(templateText).filter((h) => h.level === 2).map((h) => h.text);
}

/**
 * Whether a document heading stands for a template heading: equal after normalisation, or the same
 * section number with one title a prefix of the other ("6. Thay đổi cấu hình/dependency" for
 * "6. Thay đổi cấu hình/dependency cần chấp thuận"). A renamed section ("6. Cấu hình") does not match.
 */
export function headingMatches(docHeading, templateHeading) {
  const a = normalizeHeading(docHeading);
  const b = normalizeHeading(templateHeading);
  if (a === b) return true;
  const num = /^(\d+)\.\s*/;
  const [na, nb] = [num.exec(a), num.exec(b)];
  if (!na && nb && a === b.slice(nb[0].length)) return true; // "Đơn vị bỏ qua" for "6. Đơn vị bỏ qua"
  if (!na || !nb || na[1] !== nb[1]) return false;
  const [ta, tb] = [a.slice(na[0].length), b.slice(nb[0].length)];
  return ta.length > 0 && tb.length > 0 && (ta.startsWith(tb) || tb.startsWith(ta));
}

/** Template sections whose heading is missing from the document (heading level is ignored). */
export function missingSections(doc, templateText) {
  const present = headings(doc ?? '').map((h) => h.text);
  return requiredSections(templateText).filter((s) => !present.some((p) => headingMatches(p, s)));
}

/** Body of the section whose heading starts with the given text (e.g. "3. Coverage"), up to the next heading of the same or higher level. */
export function section(doc, startsWith) {
  if (!doc) return null;
  const lines = doc.split('\n');
  const want = normalizeHeading(startsWith);
  for (let i = 0; i < lines.length; i++) {
    const m = HEADING.exec(lines[i]);
    if (!m || !normalizeHeading(m[2]).startsWith(want)) continue;
    const level = m[1].length;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      const n = HEADING.exec(lines[j]);
      if (n && n[1].length <= level) {
        end = j;
        break;
      }
    }
    return lines.slice(i, end).join('\n').trim();
  }
  return null;
}
