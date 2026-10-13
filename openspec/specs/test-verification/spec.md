# test-verification Specification

## Purpose

Bảo đảm test do agent sinh ra thực sự biên dịch và chạy xanh bằng công cụ của dự án, tự sửa trong giới hạn an toàn và không che giấu lỗi.

## Requirements

### Requirement: Chạy test đã sinh
Sau khi sinh test, agent SHALL chạy test bằng lệnh test của dự án. Khi được, agent chỉ chạy các test mới/đã sửa trước rồi mới chạy toàn bộ test của module bị ảnh hưởng.

#### Scenario: Test chạy xanh
- **WHEN** toàn bộ test mới biên dịch và pass
- **THEN** agent đánh dấu các test đó là đã kiểm chứng

#### Scenario: Không chạy được test
- **WHEN** không thể chạy test (thiếu toolchain, lỗi build có sẵn không liên quan)
- **THEN** agent đánh dấu test là "chưa kiểm chứng" và ghi rõ lý do trong báo cáo

### Requirement: Tự sửa có giới hạn
Khi test mới fail hoặc không biên dịch được, agent SHALL phân tích lỗi và sửa file test, lặp lại tối đa N vòng. N lấy từ tham số `max-fix-attempts`: giá trị mặc định là 3, giá trị hợp lệ là số nguyên từ 1 đến 10. Mỗi vòng gồm một lần sửa và một lần chạy lại. Giới hạn áp dụng riêng cho từng file test. Hết N vòng mà vẫn fail, agent MUST dừng sửa test đó.

#### Scenario: Dùng giá trị mặc định
- **WHEN** người dùng không chỉ định `max-fix-attempts`
- **THEN** agent tự sửa tối đa 3 vòng cho mỗi file test fail

#### Scenario: Giá trị không hợp lệ
- **WHEN** người dùng chỉ định `max-fix-attempts` ngoài khoảng 1 đến 10 hoặc không phải số nguyên
- **THEN** agent báo giá trị không hợp lệ và dùng giá trị mặc định 3, ghi nhận điều này trong kế hoạch

#### Scenario: Sửa thành công
- **WHEN** test fail do lỗi trong test (sai import, sai mock, sai kỳ vọng)
- **THEN** agent sửa test và chạy lại cho đến khi pass hoặc hết số vòng

### Requirement: Xử lý test fail sau khi hết số vòng tự sửa
Agent SHALL xử lý test vẫn fail sau N vòng theo tham số `failed-test-policy`, gồm hai giá trị:
- `remove` (mặc định): gỡ test case fail khỏi mã nguồn dự án; nếu file test do agent tạo không còn test case nào thì xóa file đó. Toàn bộ mã test đã thử MUST được đưa vào báo cáo.
- `disable`: giữ test case trong mã nguồn nhưng đánh dấu tạm bỏ qua bằng cơ chế skip/disable chuẩn của framework, kèm lời giải thích trong code có chuỗi nhận diện cố định (ví dụ `TODO(unit-test-agent)`) cùng lý do fail.

Trong cả hai chế độ, agent MUST NOT để lại test fail đang chạy trong bộ test, và MUST chỉ áp dụng lên test case do chính agent tạo trong phiên.

#### Scenario: Mặc định gỡ test fail
- **WHEN** test vẫn fail sau N vòng và người dùng không chỉ định `failed-test-policy`
- **THEN** agent gỡ test case đó khỏi dự án, bộ test còn lại vẫn chạy xanh, và báo cáo chứa mã test đã thử kèm lỗi cuối cùng

#### Scenario: Chọn giữ lại dạng disable
- **WHEN** test vẫn fail sau N vòng và người dùng chỉ định `failed-test-policy` là `disable`
- **THEN** test case được giữ trong file test ở trạng thái skip/disable, có ghi chú chứa chuỗi nhận diện và lý do fail, và báo cáo liệt kê test đó với trạng thái "đã disable, chưa hoàn thành"

#### Scenario: Không động tới test có sẵn
- **WHEN** áp dụng `failed-test-policy`
- **THEN** chỉ test case do agent tạo trong phiên bị gỡ hoặc disable; test đã có từ trước giữ nguyên

### Requirement: Không che giấu lỗi
Để làm test pass, agent MUST NOT: sửa kỳ vọng cho khớp với hành vi mà agent cho là bug, đánh dấu skip/ignore, bắt và nuốt exception, xóa assertion, hoặc sửa code production. Việc disable theo `failed-test-policy` là `disable` không bị coi là che giấu lỗi, vì chỉ xảy ra khi người dùng chủ động chọn và luôn được ghi rõ trong code lẫn báo cáo.

#### Scenario: Nghi ngờ bug trong code production
- **WHEN** test fail và phân tích cho thấy code production có khả năng sai so với ý định
- **THEN** agent không đổi kỳ vọng cho khớp với code, mà ghi nhận nghi vấn bug trong báo cáo kèm test minh họa; test minh họa chỉ được thêm vào bộ test khi người dùng đồng ý

### Requirement: Kiểm tra độ ổn định
Agent SHALL chạy lại các test mới ít nhất một lần nữa sau khi pass để phát hiện test chập chờn (flaky).

#### Scenario: Test flaky
- **WHEN** một test cho kết quả khác nhau giữa các lần chạy
- **THEN** agent coi đó là lỗi, sửa trong giới hạn số vòng và ghi nhận vào báo cáo nếu không sửa được

### Requirement: Bảo vệ thay đổi ngoài phạm vi
Trước khi kết thúc, agent SHALL xác minh rằng các file bị thay đổi chỉ là file test, helper/fixture test và các thay đổi cấu hình đã được người dùng chấp thuận.

#### Scenario: Phát hiện thay đổi ngoài phạm vi
- **WHEN** có file production bị agent thay đổi trong phiên làm việc
- **THEN** agent hoàn tác thay đổi đó và ghi nhận trong báo cáo
