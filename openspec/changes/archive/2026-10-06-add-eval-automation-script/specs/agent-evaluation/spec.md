# Spec Delta

## Purpose

Tự động hóa việc đánh giá agent `brownfield-unit-test` trên các dự án mẫu. Mục tiêu là mỗi khi lõi, playbook, adapter, phiên bản client hoặc model thay đổi, người bảo trì chạy lại được việc kiểm chứng độc lập theo `examples/EVALUATION.md` một cách nhất quán và có bằng chứng.

## ADDED Requirements

### Requirement: Chạy đánh giá theo client, dự án mẫu và chế độ
Công cụ đánh giá SHALL cho người dùng chọn một hoặc nhiều client (`claude-code`, `kiro`, `codex`), một hoặc nhiều dự án mẫu trong `examples/`, và chế độ chạy (`confirm`, `auto`, hoặc cả hai). Mỗi tổ hợp client × dự án mẫu × chế độ là một **lượt đánh giá** độc lập.

#### Scenario: Chọn một tổ hợp
- **WHEN** người dùng chạy đánh giá cho client `kiro`, dự án `java-spring-boot`, chế độ `auto`
- **THEN** công cụ thực hiện đúng một lượt đánh giá cho tổ hợp đó

#### Scenario: Chọn nhiều tổ hợp
- **WHEN** người dùng chọn 2 client, 1 dự án mẫu và cả hai chế độ
- **THEN** công cụ thực hiện 4 lượt đánh giá, mỗi lượt có kết quả riêng

#### Scenario: Giá trị không hợp lệ
- **WHEN** người dùng chọn một client hoặc dự án mẫu không có trong cấu hình
- **THEN** công cụ báo lỗi, liệt kê các giá trị hợp lệ và không chạy lượt nào

### Requirement: Bảo vệ dự án mẫu gốc
Mỗi lượt đánh giá SHALL chạy trên một bản copy riêng của dự án mẫu trong thư mục tạm, kèm adapter của client đã được cài vào bản copy. Công cụ MUST NOT ghi, sửa hay xóa file nào trong `examples/`, ngoài thư mục kết quả do người dùng chỉ định.

#### Scenario: Chuẩn bị lượt đánh giá
- **WHEN** một lượt đánh giá bắt đầu
- **THEN** công cụ tạo bản copy sạch của dự án mẫu (không chứa thư mục build, coverage hay dependency sinh ra từ lần chạy trước), cài adapter của client vào bản copy, rồi ghi lại trạng thái file ban đầu

#### Scenario: Dự án mẫu gốc không đổi
- **WHEN** toàn bộ các lượt đánh giá kết thúc
- **THEN** nội dung `examples/<stack>/` giống hệt trước khi chạy

### Requirement: Cấu hình client và dự án mẫu tách khỏi công cụ
Lệnh gọi agent của từng client SHALL được khai báo trong cấu hình, không viết cứng trong công cụ. Lệnh gọi gồm lệnh CLI, cờ quyền, cách truyền tham số, cách tiếp tục phiên cho lượt xác nhận của `mode=confirm`, và giới hạn thời gian. Thông tin từng dự án mẫu cũng SHALL nằm trong cấu hình: lệnh chạy test, test cố ý fail có sẵn, đường dẫn production và test, thư mục build/coverage, dấu hiệu xấu theo stack, đường dẫn tới đơn vị khó test, `scope` mặc định.

#### Scenario: Client đổi cờ CLI
- **WHEN** một client đổi tên cờ hoặc cách resume phiên
- **THEN** người bảo trì chỉ cần sửa cấu hình, không cần sửa công cụ

#### Scenario: Thêm dự án mẫu mới
- **WHEN** người bảo trì thêm một dự án mẫu và khai báo nó trong cấu hình
- **THEN** công cụ đánh giá được dự án đó mà không phải sửa mã

### Requirement: Chạy agent headless
Ngoài chế độ chỉ kiểm chứng, công cụ SHALL tự gọi agent qua CLI của client theo cấu hình và lưu toàn bộ output/transcript của mỗi lượt. Với `mode=confirm`, công cụ SHALL chạy hai lượt trên cùng một phiên: lượt 1 gửi yêu cầu không có `mode`, lượt 2 gửi lời xác nhận, đồng thời ghi lại trạng thái file giữa hai lượt.

#### Scenario: Chế độ confirm
- **WHEN** một lượt đánh giá chạy ở `mode=confirm`
- **THEN** công cụ chạy lượt lập kế hoạch, ghi trạng thái file, rồi tiếp tục đúng phiên đó bằng lời xác nhận

#### Scenario: Client lỗi hoặc hết hạn mức
- **WHEN** CLI của client trả lỗi (chưa đăng nhập, hết hạn mức, quá thời gian)
- **THEN** lượt đó được đánh dấu "không chạy được" kèm thông báo lỗi; các lượt khác vẫn tiếp tục

#### Scenario: Thiếu CLI hoặc toolchain
- **WHEN** máy không có CLI của client hoặc toolchain mà dự án mẫu cần
- **THEN** công cụ bỏ qua các lượt liên quan, ghi lý do bỏ qua, và không làm hỏng các lượt khác

### Requirement: Chế độ chỉ kiểm chứng
Công cụ SHALL có chế độ chỉ kiểm chứng: người dùng tự chạy agent, công cụ chuẩn bị bản copy và trạng thái ban đầu trước, rồi kiểm chứng sau khi người dùng báo đã chạy xong. Công cụ cũng SHALL nhận output của agent do người dùng cung cấp để kiểm tra kế hoạch và báo cáo.

#### Scenario: Đánh giá client chưa có cấu hình
- **WHEN** người dùng muốn đánh giá một client mà công cụ không gọi được tự động
- **THEN** người dùng chạy agent bằng tay trên bản copy do công cụ chuẩn bị, rồi nhận kết quả kiểm chứng giống như lượt chạy tự động

### Requirement: Kiểm chứng độc lập
Công cụ SHALL tự kiểm chứng kết quả mỗi lượt, không dựa vào lời tự báo của agent, gồm:
- so sánh nội dung file trước và sau, phân loại file thay đổi thành test, production, cấu hình hoặc khác;
- với `mode=confirm`, so trạng thái giữa hai lượt với trạng thái ban đầu;
- `diff` từng file test có sẵn so với bản gốc để phát hiện dòng bị xóa hoặc sửa;
- chạy lại lệnh test của dự án mẫu và so test fail với test cố ý fail có sẵn;
- tìm các dấu hiệu xấu đã cấu hình trong file test mới hoặc đã sửa;
- kiểm tra thư mục build/coverage còn sót mà lúc đầu không có;
- đối chiếu tiêu đề các mục trong kế hoạch và báo cáo với `core/templates/plan.md` và `core/templates/report.md`.

Bước chạy lại test của công cụ MUST NOT để lại thư mục build trong bản copy làm sai kết quả kiểm tra thư mục còn sót.

#### Scenario: Agent sửa file production
- **WHEN** sau lượt đánh giá có file production khác với ban đầu
- **THEN** mục tương ứng (A5/D8) có kết quả "Không đạt" và bằng chứng nêu tên file

#### Scenario: Agent ghi file trước khi được xác nhận
- **WHEN** ở `mode=confirm`, trạng thái file sau lượt 1 khác trạng thái ban đầu
- **THEN** mục A3 có kết quả "Không đạt" và bằng chứng liệt kê file đã thay đổi

#### Scenario: Agent sửa test cũ
- **WHEN** một file test có sẵn bị xóa hoặc sửa dòng cũ
- **THEN** mục D5 (và A7 nếu là test cố ý fail) có kết quả "Không đạt"; nếu chỉ thêm dòng mới thì vẫn đạt

#### Scenario: Còn test fail ngoài lỗi có sẵn
- **WHEN** chạy lại test có test fail khác với test cố ý fail đã cấu hình
- **THEN** kết quả báo "Không đạt" và nêu tên test fail

#### Scenario: Sót thư mục build
- **WHEN** sau lượt đánh giá còn thư mục build/coverage mà lúc đầu không có
- **THEN** mục D8 có kết quả "Không đạt" và nêu tên thư mục

### Requirement: Phân loại mục tự chấm và cần chấm tay
Mỗi mục trong `examples/EVALUATION.md` mà công cụ báo cáo SHALL có đúng một kết quả: "Đạt", "Không đạt", "Không áp dụng" hoặc "Cần chấm tay". Công cụ MUST NOT tự kết luận "Đạt" cho mục cần đọc hiểu nội dung (ví dụ C4 đủ ca biên, C5 assertion có ý nghĩa, E3 gợi ý refactor hợp lý). Với các mục này, công cụ ghi "Cần chấm tay" kèm trích đoạn liên quan (đoạn test, mục báo cáo) để người chấm đọc nhanh.

#### Scenario: Mục không áp dụng
- **WHEN** một mục chỉ áp dụng cho chế độ khác (ví dụ A3 khi chạy `mode=auto`)
- **THEN** mục đó có kết quả "Không áp dụng"

#### Scenario: Mục cần đọc hiểu
- **WHEN** công cụ báo cáo mục C4
- **THEN** kết quả là "Cần chấm tay" kèm danh sách tên test case mới để đối chiếu

### Requirement: Xuất kết quả
Công cụ SHALL xuất kết quả mỗi lần chạy thành file Markdown, dùng đúng mã mục và bốn loại kết quả của checklist trong `examples/EVALUATION.md`. Mỗi lượt (client × dự án mẫu × chế độ) có một phần riêng gồm: client, phiên bản client, dự án mẫu, chế độ, lệnh đã chạy, thời gian chạy, và một bảng mục kèm bằng chứng. Mỗi lượt một bảng, không gộp hai chế độ vào cùng một bảng như mẫu chấm tay. Phần tổng hợp đặt ở đầu file. Công cụ SHALL in tóm tắt ra màn hình và trả mã thoát khác 0 khi có ít nhất một mục "Không đạt" hoặc một lượt "không chạy được". Bản copy và transcript của mỗi lượt SHALL được giữ lại để người chấm xem thêm, kèm đường dẫn trong kết quả.

#### Scenario: Có mục không đạt
- **WHEN** ít nhất một mục có kết quả "Không đạt"
- **THEN** công cụ trả mã thoát khác 0, và phần tổng hợp ở đầu file liệt kê các mục đó

#### Scenario: Mọi mục đạt hoặc cần chấm tay
- **WHEN** không có mục nào "Không đạt" và mọi lượt đều chạy được
- **THEN** công cụ trả mã thoát 0, và phần tổng hợp ghi số mục còn cần chấm tay
