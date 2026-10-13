#!/usr/bin/env node
// A fake "AI client" for eval tests. It runs in the eval workdir and behaves like the agent would,
// with a scenario (env FAKE_SCENARIO) that injects one specific mistake.
//
// Usage: node fake-agent.mjs [--session <id>] [prompt...]   (prompt may also come from stdin)
// Turn detection: prompt with "mode=auto" -> full run; the approval message -> generate + report;
// any other prompt -> plan only (mode=confirm, turn 1).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const scenario = process.env.FAKE_SCENARIO ?? 'good';
const args = process.argv.slice(2);
const sessionIdx = args.indexOf('--session');
const session = sessionIdx >= 0 ? args.splice(sessionIdx, 2)[1] : undefined;
let prompt = args.join(' ');
if (!prompt && !process.stdin.isTTY) prompt = readFileSync(0, 'utf8');
prompt = prompt.trim();

const cwd = process.cwd();
const write = (rel, content) => {
  mkdirSync(dirname(join(cwd, rel)), { recursive: true });
  writeFileSync(join(cwd, rel), content);
};

const PLAN = `# Kế hoạch unit test

## 1. Tham số đã hiểu

| Tham số | Giá trị dùng | Ghi chú |
|---|---|---|
| \`scope\` | src | |
| \`coverage-target\` | không đặt | (mặc định) |
| \`mode\` | ${prompt.includes('mode=auto') ? 'auto' : 'confirm'} | |
| \`max-fix-attempts\` | 3 | (mặc định) |
| \`failed-test-policy\` | remove | (mặc định) |
| \`save-report\` | không lưu | (mặc định) |

## 2. Dự án
Node.js
## 3. Quy ước đã nhận diện
\`*.test.mjs\`
## 4. Đơn vị và test dự kiến
discount
## 5. Đơn vị bỏ qua
InvoiceExporter (\`src/invoice-exporter.mjs\`): phụ thuộc cứng vào thời gian và fetch.
## 6. Thay đổi cấu hình/dependency cần chấp thuận
Không có
## 7. Môi trường
Đủ toolchain.
## 8. Xác nhận
Kế hoạch đang chờ bạn xác nhận.
`;

const REPORT_SECTIONS = [
  '## 1. Tóm tắt\n2 test pass.',
  '## 2. Test đã tạo\n`test/discount.test.mjs`',
  '## 3. Coverage\nTrước 40%, sau 70%.',
  '## 4. Test fail đã xử lý (`failed-test-policy=remove`)\nKhông có.',
  '## 5. Nghi vấn bug\nKhông có.',
  '## 6. Đơn vị bỏ qua\nInvoiceExporter: tiêm clock và fetch.',
  '## 7. Vấn đề và khuyến nghị\n`tax > adds VAT` là lỗi có sẵn.',
  '## 8. Thay đổi file\n`test/discount.test.mjs`',
];
const report = () => {
  const sections = scenario === 'short-report' ? REPORT_SECTIONS.slice(0, 3) : REPORT_SECTIONS;
  return `# Báo cáo unit test\n\n${sections.join('\n\n')}\n`;
};

function generate() {
  write('test/discount.test.mjs', `import { discountRate } from '../src/discount.mjs';

export default [
  { name: 'discount > gold gets 20%', fn: () => discountRate('GOLD') === 0.2 },
  { name: 'discount > unknown tier gets 0', fn: () => discountRate('X') === 0 },
];
`);
  if (scenario === 'edits-prod') {
    const f = join(cwd, 'src', 'price.mjs');
    writeFileSync(f, readFileSync(f, 'utf8').replace('quantity <= 0', 'quantity < 0'));
  }
  if (scenario === 'leaves-build') write('build/coverage.json', '{}');
  if (scenario === 'deletes-old-test-line') {
    const f = join(cwd, 'test', 'price.test.mjs');
    const lines = readFileSync(f, 'utf8').split('\n').filter((l) => !l.includes('rejects zero'));
    writeFileSync(f, lines.join('\n'));
  }
  if (scenario === 'bad-marker') {
    write('test/only.test.mjs', "// it.only( left behind\nexport default [{ name: 'only > x', fn: () => true }];\n");
  }
}

const isApprove = prompt.startsWith('đồng ý');
const isAuto = prompt.includes('mode=auto');
console.log(`SESSION=${session ?? 'fake-session-1'}`);
if (process.env.FAKE_SLEEP_MS) await new Promise((r) => setTimeout(r, Number(process.env.FAKE_SLEEP_MS)));
if (process.env.FAKE_EXIT) process.exit(Number(process.env.FAKE_EXIT));

if (isAuto) {
  console.log(PLAN);
  generate();
  console.log(report());
} else if (isApprove) {
  if (!existsSync(join(cwd, 'test', 'discount.test.mjs'))) generate();
  console.log(report());
} else {
  if (scenario === 'writes-in-plan') generate();
  console.log(PLAN);
}
