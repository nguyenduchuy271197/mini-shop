-- =====================================================
-- Mini Ecommerce Seed Data
-- Purpose: Insert sample data for development and testing
-- Date: 2025-06-04
-- =====================================================

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE public.wishlists CASCADE;
TRUNCATE TABLE public.reviews CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.coupons CASCADE;
TRUNCATE TABLE public.cart_items CASCADE;
TRUNCATE TABLE public.addresses CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.categories CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS public.categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.addresses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.coupons_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.payments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.wishlists_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.user_roles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_number_seq RESTART WITH 1;

-- =====================================================
-- USER SETUP INSTRUCTIONS
-- =====================================================
-- 
-- IMPORTANT: Users must be created through Supabase Auth, not direct SQL inserts
-- 
-- To create test users:
-- 1. Use Supabase Dashboard Auth > Users section, or
-- 2. Use your frontend registration, or  
-- 3. Use Supabase CLI/API
--
-- Sample test users to create:
-- Email: admin@minishop.vn, Password: admin123456 (assign admin role)
-- Email: customer1@gmail.com, Password: customer123456
-- Email: customer2@gmail.com, Password: customer123456  
-- Email: customer3@gmail.com, Password: customer123456
-- Email: customer4@gmail.com, Password: customer123456
--
-- After creating users, update their UUIDs in the INSERT statements below
-- and uncomment the user-related data sections
-- =====================================================

-- =====================================================
-- CATEGORIES DATA
-- =====================================================

INSERT INTO public.categories (name, slug, description, image_url, is_active, sort_order) VALUES
-- Main categories only (flat structure)
('Điện tử', 'dien-tu', 'Thiết bị điện tử, công nghệ', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=300&fit=crop&crop=center', true, 1),
('Thời trang', 'thoi-trang', 'Quần áo, phụ kiện thời trang', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop&crop=center', true, 2),
('Gia dụng', 'gia-dung', 'Đồ dùng gia đình, nội thất', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop&crop=center', true, 3),
('Sách', 'sach', 'Sách văn học, giáo dục, kỹ năng', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop&crop=center', true, 4),
('Thể thao', 'the-thao', 'Dụng cụ thể thao, trang phục', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&crop=center', true, 5);

-- =====================================================
-- PRODUCTS DATA
-- =====================================================

INSERT INTO public.products (name, slug, description, short_description, sku, price, compare_price, cost_price, stock_quantity, low_stock_threshold, category_id, brand, weight, dimensions, images, tags, is_active, is_featured, meta_title, meta_description) VALUES

-- Electronics Products (category_id = 1: Điện tử)
('iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP và màn hình Super Retina XDR 6.7 inch. Thiết kế Titanium cao cấp với Action Button mới.', 'iPhone 15 Pro Max - Công nghệ tiên tiến nhất từ Apple', 'IP15PM256', 29990000.00, 32990000.00, 25000000.00, 50, 5, 1, 'Apple', 221.00, '{"length": 159.9, "width": 76.7, "height": 8.25}', '{"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&h=600&fit=crop"}', '{"smartphone", "apple", "iphone", "5g", "camera"}', true, true, 'iPhone 15 Pro Max 256GB - Công nghệ đỉnh cao', 'Mua iPhone 15 Pro Max chính hãng với giá tốt nhất'),

('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy S24 Ultra với S Pen tích hợp, camera 200MP và màn hình Dynamic AMOLED 2X. Hiệu năng mạnh mẽ với Snapdragon 8 Gen 3.', 'Galaxy S24 Ultra - Siêu phẩm Android', 'SGS24U512', 27990000.00, 29990000.00, 23000000.00, 30, 5, 1, 'Samsung', 232.00, '{"length": 162.3, "width": 79.0, "height": 8.6}', '{"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=600&fit=crop"}', '{"smartphone", "samsung", "android", "s-pen", "camera"}', true, true, 'Samsung Galaxy S24 Ultra - Smartphone cao cấp', 'Galaxy S24 Ultra chính hãng, bảo hành 12 tháng'),

('MacBook Air M2 13 inch', 'macbook-air-m2-13', 'MacBook Air với chip M2 mạnh mẽ, màn hình Liquid Retina 13.6 inch và thời lượng pin lên đến 18 giờ. Thiết kế mỏng nhẹ, hiệu suất vượt trội.', 'MacBook Air M2 - Laptop siêu mỏng nhẹ', 'MBA13M2256', 25990000.00, 27990000.00, 22000000.00, 25, 3, 1, 'Apple', 1240.00, '{"length": 304.1, "width": 215.0, "height": 11.3}', '{"https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop"}', '{"laptop", "apple", "macbook", "m2", "ultrabook"}', true, true, 'MacBook Air M2 13 inch - Laptop Apple chính hãng', 'Mua MacBook Air M2 giá tốt, bảo hành Apple Care'),

('Sony WH-1000XM5', 'sony-wh-1000xm5', 'Tai nghe không dây cao cấp với công nghệ chống ồn hàng đầu, âm thanh Hi-Res và thời lượng pin 30 giờ. Thiết kế thoải mái cho việc sử dụng lâu dài.', 'Sony WH-1000XM5 - Tai nghe chống ồn đỉnh cao', 'SXMZ5B', 6990000.00, 7990000.00, 5500000.00, 40, 5, 1, 'Sony', 250.00, '{"length": 254, "width": 220, "height": 80}', '{"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop"}', '{"tai-nghe", "sony", "wireless", "noise-cancelling"}', true, false, 'Sony WH-1000XM5 - Tai nghe chống ồn tốt nhất', 'Tai nghe Sony WH-1000XM5 chính hãng, chống ồn vượt trội'),

('Apple Watch Series 9', 'apple-watch-series-9', 'Apple Watch Series 9 với chip S9 mới, màn hình sáng hơn và tính năng Double Tap độc đáo. Theo dõi sức khỏe toàn diện với watchOS 10.', 'Apple Watch Series 9 - Đồng hồ thông minh tiên tiến', 'AWS9-45-GPS', 8990000.00, 9990000.00, 7500000.00, 35, 5, 1, 'Apple', 38.70, '{"length": 45, "width": 38, "height": 10.7}', '{"https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop"}', '{"smartwatch", "apple", "fitness", "health"}', true, true, 'Apple Watch Series 9 - Đồng hồ thông minh Apple', 'Mua Apple Watch Series 9 chính hãng, theo dõi sức khỏe'),

-- Fashion Products (category_id = 2: Thời trang)
('Áo thun nam cotton basic', 'ao-thun-nam-cotton-basic', 'Áo thun nam chất liệu cotton 100% thoáng mát, form regular fit thoải mái. Nhiều màu sắc cơ bản, dễ phối đồ.', 'Áo thun nam cotton chất lượng cao', 'ATNCB001', 199000.00, 299000.00, 120000.00, 100, 10, 2, 'Local Brand', 200.00, '{"length": 68, "width": 52, "height": 1}', '{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1583743814966-8936f37f4040?w=800&h=600&fit=crop"}', '{"áo thun", "nam", "cotton", "basic"}', true, false, 'Áo thun nam cotton basic - Chất lượng cao', 'Áo thun nam cotton 100% thoáng mát, form đẹp'),

('Váy nữ midi elegant', 'vay-nu-midi-elegant', 'Váy nữ dáng midi thanh lịch, chất liệu voan cao cấp. Thiết kế đơn giản nhưng sang trọng, phù hợp đi làm và dự tiệc.', 'Váy nữ midi thanh lịch cho phái đẹp', 'VNME002', 599000.00, 799000.00, 350000.00, 60, 8, 2, 'Fashion House', 300.00, '{"length": 110, "width": 45, "height": 2}', '{"https://images.unsplash.com/photo-1566479179817-c5d90b37c0a6?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop"}', '{"váy", "nữ", "midi", "elegant", "công sở"}', true, true, 'Váy nữ midi elegant - Thời trang công sở', 'Váy nữ midi thanh lịch, chất liệu cao cấp'),

('Quần jean nam slim fit', 'quan-jean-nam-slim-fit', 'Quần jean nam dáng slim fit ôm vừa phải, chất liệu denim cao cấp có độ co giãn. Màu xanh đậm cổ điển, dễ phối với nhiều trang phục.', 'Quần jean nam slim fit thời trang', 'QJNSF003', 799000.00, 999000.00, 500000.00, 80, 10, 2, 'Denim Co', 600.00, '{"length": 105, "width": 40, "height": 3}', '{"https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1506629905025-f21e1ceae669?w=800&h=600&fit=crop"}', '{"quần jean", "nam", "slim fit", "denim"}', true, false, 'Quần jean nam slim fit - Thời trang nam', 'Quần jean nam slim fit, chất denim cao cấp co giãn'),

('Giày thể thao nữ running', 'giay-the-thao-nu-running', 'Giày thể thao nữ chuyên dụng cho chạy bộ, đế giày êm ái với công nghệ đệm khí. Thiết kế năng động, thoáng khí.', 'Giày thể thao nữ chạy bộ chuyên nghiệp', 'GTTNR004', 1299000.00, 1599000.00, 800000.00, 45, 5, 2, 'SportMax', 400.00, '{"length": 24, "width": 8, "height": 6}', '{"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop"}', '{"giày", "thể thao", "nữ", "running", "sport"}', true, true, 'Giày thể thao nữ running - Chạy bộ chuyên nghiệp', 'Giày thể thao nữ running, đế êm công nghệ tiên tiến'),

-- Home Products (category_id = 3: Gia dụng)
('Bàn làm việc gỗ tự nhiên', 'ban-lam-viec-go-tu-nhien', 'Bàn làm việc chất liệu gỗ tự nhiên, thiết kế hiện đại với ngăn kéo tiện lợi. Kích thước 120x60cm phù hợp cho văn phòng và nhà ở.', 'Bàn làm việc gỗ tự nhiên cao cấp', 'BLVGTN005', 2599000.00, 2999000.00, 1800000.00, 20, 3, 3, 'Wood Furniture', 25000.00, '{"length": 120, "width": 60, "height": 75}', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"}', '{"bàn", "làm việc", "gỗ", "furniture", "văn phòng"}', true, false, 'Bàn làm việc gỗ tự nhiên - Nội thất cao cấp', 'Bàn làm việc gỗ tự nhiên, thiết kế hiện đại tiện lợi'),

('Nồi cơm điện cao tần', 'noi-com-dien-cao-tan', 'Nồi cơm điện công nghệ cao tần IH, dung tích 1.8L phù hợp gia đình 4-6 người. Nấu cơm ngon với nhiều chế độ nấu khác nhau.', 'Nồi cơm điện IH cao cấp 1.8L', 'NCDCT006', 3599000.00, 3999000.00, 2800000.00, 30, 5, 3, 'Kitchen Pro', 4500.00, '{"length": 27, "width": 32, "height": 21}', '{"https://images.unsplash.com/photo-1556909114-c7b37bb5e813?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop"}', '{"nồi cơm", "điện", "IH", "nhà bếp", "gia dụng"}', true, true, 'Nồi cơm điện cao tần IH - Nhà bếp thông minh', 'Nồi cơm điện IH cao cấp, nấu cơm ngon hoàn hảo'),

-- Books (category_id = 4: Sách)
('Đắc Nhân Tâm', 'dac-nhan-tam', 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử của Dale Carnegie. Một trong những cuốn sách bán chạy nhất mọi thời đại về phát triển bản thân.', 'Sách Đắc Nhân Tâm - Nghệ thuật giao tiếp', 'DNT007', 89000.00, 120000.00, 60000.00, 200, 20, 4, 'NXB Tổng Hợp', 400.00, '{"length": 20.5, "width": 14, "height": 2}', '{"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop"}', '{"sách", "kỹ năng", "giao tiếp", "phát triển bản thân"}', true, true, 'Đắc Nhân Tâm - Sách kỹ năng giao tiếp hay nhất', 'Sách Đắc Nhân Tâm của Dale Carnegie, nghệ thuật giao tiếp');

-- =====================================================
-- COUPONS DATA
-- =====================================================

INSERT INTO public.coupons (code, name, type, value, minimum_amount, maximum_discount, usage_limit, used_count, is_active, starts_at, expires_at) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'percentage', 10.00, 500000.00, 100000.00, 100, 5, true, '2024-01-01 00:00:00+07', '2024-12-31 23:59:59+07'),
('SAVE50K', 'Giảm 50K cho đơn từ 1 triệu', 'fixed_amount', 50000.00, 1000000.00, NULL, 200, 12, true, '2024-01-01 00:00:00+07', '2024-12-31 23:59:59+07'),
('SUMMER20', 'Khuyến mãi mùa hè', 'percentage', 20.00, 2000000.00, 500000.00, 50, 8, true, '2024-06-01 00:00:00+07', '2024-08-31 23:59:59+07'),
('FREESHIP', 'Miễn phí vận chuyển', 'fixed_amount', 30000.00, 300000.00, 30000.00, 500, 45, true, '2024-01-01 00:00:00+07', '2024-12-31 23:59:59+07'),
('EXPIRED', 'Mã đã hết hạn', 'percentage', 15.00, 500000.00, 200000.00, 100, 0, false, '2023-01-01 00:00:00+07', '2023-12-31 23:59:59+07');

-- =====================================================
-- USER-DEPENDENT DATA (UNCOMMENT AFTER CREATING USERS)
-- =====================================================
-- 
-- The following sections require actual user UUIDs from auth.users
-- Create users first, then replace the UUIDs and uncomment these sections
-- 

/*
-- =====================================================
-- SAMPLE USER PROFILES & ROLES
-- =====================================================
-- Replace these UUIDs with actual user UUIDs from auth.users after user creation

-- Insert sample profiles
INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, date_of_birth, gender) VALUES
-- Admin user - replace with actual admin UUID
('YOUR-ADMIN-UUID-HERE', 'admin@minishop.vn', 'Nguyễn Văn Admin', '0901234567', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '1990-01-15', 'male'),
-- Customer users - replace with actual customer UUIDs
('YOUR-CUSTOMER1-UUID-HERE', 'customer1@gmail.com', 'Trần Thị Hương', '0912345678', 'https://images.unsplash.com/photo-1494790108755-2616b612b2bc?w=150&h=150&fit=crop&crop=face', '1995-03-20', 'female'),
('YOUR-CUSTOMER2-UUID-HERE', 'customer2@gmail.com', 'Lê Văn Minh', '0923456789', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '1988-07-10', 'male'),
('YOUR-CUSTOMER3-UUID-HERE', 'customer3@gmail.com', 'Phạm Thị Lan', '0934567890', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', '1992-11-05', 'female'),
('YOUR-CUSTOMER4-UUID-HERE', 'customer4@gmail.com', 'Hoàng Văn Đức', '0945678901', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '1985-09-12', 'male');

-- Insert user roles
INSERT INTO public.user_roles (user_id, role) VALUES
('YOUR-ADMIN-UUID-HERE', 'admin'),
('YOUR-ADMIN-UUID-HERE', 'customer'), -- Admin can also be customer
('YOUR-CUSTOMER1-UUID-HERE', 'customer'),
('YOUR-CUSTOMER2-UUID-HERE', 'customer'),
('YOUR-CUSTOMER3-UUID-HERE', 'customer'),
('YOUR-CUSTOMER4-UUID-HERE', 'customer');

-- =====================================================
-- ADDRESSES DATA
-- =====================================================

INSERT INTO public.addresses (user_id, type, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default) VALUES
-- Customer 1 addresses
('YOUR-CUSTOMER1-UUID-HERE', 'shipping', 'Trần', 'Thị Hương', NULL, '123 Đường Lê Lợi', 'Phường Bến Nghé', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '70000', 'VN', '0912345678', true),
('YOUR-CUSTOMER1-UUID-HERE', 'billing', 'Trần', 'Thị Hương', 'Công ty ABC', '456 Đường Nguyễn Huệ', 'Phường Bến Nghé', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '70000', 'VN', '0912345678', true),

-- Customer 2 addresses  
('YOUR-CUSTOMER2-UUID-HERE', 'shipping', 'Lê', 'Văn Minh', NULL, '789 Đường Trần Hưng Đạo', 'Phường Cầu Kho', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '70000', 'VN', '0923456789', true),

-- Customer 3 addresses
('YOUR-CUSTOMER3-UUID-HERE', 'shipping', 'Phạm', 'Thị Lan', NULL, '101 Đường Hai Bà Trưng', 'Phường Đa Kao', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '70000', 'VN', '0934567890', true),
('YOUR-CUSTOMER3-UUID-HERE', 'shipping', 'Phạm', 'Thị Lan', NULL, '202 Đường Lý Tự Trọng', NULL, 'Hà Nội', 'Hà Nội', '10000', 'VN', '0934567890', false);

-- =====================================================
-- ORDERS DATA
-- =====================================================

INSERT INTO public.orders (user_id, order_number, status, payment_status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, shipping_method, shipping_address, billing_address, coupon_id, coupon_code, tracking_number, shipped_at, delivered_at, notes) VALUES

-- Order 1 - Delivered
('YOUR-CUSTOMER1-UUID-HERE', 'ORD-20241201-000001', 'delivered', 'paid', 29990000.00, 2999000.00, 30000.00, 100000.00, 32919000.00, 'Giao hàng nhanh', 
'{"first_name": "Trần", "last_name": "Thị Hương", "address_line_1": "123 Đường Lê Lợi", "address_line_2": "Phường Bến Nghé", "city": "TP. Hồ Chí Minh", "state": "TP. Hồ Chí Minh", "postal_code": "70000", "country": "VN", "phone": "0912345678"}',
'{"first_name": "Trần", "last_name": "Thị Hương", "company": "Công ty ABC", "address_line_1": "456 Đường Nguyễn Huệ", "address_line_2": "Phường Bến Nghé", "city": "TP. Hồ Chí Minh", "state": "TP. Hồ Chí Minh", "postal_code": "70000", "country": "VN", "phone": "0912345678"}',
1, 'WELCOME10', 'GHN123456789', '2024-12-02 10:00:00+07', '2024-12-04 14:30:00+07', 'Giao hàng tận nơi'),

-- Order 2 - Processing
('YOUR-CUSTOMER2-UUID-HERE', 'ORD-20241203-000002', 'processing', 'paid', 32989000.00, 3298900.00, 30000.00, 50000.00, 36267900.00, 'Giao hàng tiêu chuẩn',
'{"first_name": "Lê", "last_name": "Văn Minh", "address_line_1": "789 Đường Trần Hưng Đạo", "address_line_2": "Phường Cầu Kho", "city": "TP. Hồ Chí Minh", "state": "TP. Hồ Chí Minh", "postal_code": "70000", "country": "VN", "phone": "0923456789"}',
'{"first_name": "Lê", "last_name": "Văn Minh", "address_line_1": "789 Đường Trần Hưng Đạo", "address_line_2": "Phường Cầu Kho", "city": "TP. Hồ Chí Minh", "state": "TP. Hồ Chí Minh", "postal_code": "70000", "country": "VN", "phone": "0923456789"}',
2, 'SAVE50K', NULL, NULL, NULL, 'Khách hàng VIP'),

-- Order 3 - Pending
('YOUR-CUSTOMER3-UUID-HERE', 'ORD-20241205-000003', 'pending', 'pending', 41970000.00, 4197000.00, 30000.00, 0.00, 46197000.00, 'Giao hàng nhanh',
'{"first_name": "Phạm", "last_name": "Thị Lan", "address_line_1": "101 Đường Hai Bà Trưng", "address_line_2": "Phường Đa Kao", "city": "TP. Hồ Chí Minh", "state": "TP. Hồ Chí Minh", "postal_code": "70000", "country": "VN", "phone": "0934567890"}',
'{"first_name": "Phạm", "last_name": "Thị Lan", "address_line_1": "101 Đường Hai Bà Trưng", "address_line_2": "Phường Đa Kao", "city": "TP. Hồ Chí Minh", "state": "TP. Hồ Chí Minh", "postal_code": "70000", "country": "VN", "phone": "0934567890"}',
NULL, NULL, NULL, NULL, NULL, NULL);

-- =====================================================
-- ORDER ITEMS DATA
-- =====================================================

INSERT INTO public.order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price) VALUES
-- Order 1 items
(1, 1, 'iPhone 15 Pro Max 256GB', 'IP15PM256', 1, 29990000.00, 29990000.00),

-- Order 2 items  
(2, 1, 'iPhone 15 Pro Max 256GB', 'IP15PM256', 1, 29990000.00, 29990000.00),
(2, 7, 'Váy nữ midi elegant', 'VNME002', 5, 599000.00, 2999000.00),

-- Order 3 items
(3, 3, 'MacBook Air M2 13 inch', 'MBA13M2256', 1, 25990000.00, 25990000.00),
(3, 4, 'Sony WH-1000XM5', 'SXMZ5B', 1, 6990000.00, 6990000.00),
(3, 5, 'Apple Watch Series 9', 'AWS9-45-GPS', 1, 8990000.00, 8990000.00);

-- =====================================================
-- PAYMENTS DATA
-- =====================================================

INSERT INTO public.payments (order_id, payment_method, payment_provider, transaction_id, amount, currency, status, gateway_response, processed_at, stripe_session_id, stripe_payment_intent_id) VALUES
-- Payment for Order 1
(1, 'vnpay', 'VNPay', 'VNP123456789', 32919000.00, 'VND', 'completed', 
'{"vnp_ResponseCode": "00", "vnp_TransactionStatus": "00", "vnp_BankCode": "NCB", "vnp_PayDate": "20241201101530"}', 
'2024-12-01 10:15:30+07', NULL, NULL),

-- Payment for Order 2
(2, 'momo', 'MoMo', 'MOMO987654321', 36267900.00, 'VND', 'completed',
'{"partnerCode": "MOMO", "resultCode": 0, "message": "Successful", "transId": "987654321"}',
'2024-12-03 15:20:45+07', NULL, NULL),

-- Payment for Order 3 (pending)
(3, 'cod', NULL, NULL, 46197000.00, 'VND', 'pending', NULL, NULL, NULL, NULL);

-- =====================================================
-- REVIEWS DATA
-- =====================================================

INSERT INTO public.reviews (user_id, product_id, order_id, rating, title, comment, is_verified, is_approved, helpful_count) VALUES
-- Review for iPhone (from delivered order)
('YOUR-CUSTOMER1-UUID-HERE', 1, 1, 5, 'Sản phẩm tuyệt vời!', 'iPhone 15 Pro Max rất đáng tiền. Camera chất lượng cao, pin trâu, thiết kế đẹp. Rất hài lòng với sản phẩm này.', true, true, 8),

-- More reviews
('YOUR-CUSTOMER2-UUID-HERE', 4, NULL, 4, 'Tai nghe chất lượng', 'Sony WH-1000XM5 chống ồn rất tốt, âm thanh trong trẻo. Hơi nặng một chút nhưng đáng đồng tiền bát gạo.', false, true, 3),

('YOUR-CUSTOMER4-UUID-HERE', 6, NULL, 5, 'Áo thun chất lượng', 'Chất cotton mềm mại, thoáng mát. Size chuẩn, màu sắc đẹp. Sẽ mua thêm.', false, true, 5),

('YOUR-CUSTOMER3-UUID-HERE', 11, NULL, 4, 'Nồi cơm ngon', 'Nấu cơm rất ngon, nhiều chế độ tiện lợi. Thiết kế đẹp, dễ sử dụng.', false, true, 2);

-- =====================================================
-- WISHLISTS DATA
-- =====================================================

INSERT INTO public.wishlists (user_id, product_id) VALUES
-- Customer 1 wishlist
('YOUR-CUSTOMER1-UUID-HERE', 3), -- MacBook Air
('YOUR-CUSTOMER1-UUID-HERE', 5), -- Apple Watch
('YOUR-CUSTOMER1-UUID-HERE', 9), -- Giày thể thao

-- Customer 2 wishlist
('YOUR-CUSTOMER2-UUID-HERE', 2), -- Samsung Galaxy
('YOUR-CUSTOMER2-UUID-HERE', 10), -- Bàn làm việc

-- Customer 3 wishlist
('YOUR-CUSTOMER3-UUID-HERE', 4), -- Sony headphone
('YOUR-CUSTOMER3-UUID-HERE', 7), -- Váy nữ
('YOUR-CUSTOMER3-UUID-HERE', 12); -- Đắc Nhân Tâm

-- =====================================================
-- CART ITEMS DATA (current active carts)
-- =====================================================

INSERT INTO public.cart_items (user_id, product_id, quantity) VALUES
-- Customer 1 current cart
('YOUR-CUSTOMER1-UUID-HERE', 2, 1), -- Samsung Galaxy
('YOUR-CUSTOMER1-UUID-HERE', 4, 1), -- Sony headphone

-- Customer 2 current cart  
('YOUR-CUSTOMER2-UUID-HERE', 6, 2), -- Áo thun nam
('YOUR-CUSTOMER2-UUID-HERE', 8, 1), -- Quần jean
('YOUR-CUSTOMER2-UUID-HERE', 12, 3), -- Sách

-- Customer 4 current cart
('YOUR-CUSTOMER4-UUID-HERE', 10, 1), -- Bàn làm việc
('YOUR-CUSTOMER4-UUID-HERE', 11, 1); -- Nồi cơm điện

*/

-- =====================================================
-- UPDATE SEQUENCES TO CONTINUE FROM CURRENT MAX IDS
-- =====================================================

-- Update sequences to current max + 1
SELECT setval('public.categories_id_seq', (SELECT MAX(id) FROM public.categories) + 1);
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products) + 1);
SELECT setval('public.coupons_id_seq', (SELECT MAX(id) FROM public.coupons) + 1);

-- =====================================================
-- HELPER FUNCTION TO ADD ADMIN ROLE
-- =====================================================

-- Function to assign admin role to a user (call after user creation)
CREATE OR REPLACE FUNCTION assign_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get user ID from auth.users by email
    SELECT au.id INTO target_user_id
    FROM auth.users au
    WHERE au.email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned to user %', user_email;
END;
$$;

-- =====================================================
-- SETUP INSTRUCTIONS
-- =====================================================

-- To complete the seed data setup:
-- 
-- 1. Create test users through Supabase Auth (Dashboard, CLI, or frontend)
-- 2. Note down the UUIDs from auth.users
-- 3. Replace all 'YOUR-*-UUID-HERE' placeholders with actual UUIDs
-- 4. Uncomment the user-dependent sections above
-- 5. Run the script again
--
-- Example to assign admin role after user creation:
-- SELECT assign_admin_role('admin@minishop.vn');
--
-- =====================================================

-- =====================================================
-- SEED DATA COMPLETED (BASIC STRUCTURE)
-- =====================================================
