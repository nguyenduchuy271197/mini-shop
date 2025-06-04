# Edge Functions cho Mini Ecommerce

## Tổng quan

Edge Functions là các hàm serverless chạy tại edge, gần với người dùng nhất. Trong hệ thống Mini Ecommerce, chúng ta cần các Edge Functions để xử lý business logic phức tạp, tích hợp với các dịch vụ bên ngoài, và đảm bảo hiệu suất cao.

## Danh sách Edge Functions cần thiết

### 1. Authentication & User Management

#### `auth-signup`

**Mục đích**: Xử lý đăng ký người dùng với logic phức tạp

**Lý do cần thiết**:

- Tự động gán role mặc định (customer) từ PRD requirement FR01
- Validation dữ liệu đầu vào phức tạp (email, phone, password strength)
- Tạo profile và user_roles record đồng bộ
- Gửi email xác thực (FR06 - quên mật khẩu)
- Xử lý lỗi và rollback nếu có vấn đề

#### `auth-role-switch`

**Mục đích**: Chuyển đổi role cho admin users

**Lý do cần thiết**:

- Admin có thể có nhiều role (customer + admin)
- Cần refresh JWT token với role mới
- Security validation trước khi chuyển đổi
- Audit log cho việc chuyển role

### 2. Order Management

#### `order-create`

**Mục đích**: Tạo đơn hàng với business logic phức tạp

**Lý do cần thiết**:

- **Inventory check**: Kiểm tra tồn kho realtime (FR27)
- **Price calculation**: Tính toán phức tạp (subtotal, tax, shipping, discount) (FR15)
- **Coupon validation**: Kiểm tra và áp dụng mã giảm giá (FR34)
- **Order number generation**: Tạo order number unique theo format
- **Atomic transaction**: Đảm bảo tất cả operations thành công hoặc rollback
- **Stock reservation**: Giữ stock trong thời gian xử lý payment

```javascript
// Pseudo-code flow
1. Validate cart items
2. Check inventory availability
3. Calculate pricing (tax, shipping, discounts)
4. Validate coupon if provided
5. Reserve stock
6. Create order + order_items
7. Clear cart
8. Trigger payment process
```

#### `order-status-update`

**Mục đích**: Cập nhật trạng thái đơn hàng với side effects

**Lý do cần thiết**:

- **Business rules**: Validation chuyển trạng thái hợp lệ (FR28)
- **Inventory updates**: Trả lại stock khi hủy đơn (FR21)
- **Email notifications**: Gửi email khi status thay đổi (FR20)
- **Audit trail**: Log mọi thay đổi status
- **Integration**: Sync với shipping providers

### 3. Payment Integration

#### `payment-vnpay-webhook`

**Mục đích**: Xử lý webhook từ VNPay

**Lý do cần thiết**:

- **Security**: Verify signature từ VNPay
- **Idempotency**: Đảm bảo webhook chỉ xử lý 1 lần
- **Order completion**: Cập nhật order và payment status (FR17)
- **Stock confirmation**: Confirm stock reservation
- **Email notification**: Gửi email xác nhận thanh toán

#### `payment-momo-webhook`

**Mục đích**: Xử lý webhook từ MoMo

**Lý do cần thiết**:

- Tương tự VNPay nhưng với format và security khác
- MoMo có flow xác thực riêng
- Error handling khác với VNPay

#### `payment-initiate`

**Mục đích**: Khởi tạo thanh toán với providers

**Lý do cần thiết**:

- **Multiple providers**: VNPay, MoMo có API khác nhau (FR17)
- **Security**: Store sensitive payment info securely
- **Redirect handling**: Tạo proper redirect URLs
- **Error handling**: Xử lý lỗi từ payment providers

### 4. Inventory Management

#### `inventory-update`

**Mục đích**: Cập nhật tồn kho với business logic

**Lý do cần thiết**:

- **Concurrency control**: Xử lý multiple users mua cùng lúc
- **Low stock alerts**: Gửi cảnh báo khi sắp hết hàng (FR27)
- **Negative stock prevention**: Không cho phép bán khi hết hàng
- **Audit trail**: Log mọi thay đổi inventory

#### `stock-reservation`

**Mục đích**: Giữ stock trong quá trình checkout

**Lý do cần thiết**:

- **Race condition**: Prevent overselling
- **Time-based release**: Tự động release sau timeout
- **Order completion**: Confirm reservation khi order success

### 5. Communication & Notifications

#### `email-order-confirmation`

**Mục đích**: Gửi email xác nhận đơn hàng

**Lý do cần thiết**:

- **Template rendering**: Tạo HTML email đẹp với order details
- **Multi-language**: Support Vietnamese (primary) và English
- **Attachment**: Include invoice PDF
- **Delivery tracking**: Reliable email delivery

#### `email-status-update`

**Mục đích**: Gửi email khi order status thay đổi

**Lý do cần thiết**:

- **Dynamic content**: Email khác nhau cho mỗi status (FR20)
- **Tracking info**: Include tracking number khi shipped
- **Customer action**: Prompt review khi delivered (FR23)

#### `notification-low-stock`

**Mục đích**: Thông báo sắp hết hàng cho admin

**Lý do cần thiết**:

- **Real-time alerts**: Ngay khi stock < threshold (FR27)
- **Multiple channels**: Email, in-app notification
- **Batch processing**: Group multiple products

### 6. Analytics & Reporting

#### `analytics-sales-report`

**Mục đích**: Tạo báo cáo doanh thu

**Lý do cần thiết**:

- **Complex queries**: Aggregation across multiple tables (FR32)
- **Performance**: Heavy queries không nên chạy trên main DB
- **Caching**: Cache results cho báo cáo thường xuyên
- **Export formats**: PDF, Excel export (FR37)

#### `analytics-product-performance`

**Mục đích**: Phân tích hiệu suất sản phẩm

**Lý do cần thiết**:

- **Best sellers**: Sản phẩm bán chạy (FR33)
- **Recommendation engine**: Data cho recommendations
- **Inventory planning**: Predict demand

### 7. Search & Recommendations

#### `search-products`

**Mục đích**: Tìm kiếm sản phẩm nâng cao

**Lý do cần thiết**:

- **Full-text search**: Tìm kiếm theo tên, mô tả (FR09)
- **Faceted search**: Filter theo category, price, brand (FR10)
- **Search analytics**: Track search terms
- **Performance**: Cache popular searches

#### `recommendations-generate`

**Mục đích**: Tạo gợi ý sản phẩm

**Lý do cần thiết**:

- **Personalization**: Based on purchase history
- **Collaborative filtering**: "Customers who bought X also bought Y"
- **Real-time**: Update recommendations when user behavior changes

### 8. External Integrations

#### `shipping-calculate`

**Mục đích**: Tính phí vận chuyển

**Lý do cần thiết**:

- **Multiple providers**: Giao hàng nhanh, Grab, etc. (FR35)
- **Real-time rates**: Actual shipping costs
- **Address validation**: Verify delivery addresses
- **Delivery time estimates**: Show expected delivery dates

#### `shipping-track`

**Mục đích**: Theo dõi vận chuyển

**Lý do cần thiết**:

- **Provider APIs**: Different APIs for different providers
- **Status mapping**: Map provider status to internal status
- **Customer updates**: Auto-update customers về shipping progress

### 9. Data Processing

#### `data-cleanup`

**Mục đích**: Dọn dẹp dữ liệu định kỳ

**Lý do cần thiết**:

- **Cart expiry**: Xóa cart items cũ
- **Session cleanup**: Clean expired sessions
- **Log archiving**: Archive old logs
- **Stock reservations**: Release expired reservations

#### `data-migration`

**Mục đích**: Migration và data sync

**Lý do cần thiết**:

- **Schema updates**: Migrate data khi schema change
- **Data imports**: Import từ external systems
- **Backup/restore**: Data backup operations

## Kiến trúc Edge Functions

### Security

- Mọi function đều require authentication khi cần
- Input validation và sanitization
- Rate limiting để prevent abuse
- Audit logging cho sensitive operations

### Error Handling

- Comprehensive error handling
- Retry mechanisms cho external API calls
- Graceful degradation khi services unavailable
- Error notifications cho admins

### Performance

- Caching strategies cho expensive operations
- Database connection pooling
- Async processing cho heavy tasks
- Monitor và alert performance issues

### Monitoring

- Logging mọi function executions
- Performance metrics
- Error tracking
- Business metrics (orders, payments, etc.)

## Kết luận

Các Edge Functions này cần thiết để:

1. **Tách biệt business logic** khỏi frontend và database
2. **Đảm bảo data consistency** qua các atomic operations
3. **Tích hợp với external services** một cách an toàn
4. **Scale independently** based on load
5. **Maintain security** cho sensitive operations
6. **Provide real-time features** như notifications và inventory updates

Mỗi function giải quyết một business requirement cụ thể từ PRD và leverage schema design để đảm bảo data integrity và performance.
