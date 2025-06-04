# Information Architecture - Mini Ecommerce

## Tổng quan Hệ thống

### Đối tượng người dùng

- **Khách hàng (Customer)**: Mua sắm và đặt hàng
- **Admin**: Quản lý hệ thống và đơn hàng
- **Guest**: Xem sản phẩm, mua hàng không cần đăng ký

### Mục tiêu chính

- Trải nghiệm mua sắm mượt mà
- Quản lý sản phẩm và đơn hàng hiệu quả
- Thanh toán an toàn và theo dõi đơn hàng

## Cấu trúc Navigation

### 1. Guest Navigation

```
🛒 Trang chủ
├── 🔍 Tìm kiếm sản phẩm
├── 📱 Danh sách sản phẩm
│   ├── Sản phẩm nổi bật
│   ├── Sản phẩm mới
│   └── Sản phẩm khuyến mãi
├── 🏷️ Danh mục sản phẩm
├── 🛍️ Giỏ hàng
├── 📞 Liên hệ
├── 📋 Chính sách
│   ├── Chính sách bảo mật
│   ├── Điều khoản sử dụng
│   ├── Chính sách đổi trả
│   └── Hướng dẫn thanh toán
├── 🔑 Đăng nhập
└── ✍️ Đăng ký
```

### 2. Customer Navigation

```
🛒 Customer Dashboard
├── 🏠 Trang chủ
│   ├── Sản phẩm đề xuất
│   ├── Sản phẩm đã xem
│   ├── Khuyến mãi đặc biệt
│   ├── Thông báo mới
│   └── Quick shop
├── 🔍 Mua sắm & Khám phá
│   ├── Tìm kiếm sản phẩm
│   ├── Lọc theo danh mục
│   ├── Lọc theo giá
│   ├── Lọc theo thương hiệu
│   ├── Sản phẩm nổi bật
│   ├── Sản phẩm mới
│   ├── Khuyến mãi & Giảm giá
│   └── So sánh sản phẩm
├── 🛍️ Giỏ hàng
│   ├── Sản phẩm trong giỏ
│   ├── Cập nhật số lượng
│   ├── Áp dụng mã giảm giá
│   ├── Tính phí vận chuyển
│   ├── Tổng thanh toán
│   └── Tiến hành đặt hàng
├── 📦 Đơn hàng
│   ├── Lịch sử đơn hàng
│   ├── Chi tiết đơn hàng
│   ├── Theo dõi vận chuyển
│   ├── Trạng thái đơn hàng
│   ├── Hủy đơn hàng
│   ├── Đánh giá sản phẩm
│   └── Mua lại
├── 💳 Thanh toán
│   ├── Phương thức thanh toán
│   ├── Lịch sử thanh toán
│   ├── Hóa đơn điện tử
│   └── Hoàn tiền
├── ⭐ Yêu thích
│   ├── Sản phẩm đã lưu
│   ├── Thêm vào giỏ hàng
│   ├── Chia sẻ wishlist
│   └── Thông báo giá
├── 📝 Đánh giá
│   ├── Đánh giá đã viết
│   ├── Sản phẩm chờ đánh giá
│   ├── Chỉnh sửa đánh giá
│   └── Xóa đánh giá
├── 👤 Hồ sơ cá nhân
│   ├── Thông tin cơ bản
│   ├── Số điện thoại
│   ├── Email
│   ├── Ngày sinh
│   ├── Giới tính
│   └── Ảnh đại diện
├── 📍 Địa chỉ
│   ├── Địa chỉ giao hàng
│   ├── Địa chỉ thanh toán
│   ├── Thêm địa chỉ mới
│   ├── Chỉnh sửa địa chỉ
│   └── Đặt làm mặc định
├── 🔔 Thông báo
│   ├── Cập nhật đơn hàng
│   ├── Khuyến mãi mới
│   ├── Sản phẩm yêu thích
│   ├── Thông báo hệ thống
│   └── Email marketing
└── ⚙️ Cài đặt
    ├── Thông tin tài khoản
    ├── Đổi mật khẩu
    ├── Cài đặt thông báo
    ├── Quyền riêng tư
    ├── Ngôn ngữ & Tiền tệ
    └── Bảo mật hai lớp
```

### 3. Admin Navigation

```
🛒 Admin Dashboard
├── 🏠 Tổng quan
│   ├── Thống kê doanh thu
│   ├── Đơn hàng mới
│   ├── Sản phẩm bán chạy
│   ├── Khách hàng mới
│   ├── Sản phẩm sắp hết
│   ├── Đánh giá mới
│   └── Hoạt động hệ thống
├── 📱 Quản lý Sản phẩm
│   ├── Danh sách sản phẩm
│   ├── Thêm sản phẩm mới
│   ├── Chỉnh sửa sản phẩm
│   ├── Xóa sản phẩm
│   ├── Quản lý hình ảnh
│   ├── Quản lý biến thể
│   ├── Nhập/Xuất sản phẩm
│   ├── Sản phẩm nổi bật
│   ├── SEO sản phẩm
│   └── Lịch sử thay đổi
├── 🏷️ Quản lý Danh mục
│   ├── Cây danh mục
│   ├── Thêm danh mục
│   ├── Chỉnh sửa danh mục
│   ├── Xóa danh mục
│   ├── Sắp xếp danh mục
│   ├── Hình ảnh danh mục
│   └── SEO danh mục
├── 📦 Quản lý Kho hàng
│   ├── Tồn kho hiện tại
│   ├── Cập nhật tồn kho
│   ├── Cảnh báo hết hàng
│   ├── Lịch sử nhập/xuất
│   ├── Kiểm kê kho
│   ├── Dự báo nhu cầu
│   └── Báo cáo tồn kho
├── 🛍️ Quản lý Đơn hàng
│   ├── Tất cả đơn hàng
│   ├── Đơn hàng chờ xử lý
│   ├── Đơn hàng đang giao
│   ├── Đơn hàng hoàn thành
│   ├── Đơn hàng đã hủy
│   ├── Đơn hàng hoàn trả
│   ├── Cập nhật trạng thái
│   ├── In hóa đơn
│   ├── Quản lý vận chuyển
│   ├── Ghi chú đơn hàng
│   └── Xuất báo cáo
├── 👥 Quản lý Khách hàng
│   ├── Danh sách khách hàng
│   ├── Thông tin chi tiết
│   ├── Lịch sử mua hàng
│   ├── Nhóm khách hàng
│   ├── Khách hàng VIP
│   ├── Khách hàng mới
│   ├── Khóa/Mở khóa tài khoản
│   ├── Gửi email marketing
│   └── Xuất danh sách
├── 💳 Quản lý Thanh toán
│   ├── Giao dịch thanh toán
│   ├── Phương thức thanh toán
│   ├── Cổng thanh toán
│   ├── Hoàn tiền
│   ├── Đối soát thanh toán
│   ├── Báo cáo doanh thu
│   ├── Phí giao dịch
│   └── Lỗi thanh toán
├── 🎯 Marketing & Khuyến mãi
│   ├── Mã giảm giá
│   ├── Chương trình khuyến mãi
│   ├── Flash sale
│   ├── Banner quảng cáo
│   ├── Email marketing
│   ├── Chương trình loyalty
│   ├── Affiliate marketing
│   └── Phân tích hiệu quả
├── 🚚 Quản lý Vận chuyển
│   ├── Phương thức vận chuyển
│   ├── Khu vực giao hàng
│   ├── Phí vận chuyển
│   ├── Đối tác vận chuyển
│   ├── Theo dõi đơn hàng
│   ├── Thời gian giao hàng
│   ├── Hoàn trả vận chuyển
│   └── Báo cáo vận chuyển
├── ⭐ Quản lý Đánh giá
│   ├── Tất cả đánh giá
│   ├── Đánh giá chờ duyệt
│   ├── Đánh giá đã duyệt
│   ├── Đánh giá bị từ chối
│   ├── Phản hồi đánh giá
│   ├── Báo cáo đánh giá spam
│   ├── Thống kê đánh giá
│   └── Cài đặt đánh giá
├── 📊 Báo cáo & Phân tích
│   ├── Dashboard analytics
│   ├── Báo cáo doanh thu
│   ├── Báo cáo sản phẩm
│   ├── Báo cáo khách hàng
│   ├── Báo cáo đơn hàng
│   ├── Báo cáo tồn kho
│   ├── Báo cáo marketing
│   ├── Phân tích conversion
│   ├── Báo cáo tài chính
│   └── Xuất báo cáo
├── 🔔 Thông báo
│   ├── Thông báo hệ thống
│   ├── Cảnh báo quan trọng
│   ├── Đơn hàng mới
│   ├── Sản phẩm hết hàng
│   ├── Đánh giá mới
│   ├── Lỗi hệ thống
│   └── Cài đặt thông báo
└── ⚙️ Cài đặt Hệ thống
    ├── Thông tin cửa hàng
    ├── Cài đặt chung
    ├── Cài đặt thanh toán
    ├── Cài đặt vận chuyển
    ├── Cài đặt email
    ├── Cài đặt SEO
    ├── Cài đặt bảo mật
    ├── Backup & Restore
    ├── Quản lý theme
    ├── Plugin & Extension
    ├── API settings
    └── Logs hệ thống
```

## User Flows Chính

### 1. Customer Journey

#### A. Đăng ký và Thiết lập tài khoản

```
Start → Chọn đăng ký → Nhập thông tin cơ bản → Xác thực email →
Tạo hồ sơ cá nhân → Thêm địa chỉ → Thiết lập preferences → Hoàn thành onboarding → Dashboard
```

#### B. Mua sắm và Đặt hàng

```
Trang chủ → Duyệt sản phẩm/Tìm kiếm → Xem chi tiết sản phẩm → So sánh sản phẩm (optional) →
Thêm vào giỏ hàng → Xem giỏ hàng → Áp dụng mã giảm giá → Checkout →
Chọn địa chỉ giao hàng → Chọn phương thức vận chuyển → Chọn phương thức thanh toán →
Xác nhận đơn hàng → Thanh toán → Nhận xác nhận → Theo dõi đơn hàng
```

#### C. Quản lý Đơn hàng và Đánh giá

```
Nhận thông báo cập nhật → Theo dõi vận chuyển → Nhận hàng → Xác nhận đã nhận →
Đánh giá sản phẩm → Viết review → Yêu cầu hỗ trợ (nếu cần) → Mua lại (optional)
```

### 2. Admin Journey

#### A. Quản lý Sản phẩm

```
Dashboard → Quản lý sản phẩm → Thêm sản phẩm mới → Nhập thông tin chi tiết →
Upload hình ảnh → Thiết lập giá và tồn kho → Cấu hình SEO → Preview sản phẩm →
Xuất bản → Theo dõi performance
```

#### B. Xử lý Đơn hàng

```
Dashboard → Nhận đơn hàng mới → Xem chi tiết đơn hàng → Kiểm tra tồn kho →
Xác nhận đơn hàng → Chuẩn bị hàng → Tạo đơn vận chuyển → Cập nhật tracking →
Theo dõi giao hàng → Xác nhận hoàn thành → Xử lý đánh giá
```

#### C. Phân tích và Báo cáo

```
Dashboard → Xem báo cáo tổng quan → Chọn loại báo cáo chi tiết →
Thiết lập filter và thời gian → Phân tích dữ liệu → Xuất báo cáo →
Chia sẻ insights → Tối ưu hóa operations
```

### 3. Shared Flows

#### A. Authentication Flow

```
Landing Page → Login/Register → Verification → Profile Setup → Dashboard
```

#### B. Search & Discovery Flow

```
Search Input → Apply Filters → View Results → Sort Results →
View Product Details → Compare Products → Add to Cart/Wishlist
```

#### C. Payment Flow

```
Cart Review → Checkout → Address Selection → Shipping Method →
Payment Method → Order Confirmation → Payment Processing → Order Placed
```
