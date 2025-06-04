# Functional Requirements cho MVP của Job Board

## Tính năng chung cho cả hai vai trò (Người tìm việc & Nhà tuyển dụng)

| ID   | Tính năng                 | Mô tả                                                                      | Độ ưu tiên | Dependencies |
| ---- | ------------------------- | -------------------------------------------------------------------------- | ---------- | ------------ |
| FR01 | Đăng ký tài khoản         | Cho phép người dùng tạo tài khoản với vai trò cụ thể (tìm việc/tuyển dụng) | Cao        | Không có     |
| FR02 | Đăng nhập/Xác thực        | Cho phép người dùng đăng nhập vào hệ thống                                 | Cao        | FR01         |
| FR03 | Quản lý hồ sơ người dùng  | Cho phép người dùng xem và chỉnh sửa thông tin cá nhân, thông tin liên hệ  | Cao        | FR01, FR02   |
| FR04 | Phân quyền người dùng     | Phân biệt vai trò: người tìm việc và nhà tuyển dụng                        | Cao        | FR01, FR02   |
| FR05 | Tìm kiếm việc làm         | Cho phép tìm kiếm việc làm theo vị trí, địa điểm, ngành nghề, mức lương    | Cao        | FR25         |
| FR06 | Xem danh sách việc làm    | Hiển thị danh sách việc làm có phân trang và bộ lọc                        | Cao        | Không có     |
| FR07 | Xem chi tiết việc làm     | Hiển thị thông tin chi tiết về công việc, yêu cầu, mô tả                   | Cao        | FR06         |
| FR08 | Đăng xuất                 | Cho phép người dùng đăng xuất khỏi hệ thống                                | Trung bình | FR02         |
| FR09 | Đổi mật khẩu              | Cho phép người dùng thay đổi mật khẩu                                      | Trung bình | FR02         |
| FR10 | Quên mật khẩu             | Cho phép người dùng khôi phục mật khẩu qua email                           | Trung bình | FR01         |
| FR11 | Phân loại theo ngành nghề | Hiển thị các ngành nghề và số lượng việc làm trong từng ngành              | Trung bình | FR06         |
| FR12 | Xem thông tin chung       | Hiển thị thông tin về trang web, chính sách bảo mật, điều khoản sử dụng    | Thấp       | Không có     |

## Tính năng dành cho Người tìm việc

| ID   | Tính năng                     | Mô tả                                                             | Độ ưu tiên | Dependencies |
| ---- | ----------------------------- | ----------------------------------------------------------------- | ---------- | ------------ |
| FR13 | Tạo và quản lý CV             | Cho phép người tìm việc tạo, chỉnh sửa và lưu trữ CV trực tuyến   | Cao        | FR03         |
| FR14 | Ứng tuyển việc làm            | Cho phép người tìm việc nộp đơn ứng tuyển kèm CV và thư xin việc  | Cao        | FR13, FR07   |
| FR15 | Xem lịch sử ứng tuyển         | Hiển thị danh sách các việc làm đã ứng tuyển và trạng thái        | Cao        | FR14         |
| FR16 | Lưu việc làm yêu thích        | Cho phép người tìm việc lưu các việc làm quan tâm để xem sau      | Trung bình | FR07         |
| FR18 | Theo dõi trạng thái ứng tuyển | Cho phép theo dõi tiến trình xét duyệt hồ sơ                      | Trung bình | FR15         |
| FR19 | Tải lên CV có sẵn             | Cho phép tải lên file CV dạng PDF/Word                            | Cao        | FR03         |
| FR20 | Xóa hồ sơ ứng tuyển           | Cho phép người tìm việc rút lại hồ sơ đã nộp                      | Thấp       | FR15         |

## Tính năng dành cho Nhà tuyển dụng

| ID   | Tính năng                    | Mô tả                                                            | Độ ưu tiên | Dependencies |
| ---- | ---------------------------- | ---------------------------------------------------------------- | ---------- | ------------ |
| FR22 | Tạo hồ sơ công ty            | Cho phép tạo và cập nhật thông tin công ty, logo, mô tả          | Cao        | FR03         |
| FR23 | Đăng tin tuyển dụng          | Cho phép tạo và đăng tin tuyển dụng với các thông tin chi tiết   | Cao        | FR22         |
| FR24 | Quản lý tin tuyển dụng       | Cho phép xem, sửa, xóa, gia hạn các tin tuyển dụng đã đăng       | Cao        | FR23         |
| FR25 | Quản lý hồ sơ ứng tuyển      | Xem danh sách ứng viên đã nộp hồ sơ cho từng vị trí              | Cao        | FR23         |
| FR26 | Xem chi tiết hồ sơ ứng viên  | Xem CV, thông tin cá nhân và thư xin việc của ứng viên           | Cao        | FR25         |
| FR27 | Cập nhật trạng thái hồ sơ    | Cập nhật trạng thái hồ sơ: đã xem, phỏng vấn, từ chối, chấp nhận | Cao        | FR26         |
| FR28 | Tìm kiếm ứng viên            | Tìm kiếm ứng viên trong hệ thống theo kỹ năng, kinh nghiệm       | Trung bình | Không có     |
| FR29 | Lưu hồ sơ ứng viên tiềm năng | Cho phép lưu hồ sơ ứng viên để xem xét sau                       | Trung bình | FR26         |
| FR30 | Gửi email cho ứng viên       | Cho phép gửi email mời phỏng vấn hoặc thông báo kết quả          | Trung bình | FR26         |
| FR31 | Báo cáo tuyển dụng           | Xem báo cáo về số lượng ứng viên, lượt xem tin tuyển dụng        | Thấp       | FR25         |
| FR32 | Xuất danh sách ứng viên      | Cho phép xuất danh sách ứng viên ra file Excel/CSV               | Thấp       | FR25         |
