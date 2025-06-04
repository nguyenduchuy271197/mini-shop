# Functional Requirements cho MVP của Mini Ecommerce

## Tính năng chung cho tất cả người dùng

| ID   | Nhóm tính năng | Tính năng              | Mô tả                                                                   | Độ ưu tiên | Dependencies |
| ---- | -------------- | ---------------------- | ----------------------------------------------------------------------- | ---------- | ------------ |
| FR01 | Xác thực       | Đăng ký tài khoản      | Cho phép người dùng tạo tài khoản với vai trò cụ thể (khách hàng/admin) | Cao        | Không có     |
| FR02 | Xác thực       | Đăng nhập/Xác thực     | Cho phép người dùng đăng nhập vào hệ thống                              | Cao        | FR01         |
| FR03 | Xác thực       | Quản lý hồ sơ cá nhân  | Cho phép người dùng xem và chỉnh sửa thông tin cá nhân                  | Cao        | FR01, FR02   |
| FR04 | Xác thực       | Đăng xuất              | Cho phép người dùng đăng xuất khỏi hệ thống                             | Trung bình | FR02         |
| FR05 | Xác thực       | Đổi mật khẩu           | Cho phép người dùng thay đổi mật khẩu                                   | Trung bình | FR02         |
| FR06 | Xác thực       | Quên mật khẩu          | Cho phép người dùng khôi phục mật khẩu qua email                        | Trung bình | FR01         |
| FR07 | Sản phẩm       | Xem danh sách sản phẩm | Hiển thị danh sách sản phẩm có phân trang và sắp xếp                    | Cao        | Không có     |
| FR08 | Sản phẩm       | Xem chi tiết sản phẩm  | Hiển thị thông tin chi tiết sản phẩm, hình ảnh, giá, mô tả              | Cao        | FR07         |
| FR09 | Sản phẩm       | Tìm kiếm sản phẩm      | Cho phép tìm kiếm sản phẩm theo tên, category, khoảng giá               | Cao        | FR07         |
| FR10 | Sản phẩm       | Lọc sản phẩm           | Lọc sản phẩm theo danh mục, giá, thương hiệu, đánh giá                  | Cao        | FR07         |
| FR11 | Sản phẩm       | Phân loại sản phẩm     | Hiển thị danh mục sản phẩm và số lượng sản phẩm trong từng danh mục     | Trung bình | FR07         |
| FR12 | Hệ thống       | Xem thông tin chung    | Hiển thị thông tin về cửa hàng, chính sách bảo mật, điều khoản sử dụng  | Thấp       | Không có     |

## Tính năng dành cho Khách hàng

| ID   | Nhóm tính năng | Tính năng                    | Mô tả                                                           | Độ ưu tiên | Dependencies |
| ---- | -------------- | ---------------------------- | --------------------------------------------------------------- | ---------- | ------------ |
| FR13 | Giỏ hàng       | Thêm sản phẩm vào giỏ hàng   | Cho phép khách hàng thêm sản phẩm vào giỏ hàng với số lượng     | Cao        | FR08         |
| FR14 | Giỏ hàng       | Quản lý giỏ hàng             | Xem, cập nhật số lượng, xóa sản phẩm trong giỏ hàng             | Cao        | FR13         |
| FR15 | Giỏ hàng       | Tính toán tổng tiền          | Tự động tính tổng tiền hàng, thuế, phí vận chuyển               | Cao        | FR14         |
| FR16 | Đơn hàng       | Đặt hàng                     | Cho phép khách hàng đặt hàng và nhập thông tin giao hàng        | Cao        | FR15, FR02   |
| FR17 | Thanh toán     | Thanh toán                   | Tích hợp thanh toán online (VNPay, Momo) và thanh toán khi nhận | Cao        | FR16         |
| FR18 | Đơn hàng       | Xem lịch sử đơn hàng         | Hiển thị danh sách đơn hàng đã đặt và trạng thái                | Cao        | FR16         |
| FR19 | Đơn hàng       | Xem chi tiết đơn hàng        | Hiển thị thông tin chi tiết đơn hàng, sản phẩm, giá             | Cao        | FR18         |
| FR20 | Đơn hàng       | Theo dõi trạng thái đơn hàng | Theo dõi tiến trình xử lý và giao hàng                          | Cao        | FR18         |
| FR21 | Đơn hàng       | Hủy đơn hàng                 | Cho phép hủy đơn hàng khi chưa được xử lý                       | Trung bình | FR18         |
| FR22 | Cá nhân hóa    | Danh sách yêu thích          | Lưu sản phẩm yêu thích để xem và mua sau                        | Trung bình | FR08, FR02   |
| FR23 | Đánh giá       | Đánh giá sản phẩm            | Đánh giá và nhận xét sản phẩm sau khi mua                       | Trung bình | FR19         |
| FR24 | Cá nhân hóa    | Quản lý địa chỉ giao hàng    | Thêm, sửa, xóa địa chỉ giao hàng                                | Trung bình | FR03         |

## Tính năng dành cho Quản trị viên/Admin

| ID   | Nhóm tính năng     | Tính năng                 | Mô tả                                                            | Độ ưu tiên | Dependencies |
| ---- | ------------------ | ------------------------- | ---------------------------------------------------------------- | ---------- | ------------ |
| FR25 | Quản lý catalog    | Quản lý danh mục sản phẩm | Thêm, sửa, xóa danh mục sản phẩm                                 | Cao        | FR02         |
| FR26 | Quản lý catalog    | Quản lý sản phẩm          | Thêm, sửa, xóa sản phẩm và thông tin chi tiết                    | Cao        | FR25         |
| FR27 | Quản lý catalog    | Quản lý kho hàng          | Cập nhật số lượng tồn kho, cảnh báo hết hàng                     | Cao        | FR26         |
| FR28 | Quản lý đơn hàng   | Quản lý đơn hàng          | Xem, cập nhật trạng thái đơn hàng (xử lý, giao hàng, hoàn thành) | Cao        | FR16         |
| FR29 | Quản lý người dùng | Quản lý khách hàng        | Xem danh sách khách hàng, thông tin cá nhân, lịch sử mua hàng    | Cao        | FR01         |
| FR30 | Quản lý thanh toán | Quản lý thanh toán        | Xem báo cáo thanh toán, xác nhận giao dịch                       | Cao        | FR17         |
| FR31 | Báo cáo            | Dashboard quản trị        | Hiển thị thống kê tổng quan: doanh thu, đơn hàng, sản phẩm bán   | Cao        | FR28, FR26   |
| FR32 | Báo cáo            | Báo cáo doanh thu         | Xem báo cáo doanh thu theo ngày, tháng, năm                      | Trung bình | FR28         |
| FR33 | Báo cáo            | Báo cáo sản phẩm bán chạy | Thống kê sản phẩm bán chạy nhất, ít bán nhất                     | Trung bình | FR28, FR26   |
| FR34 | Marketing          | Quản lý khuyến mãi        | Tạo và quản lý mã giảm giá, chương trình khuyến mãi              | Trung bình | FR26         |
| FR35 | Vận chuyển         | Quản lý vận chuyển        | Cấu hình phí vận chuyển theo khu vực, trọng lượng                | Trung bình | FR15         |
| FR36 | Quản lý nội dung   | Quản lý đánh giá sản phẩm | Duyệt, xóa đánh giá không phù hợp                                | Thấp       | FR23         |
| FR37 | Báo cáo            | Xuất báo cáo              | Xuất báo cáo doanh thu, đơn hàng ra file Excel/PDF               | Thấp       | FR32, FR33   |
| FR38 | Marketing          | Quản lý banner/quảng cáo  | Thêm, sửa, xóa banner quảng cáo trên trang chủ                   | Thấp       | FR02         |
