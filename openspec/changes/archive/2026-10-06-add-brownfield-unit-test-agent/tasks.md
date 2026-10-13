# Tasks

## 1. Khung repo

- [x] 1.1 Tạo cấu trúc thư mục `core/{phases,playbooks,templates}`, `adapters/{claude-code,kiro,codex}`, `scripts/`, `examples/`, thêm `dist/` vào `.gitignore`; kiểm chứng bằng cách liệt kê cây thư mục khớp design D1
- [x] 1.2 Viết `README.md` gốc mô tả mục đích, cấu trúc repo, yêu cầu Node ≥ 18 và luồng `core → build → dist → install`; kiểm chứng mọi đường dẫn nhắc tới trong README tồn tại

## 2. Script build, check, install

- [x] 2.1 Viết `scripts/build.mjs` sinh `dist/<client>/brownfield-unit-test/` (SKILL.md từ `core/AGENT.md` + `phases/`, `playbooks/`, `templates/`, `detection.md`) rồi trộn phần bọc từ `adapters/<client>/`, hỗ trợ `--client`; kiểm chứng bằng test `node --test scripts/test/build.test.mjs` với fixture core/adapter nhỏ
- [x] 2.2 Viết `scripts/check.mjs` gồm các kiểm tra: (a) mỗi playbook có đủ các mục bắt buộc theo spec `stack-playbooks`, (b) `core/` không chứa từ khóa tool/cú pháp riêng của client, (c) `dist/` đồng bộ với `core/` và chỉ ra adapter bị lệch; kiểm chứng bằng `node --test scripts/test/check.test.mjs` có fixture pass và fixture fail cho từng kiểm tra
- [x] 2.3 Viết `scripts/install.mjs --client <name> --target <project|user> [--path <dir>] [--uninstall]` sao chép/gỡ `dist/<client>` vào vị trí đích do adapter khai báo; kiểm chứng bằng `node --test scripts/test/install.test.mjs` cài rồi gỡ vào thư mục tạm
- [x] 2.4 Thêm `package.json` (không dependency) với script `build`, `check`, `test`; ghi hướng dẫn dùng script vào `README.md`; kiểm chứng `npm test` và `npm run check` chạy thành công trên Windows (và ghi chú lệnh tương đương cho macOS/Linux)

## 3. Lõi agent (quy trình, tham số, mẫu)

- [x] 3.1 Viết `core/AGENT.md`: frontmatter `name`/`description` cho skill, 5 pha theo thứ tự, nguyên tắc an toàn (không sửa production, không phá test cũ, không che giấu lỗi), bảng 6 tham số và mặc định theo design D4, cách chọn playbook theo nhu cầu; kiểm chứng `npm run check` pass (không chứa từ khóa riêng client) và rà thủ công từng requirement của spec `agent-core-workflow` có câu hướng dẫn tương ứng
- [x] 3.2 Viết `core/phases/01-analyze.md` và `core/detection.md` (bảng dấu hiệu → stack, thứ tự ưu tiên, xử lý monorepo, lấy mẫu ~5 test gần mục tiêu, kiểm tra toolchain, ghi trạng thái git đầu phiên, đo coverage "trước"); kiểm chứng đối chiếu đủ 5 requirement của spec `project-analysis`
- [x] 3.3 Viết `core/phases/02-plan.md` và `core/templates/plan.md` (bảng tham số đã hiểu, quy ước đã nhận diện, danh sách đơn vị/test dự kiến, dependency cần thêm, điểm dừng xác nhận khi `mode=confirm`); kiểm chứng mẫu có đủ mục cho requirement "Xác nhận kế hoạch trước khi sinh test"
- [x] 3.4 Viết `core/phases/03-generate.md` (unit test cô lập, phủ nhánh/biên/lỗi, assertion có ý nghĩa, tuân quy ước, tái sử dụng helper); kiểm chứng đối chiếu requirement chung của spec `stack-playbooks`
- [x] 3.5 Viết `core/phases/04-verify.md` (thứ tự hẹp → rộng, `max-fix-attempts` tính theo file và xử lý giá trị không hợp lệ, `failed-test-policy` remove/disable với chuỗi `TODO(unit-test-agent)`, chạy lại phát hiện flaky, kiểm tra và hoàn tác thay đổi ngoài phạm vi bằng git hoặc danh sách file đã ghi); kiểm chứng đối chiếu đủ requirement và scenario của spec `test-verification`
- [x] 3.6 Viết `core/phases/05-report.md` và `core/templates/report.md` (các mục bắt buộc, coverage trước/sau hoặc lý do không đo được, vấn đề và khuyến nghị, trạng thái "đã gỡ"/"đã disable"/"chưa kiểm chứng", lưu file theo `save-report` tại `.unit-test-agent/reports/`); kiểm chứng đối chiếu đủ requirement của spec `test-reporting`

## 4. Lát cắt đầu: playbook Java Spring Boot và adapter Claude Code

- [x] 4.1 Viết `core/playbooks/java-spring-boot.md` (JUnit 5 + Mockito + AssertJ mặc định, `@WebMvcTest`/`@DataJpaTest` chỉ khi dự án đã dùng và vẫn là test lát cắt, lệnh Maven/Gradle chạy test đơn lẻ và toàn bộ, JaCoCo, cú pháp `@Disabled`/`@Ignore`, lỗi thường gặp); kiểm chứng `npm run check` pass mục playbook
- [x] 4.2 Tạo `examples/java-spring-boot/` brownfield: test cũ theo quy ước riêng, một service dễ test, một class phụ thuộc cứng khó test, một test cũ fail có chủ đích; kiểm chứng `mvn test` (hoặc `gradle test`) chạy và chỉ đúng test cố ý fail bị đỏ
- [x] 4.3 Kiểm chứng lại định dạng thực tế của Claude Code (plugin manifest, `agents/`, `skills/`, `commands/`, vị trí cài project/user) theo tài liệu hiện hành, ghi phiên bản và nguồn vào `adapters/claude-code/SOURCES.md`
- [x] 4.4 Viết adapter `adapters/claude-code/`: `.claude-plugin/plugin.json`, subagent `unit-test-writer`, lệnh `/unit-test` truyền `$ARGUMENTS` dạng `key=value`, khai báo vị trí cài; kiểm chứng `npm run build -- --client claude-code` và `npm run check` pass
- [x] 4.5 Viết `adapters/claude-code/INSTALL.md` (cài/gỡ mức project và user, cách gọi bằng lệnh và subagent, ví dụ tham số); kiểm chứng cài vào `examples/java-spring-boot` bằng đúng các bước trong tài liệu
- [x] 4.6 Viết `examples/EVALUATION.md` (checklist theo scenario của 6 spec) và chạy agent qua Claude Code trên `examples/java-spring-boot` với `mode=confirm` và `mode=auto`; kiểm chứng checklist đạt (dừng chờ xác nhận, tuân quy ước, không sửa production, giữ test cũ fail, báo cáo đủ mục, coverage trước/sau) và ghi kết quả vào `examples/results/claude-code-java-spring-boot.md`

## 5. Playbook backend còn lại

- [x] 5.1 Viết `core/playbooks/nodejs.md` (dò Jest/Vitest/Mocha sẵn có, mặc định Jest hoặc Vitest theo ESM/TS, mock module, fake timer, c8/istanbul, `it.skip`) và `examples/nodejs/`; kiểm chứng `npm run check` pass và chạy agent qua Claude Code đạt checklist, ghi kết quả vào `examples/results/`
- [x] 5.2 Viết `core/playbooks/python.md` (pytest mặc định, tôn trọng unittest nếu dự án dùng, `unittest.mock`/`pytest-mock`, freezegun hoặc tiêm thời gian, pytest-cov, `@pytest.mark.skip`, venv/poetry/uv) và `examples/python/`; kiểm chứng như 5.1

## 6. Playbook frontend

- [x] 6.1 Viết `core/playbooks/angular.md` (Jasmine/Karma hoặc Jest theo dự án, TestBed, mock service/HttpClient, component/pipe/service, `ng test --include`, coverage, `xit`) và `examples/angular/`; kiểm chứng `npm run check` pass và chạy agent qua Claude Code đạt checklist
- [x] 6.2 Viết `core/playbooks/react.md` (Jest/Vitest + React Testing Library, mock fetch/module, hook, test theo hành vi người dùng, không snapshot tràn lan) và `examples/react/`; kiểm chứng như 6.1
- [x] 6.3 Viết `core/playbooks/vue.md` (Vitest/Jest + Vue Test Utils, Vue 2/3, Pinia/Vuex mock, composable) và `examples/vue/`; kiểm chứng như 6.1

## 7. Playbook mobile

- [x] 7.1 Viết `core/playbooks/android-java.md` (JUnit 4/5 + Mockito cho unit test JVM ở `src/test`, Robolectric chỉ khi dự án đã dùng, không instrumented test, `./gradlew testDebugUnitTest --tests`, JaCoCo) và `examples/android-java/`; kiểm chứng `npm run check` pass và chạy agent qua Claude Code đạt checklist (ghi rõ nếu máy thiếu Android SDK thì kết quả là "chưa kiểm chứng" đúng như spec)
- [x] 7.2 Viết `core/playbooks/ios-swift.md` (XCTest mặc định, Swift Testing nếu dự án dùng, protocol-based mock, `xcodebuild test -only-testing`, `swift test` cho SPM, coverage xccov, `XCTSkip`, yêu cầu macOS) và `examples/ios-swift/`; kiểm chứng `npm run check` pass và chạy agent trên macOS, hoặc xác nhận agent báo thiếu toolchain đúng spec khi chạy trên Windows
- [x] 7.3 Viết `core/playbooks/flutter.md` (flutter_test, mocktail/mockito theo dự án, widget test không cần thiết bị, `flutter test --coverage`, `skip:`) và `examples/flutter/`; kiểm chứng như 7.1

## 8. Adapter Kiro

- [x] 8.1 Kiểm chứng lại định dạng thực tế của Kiro (skill, `.kiro/prompts`, `.kiro/steering`, custom agent JSON của Kiro CLI, vị trí cài project/user) và ghi vào `adapters/kiro/SOURCES.md`
- [x] 8.2 Viết adapter `adapters/kiro/` (skill, prompt `unit-test`, custom agent tùy chọn) và `adapters/kiro/INSTALL.md`; kiểm chứng `npm run build -- --client kiro`, `npm run check` pass và cài đúng theo tài liệu vào một dự án mẫu
- [x] 8.3 Chạy agent qua Kiro trên `examples/java-spring-boot` và ít nhất một dự án frontend; kiểm chứng đạt checklist `EVALUATION.md` và ghi kết quả vào `examples/results/`

## 9. Adapter Codex

- [x] 9.1 Kiểm chứng lại định dạng thực tế của Codex (skill, custom prompt, `AGENTS.md`, vị trí cài project/user) và ghi vào `adapters/codex/SOURCES.md`
- [x] 9.2 Viết adapter `adapters/codex/` (skill, prompt `unit-test`, đoạn gợi ý cho `AGENTS.md`) và `adapters/codex/INSTALL.md`; kiểm chứng `npm run build -- --client codex`, `npm run check` pass và cài đúng theo tài liệu vào một dự án mẫu
- [x] 9.3 Chạy agent qua Codex trên `examples/java-spring-boot` và ít nhất một dự án frontend; kiểm chứng đạt checklist `EVALUATION.md` và ghi kết quả vào `examples/results/`

## 10. Hợp đồng adapter cho client mới

- [x] 10.1 Viết `adapters/CONTRACT.md` (khả năng tối thiểu của client, cách nạp lõi và playbook, cách truyền tham số, phương án dự phòng khi client không hỗ trợ skill, các bước thêm client mới); kiểm chứng bằng cách tạo adapter thử `adapters/_example-generic/` chỉ theo tài liệu, build thành công mà không sửa `core/`, rồi xóa adapter thử

## 11. Kiểm tra tích hợp giữa các client

- [x] 11.1 Chạy cùng input (`scope`, `mode=auto`, tham số mặc định) trên `examples/java-spring-boot` qua Claude Code, Kiro và Codex; kiểm chứng cả ba thực hiện đủ 5 pha và báo cáo có cùng các mục bắt buộc, ghi so sánh vào `examples/results/cross-client.md`
- [x] 11.2 Chạy thử `failed-test-policy=disable` và `max-fix-attempts` không hợp lệ (ví dụ `0`) trên một client bất kỳ; kiểm chứng test fail được disable kèm `TODO(unit-test-agent)`, giá trị không hợp lệ quay về 3 và được ghi trong kế hoạch
- [x] 11.3 Chạy `openspec validate add-brownfield-unit-test-agent --strict`, `npm test`, `npm run check` lần cuối; kiểm chứng tất cả pass
