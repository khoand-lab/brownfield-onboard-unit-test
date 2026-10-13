# Proposal

## Why

Agent `brownfield-unit-test` đã được đánh giá đầy đủ trên Claude Code với 9 stack. Kiro mới được đánh giá trên 3 stack (Java, React, Node.js), Codex trên 2 stack (Java, React). Mỗi model lại lệch theo một kiểu riêng: Kiro kẹp tham số về biên, thiếu mục kế hoạch, báo cáo sai template; Codex rút gọn báo cáo và tự tắt chính tiến trình của nó. Vì vậy, các playbook Python, Angular, Vue, Android và Flutter chưa thể coi là đã được kiểm chứng trên Kiro và Codex. Nay đã có `npm run eval`, nên việc lấp chỗ thiếu này rẻ hơn nhiều so với chấm tay. Ngoài ra, đợt đánh giá trước đã lộ ra một lỗ hổng an toàn cần đưa vào lõi: agent tắt một tiến trình theo PID mà không chắc chính nó đã khởi chạy tiến trình đó.

## What Changes

- **Bổ sung quy tắc an toàn vào lõi agent:** agent không được dừng hay tắt tiến trình mà nó không tự khởi chạy trong phiên. Khi một tiến trình test treo, agent chỉ được dừng tiến trình do chính lệnh của nó tạo ra (ví dụ nhờ giới hạn thời gian của lệnh), hoặc phải báo cho người dùng. Cập nhật `core/AGENT.md` và `core/phases/04-verify.md`, rồi build lại `dist/`.
- **Mở rộng cấu hình đánh giá:** thêm `android-java` và `flutter` vào `eval.config.json`. Lệnh test, pattern trích test fail, thư mục build và các thông tin khác được kiểm trên output thật của máy Windows hiện có.
- **Chạy đánh giá còn thiếu bằng `npm run eval`:**
  - Kiro: `python`, `angular`, `vue`, `android-java`, `flutter`, cả hai chế độ `confirm` và `auto`;
  - Codex: `nodejs`, `python`, `angular`, `vue`, `android-java`, `flutter`, cả hai chế độ. Nếu hạn mức Codex không đủ thì tối thiểu chạy `auto`.
- **Chấm tay các mục "Cần chấm tay"** của mỗi lượt. Ghi `examples/results/<client>-<stack>.md` theo checklist `EVALUATION.md`, kèm bằng chứng. Cập nhật bảng tổng hợp giữa các client.
- **Sửa lõi hoặc playbook** khi đánh giá phát hiện lỗi hành vi chung cho nhiều client. Chạy lại lượt liên quan để xác nhận đã sửa được. Lỗi do môi trường của từng client (ví dụ chính sách lệnh của Codex) chỉ ghi vào `adapters/<client>/INSTALL.md`.
- **Ngoài phạm vi:** `ios-swift` trên Kiro và Codex, vì cần macOS và Xcode. Ghi rõ là "chưa kiểm chứng" trong bảng tổng hợp.

## Capabilities

### New Capabilities
<!-- Không có. -->

### Modified Capabilities
- `agent-core-workflow`: thêm requirement an toàn "không can thiệp tiến trình không do agent khởi chạy". Đây là nguyên tắc an toàn chung của agent, đặt cạnh các requirement "Không sửa code production" và "Không phá test có sẵn".

Nếu quá trình đánh giá phát hiện thêm lỗi cần đổi hành vi đã đặc tả (ví dụ trong `test-verification` hoặc `test-reporting`), delta spec tương ứng sẽ được bổ sung trong lúc triển khai, sau khi hỏi người dùng. Việc thêm stack vào `eval.config.json` chỉ là dữ liệu cấu hình, không đổi requirement của `agent-evaluation`.

## Impact

- **Lõi và bản build:** `core/AGENT.md`, `core/phases/04-verify.md`, có thể thêm `core/playbooks/*.md`; `dist/` được build lại. Mọi client đều nhận quy tắc mới qua bản build.
- **Cấu hình và kết quả:** `eval.config.json` (thêm 2 stack); khoảng 11 file `examples/results/kiro-*.md` và `codex-*.md` mới hoặc cập nhật; `examples/results/cross-client.md`.
- **Tài liệu adapter:** `adapters/kiro/INSTALL.md`, `adapters/codex/INSTALL.md` nếu phát hiện thêm đặc thù môi trường.
- **Chi phí:** khoảng 22 lượt chạy agent thật, mỗi lượt 5–20 phút. Lượt Codex tiêu tốn hạn mức tài khoản, và hai tài khoản đều từng hết hạn mức giữa chừng. Lượt nào không chạy được do hạn mức thì ghi lại và chạy bù sau, không bỏ qua.
- **Môi trường:** máy Windows hiện tại đã có JDK, Maven, Node, Python, Chrome, Android SDK (Gradle wrapper) và Flutter SDK.
