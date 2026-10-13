# Tasks

## 1. Quy tắc an toàn về tiến trình trong lõi

- [x] 1.1 Thêm nguyên tắc "không dừng, tắt hay gửi tín hiệu tới tiến trình không do agent khởi chạy; không chọn tiến trình theo tên hay danh sách tiến trình của hệ thống" vào danh sách nguyên tắc an toàn của `core/AGENT.md` (design D1). Kiểm chứng: `npm run build`, rồi `npm run check` pass (lõi không nêu tên lệnh riêng của client); nội dung có trong `dist/*/skills/brownfield-unit-test/SKILL.md` của cả 3 client
- [x] 1.2 Thêm mục "Lệnh chạy quá lâu" vào bước 1 và bước 5 của `core/phases/04-verify.md`: dùng giới hạn thời gian của chính lệnh, hoặc chỉ dừng tiến trình do lệnh đó tạo ra; không làm được thì báo người dùng và đánh dấu test bị ảnh hưởng là "chưa kiểm chứng". Kiểm chứng: `npm run check` pass, và rà thủ công đủ 2 scenario của requirement "Không can thiệp tiến trình ngoài phiên" đều có câu hướng dẫn tương ứng
- [x] 1.3 Chạy hồi quy: `npm run eval -- --client codex --stack react --mode auto` (đúng tổ hợp đã lộ lỗi) và `npm run eval -- --client claude-code --stack java-spring-boot --mode confirm`. Kiểm chứng: transcript không có lệnh dừng tiến trình theo PID lấy từ danh sách tiến trình; không có mục "Không đạt" mới so với các lượt trước của cùng tổ hợp; ghi kết quả vào `examples/results/eval-automation-check.md` (mục hồi quy)

## 2. Cấu hình đánh giá cho android-java và flutter

- [x] 2.1 Thêm stack `android-java` vào `eval.config.json` (design D2): `gradlew.bat :app:testDebugUnitTest`, `buildDirs`, `prodPaths`/`testPaths` (`app/src/main/**`, `app/src/test/**`), `expectedFailures` (`TaxRuleUnitTest`), `hardUnits` (`InvoiceExporter`), `badMarkers`, `requires`. Kiểm chứng: chạy `verifyTests` trên bản copy sạch của `examples/android-java`; tập test fail trích được đúng bằng test cố ý fail
- [x] 2.2 Thêm stack `flutter`: `deps` chạy `flutter pub get`, `testCommand` là `flutter test`, các khóa còn lại tương tự 2.1 (test cố ý fail `tax_rule withTax cộng VAT khi có số tiền`, `hardUnits` `invoice_exporter`). Kiểm chứng như 2.1 trên `examples/flutter`, và `node scripts/eval.mjs --client kiro --stack android-java,flutter --mode both --dry-run` in đúng lệnh
- [x] 2.3 Cập nhật danh sách stack đã cấu hình trong `examples/EVALUATION.md` (mục "Chạy tự động"). Kiểm chứng: danh sách khớp với các khóa `stacks` trong `eval.config.json`

## 3. Đánh giá Kiro

- [x] 3.1 Chạy `npm run eval -- --client kiro --stack python,angular,vue,android-java,flutter --mode both` (10 lượt). Kiểm chứng: cả 10 lượt chạy được, hoặc mọi lượt "không chạy được" có lý do và được chạy bù cho tới khi chạy được
- [x] 3.2 Với từng stack, đối chiếu độc lập mọi mục "Không đạt" và chấm tay các mục "Cần chấm tay" (design D4), rồi ghi `examples/results/kiro-<stack>.md` theo mẫu chấm tay của `EVALUATION.md` (có model). Kiểm chứng: 5 file mới; mỗi mục A1–F3 có kết quả và bằng chứng; mọi kết luận tự chấm bị đảo ngược được ghi vào `eval-automation-check.md`
- [x] 3.3 Phân loại các lỗi Kiro tìm được theo design D5 (sửa lõi/playbook, ghi chú adapter, hoặc chỉ ghi nhận), rồi thực hiện. Mỗi lần sửa lõi phải chạy lượt hồi quy tương ứng. Kiểm chứng: mỗi lỗi có một dòng phân loại kèm hành động trong file kết quả; lượt hồi quy không còn lỗi đã sửa; `npm test` và `npm run check` pass

## 4. Đánh giá Codex

- [x] 4.1 Chạy Codex từng stack một với `--mode both`, lần lượt `nodejs`, `python`, `angular`, `vue`, `android-java`, `flutter` (12 lượt) (design D3). Kiểm chứng: cả 12 lượt chạy được; lượt hết hạn mức được ghi lại và chạy bù sau khi có hạn mức
- [x] 4.2 Đối chiếu, chấm tay và ghi `examples/results/codex-<stack>.md` cho 6 stack như 3.2. Kiểm chứng: 6 file mới đủ mục A1–F3 có bằng chứng
- [x] 4.3 Phân loại và xử lý các lỗi Codex như 3.3. Lỗi môi trường được ghi vào `adapters/codex/INSTALL.md`. Kiểm chứng như 3.3

## 5. Tổng hợp và kiểm tra cuối

- [x] 5.1 Cập nhật `examples/results/cross-client.md` thành ma trận stack × client (Claude Code, Kiro, Codex) cho 9 stack: Đạt, số mục Không đạt, hoặc "chưa kiểm chứng" kèm lý do (iOS cần macOS); kèm danh sách lệch theo từng model và cách xử lý (design D6). Kiểm chứng: mọi ô của ma trận có giá trị và trỏ tới file kết quả tương ứng
- [x] 5.2 Chạy `openspec validate complete-cross-client-evaluation --strict`, `npm test` và `npm run check`. Kiểm chứng: tất cả pass
