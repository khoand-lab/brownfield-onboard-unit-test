# Design

## Context

- Động cơ của change: xem `proposal.md`. Hành vi mới duy nhất: xem `specs/agent-core-workflow/spec.md` (requirement "Không can thiệp tiến trình ngoài phiên").
- Hạ tầng đã có:
  - `npm run eval` (spec `agent-evaluation`): chạy agent headless, tự kiểm chứng, đánh dấu "Cần chấm tay" kèm trích đoạn.
  - `eval.config.json`: đã cấu hình 3 client và 6 stack. Lệnh test và `failurePattern` của 6 stack này đã được kiểm trên output thật.
  - Kết quả chấm tay của Claude Code cho cả 9 stack nằm trong `examples/results/`. Đây là mốc để so sánh.
- Ràng buộc đã biết từ các đợt trước:
  - Codex chỉ chạy được Maven/Gradle với `danger-full-access`. Chính sách lệnh của Codex có thể chặn `Remove-Item`, khiến thư mục build bị bỏ lại.
  - Hạn mức Codex từng hết giữa chừng ở cả hai tài khoản.
  - Kiro resume theo thư mục, và đã có lúc bỏ mục 8 của kế hoạch hoặc viết báo cáo không theo template.
  - `android-java` chạy bằng `gradlew.bat :app:testDebugUnitTest`; dự án có sẵn `local.properties` trỏ tới Android SDK của máy. `flutter` chạy bằng `flutter test`, cần `flutter pub get` trước.

## Goals / Non-Goals

**Goals:**
- Mỗi tổ hợp Kiro/Codex × stack trong phạm vi có một file kết quả đầy đủ checklist A–F, ở cùng mức chi tiết như kết quả của Claude Code.
- Lỗi chung của lõi (lặp lại trên từ 2 client trở lên, hoặc vi phạm spec an toàn) được sửa trong `core/` và được kiểm chứng lại bằng một lượt chạy.
- Quy tắc an toàn mới về tiến trình có mặt trong lõi và được kiểm chứng.

**Non-Goals:**
- Không đánh giá `ios-swift` trên Kiro/Codex, vì cần macOS và Xcode.
- Không chạy lại Claude Code cho các stack đã có kết quả, trừ lượt hồi quy sau khi sửa lõi (xem D5).
- Không thay đổi công cụ eval, trừ khi có lỗi làm sai kết luận. Khi đó sửa kèm test, theo đúng requirement của `agent-evaluation`.
- Không tối ưu chi phí hay thời gian chạy của agent.

## Decisions

### D1. Quy tắc tiến trình: đặt trong `AGENT.md` (nguyên tắc an toàn) và `04-verify.md` (cách xử lý lệnh treo)

- `core/AGENT.md`: thêm một gạch đầu dòng vào danh sách nguyên tắc an toàn, đặt cạnh "không sửa production" và "không phá test có sẵn". Gạch này nêu rõ: không dừng tiến trình không do mình khởi chạy, không chọn tiến trình theo tên hay danh sách tiến trình của hệ thống.
- `core/phases/04-verify.md`: thêm mục "Lệnh chạy quá lâu" ở bước 1 và bước 5. Ưu tiên giới hạn thời gian của chính lệnh. Không dừng được thì báo người dùng và đánh dấu test bị ảnh hưởng là "chưa kiểm chứng".
- Lõi phải độc lập với client, nên không nêu tên lệnh cụ thể như `Stop-Process` hay `kill`. Chỉ mô tả hành động "dừng tiến trình". `npm run check` đảm bảo điều này.
- **Lý do:** nguyên tắc an toàn được đọc ngay khi skill được nạp. Mục trong `04-verify` là nơi agent quyết định khi lệnh bị treo, đúng thời điểm Codex đã vi phạm.
- **Phương án đã cân nhắc:** chỉ đặt trong playbook từng stack. Cách này lặp lại 9 lần và dễ sót stack.

### D2. Cấu hình `android-java` và `flutter`: chép lệnh từ kết quả Claude Code, kiểm pattern trên output thật

- `android-java`:
  - `testCommand`: `["gradlew.bat", ":app:testDebugUnitTest"]`. Lệnh dùng đường dẫn tương đối nên runner tìm nó theo bản copy.
  - `buildDirs`: `["build", ".gradle"]`. `local.properties` được giữ trong bản copy, vì nó có từ trước và trỏ tới SDK của máy.
  - Pattern trích test fail lấy theo dòng `<Class> > <method> FAILED` của Gradle.
- `flutter`:
  - `deps`: `{ "dir": ".dart_tool", "install": [["flutter", "pub", "get"]] }`.
  - `testCommand`: `["flutter", "test"]`.
  - Pattern theo dòng lỗi của `flutter test`.
- Cả hai stack đều phải qua bước kiểm pattern giống 6 stack hiện có: chạy `verifyTests` trên bản copy sạch, và chỉ test cố ý fail được phép xuất hiện. Không viết pattern theo suy đoán.
- **Lý do:** đáp ứng requirement "Cấu hình tách khỏi công cụ". Pattern sai sẽ làm D1/A7 sai, nên phải kiểm trên dữ liệu thật.

### D3. Thứ tự chạy: Kiro trước, Codex sau; mỗi stack chạy cả hai chế độ trong một lệnh

- Kiro (`npm run eval -- --client kiro --stack python,angular,vue,android-java,flutter --mode both`) không tốn hạn mức của tài khoản Codex, và lỗi phát hiện ở Kiro có thể được sửa trước khi chạy Codex.
- Codex chạy từng stack một (`--stack <một stack>`), để hết hạn mức thì chỉ mất một lượt. Lượt "không chạy được" vì hạn mức được ghi lại và chạy bù sau, không thay bằng kết luận suy đoán.
- Các lượt chạy tuần tự, theo non-goal của `agent-evaluation`.

### D4. Chấm tay: kết quả tự chấm là nền, người chấm điền các mục "Cần chấm tay" và đối chiếu các mục "Không đạt"

- Với mỗi lượt:
  - Lấy bảng trong `.eval/<runId>/results.md`.
  - Đối chiếu độc lập mọi mục "Không đạt" (transcript, `diff`, `ls`), như đã làm ở `eval-automation-check.md`.
  - Điền các mục "Cần chấm tay" bằng cách đọc file test và báo cáo.
- File `examples/results/<client>-<stack>.md` dùng **mẫu chấm tay** trong `EVALUATION.md` (bảng `| # | Lần 1 | Lần 2 | Bằng chứng |`), ghi model, giống các file Claude Code. Như vậy kết quả của ba client đọc được theo cùng một cách.
- Kết luận tự chấm nào bị người chấm đảo ngược thì đó là lỗi của công cụ: ghi vào `eval-automation-check.md` và sửa theo ngoại lệ đã nêu ở Non-Goals (sửa công cụ kèm test).

### D5. Ngưỡng sửa lõi và hồi quy

- **Sửa lõi hoặc playbook** khi: (a) lỗi hành vi lặp lại trên từ 2 client trở lên, hoặc (b) một client vi phạm requirement MUST (an toàn, không phá test, không sửa production), hoặc (c) playbook ghi sai lệnh hay cú pháp. Lỗi chỉ thuộc một model và không vi phạm MUST thì chỉ ghi lại.
- **Lỗi môi trường của một client** (chính sách lệnh, sandbox, PATH) được ghi vào `adapters/<client>/INSTALL.md`, không sửa lõi.
- **Mỗi lần sửa lõi** phải chạy một lượt hồi quy trên client và stack đã lộ lỗi. Kèm thêm một lượt Claude Code trên `java-spring-boot` ở chế độ `confirm`, để chắc chắn không làm hỏng client đang tốt.
- Nếu một lỗi cần đổi hành vi đã đặc tả, phải dừng và hỏi người dùng trước khi thêm delta spec (theo proposal).

### D6. Tổng hợp giữa các client

- Cập nhật `examples/results/cross-client.md` bằng một ma trận stack × client: Đạt, số mục Không đạt, hoặc "chưa kiểm chứng" kèm lý do (iOS, hạn mức).
- Liệt kê các lệch theo từng model mà đánh giá phát hiện, kèm cách xử lý: sửa lõi, ghi chú adapter, hoặc chỉ ghi nhận.

## Risks / Trade-offs

- **[Hạn mức Codex hết giữa chừng]** → Chạy Codex từng stack một. Lượt không chạy được thì giữ nguyên trạng thái, chạy bù sau. Change không được coi là xong khi còn lượt Codex chưa chạy, trừ khi người dùng đồng ý ghi nhận giới hạn.
- **[Kết quả agent khác nhau giữa các lần chạy, một lượt có thể đạt hoặc không do ngẫu nhiên]** → Chỉ sửa lõi khi lỗi lặp lại hoặc vi phạm MUST (D5). Lỗi đơn lẻ thì ghi nhận, không sửa theo phản xạ.
- **[Gradle hoặc Flutter chậm, một lượt có thể vượt 45 phút]** → `timeoutMinutes` của client có thể tăng trong `eval.config.json` cho đợt này. Lượt quá giờ được ghi là "không chạy được: quá thời gian" và chạy lại.
- **[Quy tắc tiến trình mới khiến agent bỏ dở kiểm chứng khi test treo]** → Đây là đánh đổi có chủ đích: an toàn quan trọng hơn hoàn tất. Báo cáo phải ghi rõ "chưa kiểm chứng" kèm lý do (requirement `test-reporting`).
- **[Chấm tay khoảng 22 lượt tốn thời gian]** → Công cụ đã tự chấm phần lớn mục khách quan. Người chấm chỉ đọc trích đoạn cho các mục cần đọc hiểu.

## Migration Plan

Không áp dụng. Quy tắc mới trong lõi có hiệu lực sau khi build lại và cài lại adapter (`npm run build`, `install.mjs`). Người dùng đã cài agent cần cài lại để nhận quy tắc.
