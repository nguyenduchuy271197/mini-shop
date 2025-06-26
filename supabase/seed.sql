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

('Quần jean nam slim fit', 'quan-jean-nam-slim-fit', 'Quần jean nam dáng slim fit ôm vừa phải, chất liệu denim cao cấp có độ co giãn. Màu xanh đậm cổ điển, dễ phối với nhiều trang phục.', 'Quần jean nam slim fit thời trang', 'QJNSF003', 799000.00, 999000.00, 500000.00, 80, 10, 2, 'Denim Co', 600.00, '{"length": 105, "width": 40, "height": 3}', '{"https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1506629905025-f21e1ceae669?w=800&h=600&fit=crop"}', '{"quần jean", "nam", "slim fit", "denim"}', true, false, 'Quần jean nam slim fit - Thời trang nam', 'Quần jean nam slim fit, chất denim cao cấp co giãn'),

('Giày thể thao nữ running', 'giay-the-thao-nu-running', 'Giày thể thao nữ chuyên dụng cho chạy bộ, đế giày êm ái với công nghệ đệm khí. Thiết kế năng động, thoáng khí.', 'Giày thể thao nữ chạy bộ chuyên nghiệp', 'GTTNR004', 1299000.00, 1599000.00, 800000.00, 45, 5, 2, 'SportMax', 400.00, '{"length": 24, "width": 8, "height": 6}', '{"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop"}', '{"giày", "thể thao", "nữ", "running", "sport"}', true, true, 'Giày thể thao nữ running - Chạy bộ chuyên nghiệp', 'Giày thể thao nữ running, đế êm công nghệ tiên tiến'),

-- Home Products (category_id = 3: Gia dụng)
('Bàn làm việc gỗ tự nhiên', 'ban-lam-viec-go-tu-nhien', 'Bàn làm việc chất liệu gỗ tự nhiên, thiết kế hiện đại với ngăn kéo tiện lợi. Kích thước 120x60cm phù hợp cho văn phòng và nhà ở.', 'Bàn làm việc gỗ tự nhiên cao cấp', 'BLVGTN005', 2599000.00, 2999000.00, 1800000.00, 20, 3, 3, 'Wood Furniture', 25000.00, '{"length": 120, "width": 60, "height": 75}', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"}', '{"bàn", "làm việc", "gỗ", "furniture", "văn phòng"}', true, false, 'Bàn làm việc gỗ tự nhiên - Nội thất cao cấp', 'Bàn làm việc gỗ tự nhiên, thiết kế hiện đại tiện lợi'),

-- Home Products (category_id = 3: Gia dụng) - Continued
('Tủ lạnh Inverter 320L', 'tu-lanh-inverter-320l', 'Tủ lạnh Inverter 320L tiết kiệm điện, công nghệ làm lạnh đa chiều. Ngăn đông mềm, ngăn rau quả tươi lâu. Thiết kế hiện đại sang trọng.', 'Tủ lạnh Inverter 320L tiết kiệm điện', 'TLI320L', 8999000.00, 10999000.00, 7200000.00, 15, 2, 3, 'CoolTech', 45000.00, '{"length": 60, "width": 66, "height": 175}', '{"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop"}', '{"tủ lạnh", "inverter", "tiết kiệm điện", "320L"}', true, false, 'Tủ lạnh Inverter 320L - Tiết kiệm điện tối ưu', 'Tủ lạnh Inverter 320L, công nghệ làm lạnh hiện đại'),

('Máy giặt lồng ngang 8kg', 'may-giat-long-ngang-8kg', 'Máy giặt lồng ngang 8kg với 12 chương trình giặt đa dạng. Công nghệ Inverter tiết kiệm điện, giặt sạch và bảo vệ vải tối ưu.', 'Máy giặt lồng ngang 8kg hiệu quả cao', 'MGLN8KG', 7299000.00, 8499000.00, 5800000.00, 18, 2, 3, 'WashMax', 65000.00, '{"length": 60, "width": 55, "height": 85}', '{"https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"}', '{"máy giặt", "lồng ngang", "8kg", "inverter"}', true, true, 'Máy giặt lồng ngang 8kg - Giặt sạch hoàn hảo', 'Máy giặt lồng ngang 8kg, 12 chương trình giặt đa dạng'),

('Sofa 3 chỗ ngồi hiện đại', 'sofa-3-cho-ngoi-hien-dai', 'Sofa 3 chỗ ngồi phong cách hiện đại, chất liệu vải bố cao cấp chống bám bẩn. Khung gỗ tự nhiên chắc chắn, đệm mút cao cấp êm ái.', 'Sofa 3 chỗ ngồi phong cách hiện đại', 'SF3CNHD', 12999000.00, 15999000.00, 9500000.00, 10, 2, 3, 'HomeFurni', 85000.00, '{"length": 200, "width": 90, "height": 80}', '{"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"}', '{"sofa", "3 chỗ", "hiện đại", "nội thất"}', true, false, 'Sofa 3 chỗ ngồi hiện đại - Nội thất cao cấp', 'Sofa 3 chỗ ngồi hiện đại, chất liệu vải bố cao cấp'),

('Điều hòa Inverter 1.5HP', 'dieu-hoa-inverter-1-5hp', 'Điều hòa Inverter 1.5HP tiết kiệm điện đến 68%, làm lạnh nhanh và êm ái. Công nghệ kháng khuẩn, lọc không khí hiệu quả.', 'Điều hòa Inverter 1.5HP tiết kiệm điện', 'DHI15HP', 8599000.00, 9999000.00, 6800000.00, 22, 3, 3, 'CoolAir', 35000.00, '{"length": 84, "width": 29, "height": 32}', '{"https://images.unsplash.com/photo-1581093458791-9d42e138471d?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&h=600&fit=crop"}', '{"điều hòa", "inverter", "1.5HP", "tiết kiệm điện"}', true, true, 'Điều hòa Inverter 1.5HP - Làm lạnh tiết kiệm', 'Điều hòa Inverter 1.5HP, tiết kiệm điện đến 68%'),

-- Electronics Products (category_id = 1: Điện tử) - Continued
('iPad Pro M2 11 inch', 'ipad-pro-m2-11-inch', 'iPad Pro với chip M2 mạnh mẽ, màn hình Liquid Retina 11 inch hỗ trợ Apple Pencil. Hiệu năng đồ họa vượt trội cho công việc chuyên nghiệp.', 'iPad Pro M2 11 inch - Tablet chuyên nghiệp', 'IPADPROM2', 20990000.00, 23990000.00, 17500000.00, 30, 3, 1, 'Apple', 466.00, '{"length": 247.6, "width": 178.5, "height": 5.9}', '{"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop"}', '{"tablet", "ipad", "apple", "m2", "pro"}', true, true, 'iPad Pro M2 11 inch - Tablet chuyên nghiệp Apple', 'iPad Pro M2 11 inch, hiệu năng mạnh mẽ cho sáng tạo'),

('Dell XPS 13 Plus', 'dell-xps-13-plus', 'Laptop Dell XPS 13 Plus với Intel Core i7 thế hệ 12, màn hình OLED 13.4 inch tuyệt đẹp. Thiết kế premium với bàn phím cảm ứng hiện đại.', 'Dell XPS 13 Plus - Laptop premium cao cấp', 'DXPS13P', 32990000.00, 36990000.00, 28000000.00, 15, 2, 1, 'Dell', 1260.00, '{"length": 295.3, "width": 199.04, "height": 15.28}', '{"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop"}', '{"laptop", "dell", "xps", "premium", "oled"}', true, false, 'Dell XPS 13 Plus - Laptop premium OLED', 'Dell XPS 13 Plus với màn hình OLED tuyệt đẹp'),

('AirPods Pro 2nd Gen', 'airpods-pro-2nd-gen', 'AirPods Pro thế hệ 2 với chip H2, chống ồn thích ứng cải tiến và âm thanh không gian. Hộp sạc MagSafe với thời lượng pin lên đến 30 giờ.', 'AirPods Pro 2 - Tai nghe true wireless cao cấp', 'APP2GEN', 5999000.00, 6999000.00, 4800000.00, 60, 5, 1, 'Apple', 50.80, '{"length": 60.9, "width": 45.2, "height": 21.7}', '{"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop"}', '{"airpods", "wireless", "apple", "noise-cancelling"}', true, true, 'AirPods Pro 2nd Gen - Tai nghe không dây Apple', 'AirPods Pro thế hệ 2, chống ồn thích ứng tiên tiến'),

('Samsung 55" QLED 4K TV', 'samsung-55-qled-4k-tv', 'Smart TV Samsung QLED 55 inch 4K với công nghệ Quantum Dot, HDR10+ và Tizen OS. Thiết kế viền mỏng, âm thanh Dolby Atmos sống động.', 'Samsung QLED 55 inch - Smart TV 4K cao cấp', 'SQLED55', 16999000.00, 19999000.00, 13500000.00, 12, 2, 1, 'Samsung', 17200.00, '{"length": 123.1, "width": 70.7, "height": 5.77}', '{"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1461151304267-ef46e8ba9296?w=800&h=600&fit=crop"}', '{"tv", "samsung", "qled", "4k", "smart"}', true, true, 'Samsung 55" QLED 4K TV - Smart TV cao cấp', 'Smart TV Samsung QLED 55 inch 4K, công nghệ tiên tiến'),

('Gaming Mouse Logitech G Pro X', 'gaming-mouse-logitech-g-pro-x', 'Chuột gaming Logitech G Pro X Superlight với cảm biến HERO 25K DPI, trọng lượng siêu nhẹ chỉ 63g. Thiết kế ambidextrous cho game thủ chuyên nghiệp.', 'Gaming Mouse Logitech G Pro X Superlight', 'GMGPX', 2799000.00, 3299000.00, 2200000.00, 40, 5, 1, 'Logitech', 63.00, '{"length": 125, "width": 63.5, "height": 40}', '{"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=600&fit=crop"}', '{"gaming", "mouse", "logitech", "pro", "esports"}', true, false, 'Gaming Mouse Logitech G Pro X - Chuột chơi game', 'Chuột gaming Logitech G Pro X, siêu nhẹ 63g'),

('Bàn phím cơ Keychron K8', 'ban-phim-co-keychron-k8', 'Bàn phím cơ Keychron K8 TKL wireless với switch Gateron, keycap PBT double-shot. Kết nối Bluetooth 5.1 và USB-C, tương thích Mac và PC.', 'Bàn phím cơ Keychron K8 - Wireless TKL', 'BPCK8', 2199000.00, 2599000.00, 1700000.00, 35, 5, 1, 'Keychron', 720.00, '{"length": 359, "width": 127, "height": 34}', '{"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=600&fit=crop"}', '{"bàn phím", "cơ", "wireless", "gaming", "keychron"}', true, false, 'Bàn phím cơ Keychron K8 - Wireless cao cấp', 'Bàn phím cơ Keychron K8 TKL, kết nối wireless'),

-- Fashion Products (category_id = 2: Thời trang) - Continued
('Đầm nữ dạ hội sang trọng', 'dam-nu-da-hoi-sang-trong', 'Đầm dạ hội nữ chất liệu lụa cao cấp, thiết kế ôm body tôn dáng. Họa tiết thêu tay tinh tế, phù hợp cho các sự kiện quan trọng.', 'Đầm dạ hội nữ cao cấp sang trọng', 'DNDHST', 1599000.00, 2199000.00, 1000000.00, 25, 3, 2, 'Luxury Fashion', 400.00, '{"length": 120, "width": 50, "height": 3}', '{"https://images.unsplash.com/photo-1566479179817-c5d90b37c0a6?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=600&fit=crop"}', '{"đầm", "dạ hội", "nữ", "lụa", "sang trọng"}', true, true, 'Đầm nữ dạ hội sang trọng - Thời trang cao cấp', 'Đầm dạ hội nữ lụa cao cấp, thiết kế sang trọng'),

('Áo khoác nam bomber jacket', 'ao-khoac-nam-bomber-jacket', 'Áo khoác bomber jacket nam phong cách streetwear, chất liệu polyester chống nước. Thiết kế trẻ trung với nhiều túi tiện dụng.', 'Áo khoác bomber jacket nam streetwear', 'AKNBJ', 899000.00, 1199000.00, 600000.00, 50, 8, 2, 'StreetStyle', 600.00, '{"length": 70, "width": 55, "height": 4}', '{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1583743814966-8936f37f4040?w=800&h=600&fit=crop"}', '{"áo khoác", "bomber", "nam", "streetwear"}', true, false, 'Áo khoác nam bomber jacket - Streetwear thời trang', 'Áo khoác bomber jacket nam, phong cách streetwear'),

('Túi xách nữ da thật', 'tui-xach-nu-da-that', 'Túi xách nữ chất liệu da bò thật cao cấp, thiết kế tote bag sang trọng. Nhiều ngăn tiện lợi, phù hợp đi làm và dạo phố.', 'Túi xách nữ da thật cao cấp', 'TXNDT', 1299000.00, 1699000.00, 850000.00, 40, 5, 2, 'LeatherCraft', 800.00, '{"length": 35, "width": 12, "height": 28}', '{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop"}', '{"túi xách", "nữ", "da thật", "tote bag"}', true, true, 'Túi xách nữ da thật - Phụ kiện cao cấp', 'Túi xách nữ da bò thật, thiết kế tote bag sang trọng'),

('Giày boot nam da lộn', 'giay-boot-nam-da-lon', 'Giày boot nam chất liệu da lộn cao cấp, thiết kế cổ điển Chelsea boot. Đế cao su chống trượt, phong cách lịch lãm cho nam giới.', 'Giày boot nam da lộn Chelsea style', 'GBNV', 1899000.00, 2399000.00, 1300000.00, 30, 4, 2, 'Gentleman', 1200.00, '{"length": 28, "width": 10, "height": 12}', '{"https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&h=600&fit=crop"}', '{"giày", "boot", "nam", "da lộn", "chelsea"}', true, false, 'Giày boot nam da lộn - Phong cách lịch lãm', 'Giày boot nam da lộn Chelsea, thiết kế cổ điển'),

('Đồng hồ nam thép không gỉ', 'dong-ho-nam-thep-khong-gi', 'Đồng hồ nam chất liệu thép không gỉ 316L, mặt kính sapphire chống trầy. Máy cơ automatic Swiss, chống nước 10ATM.', 'Đồng hồ nam thép không gỉ cao cấp', 'DHNTKG', 3599000.00, 4299000.00, 2800000.00, 20, 3, 2, 'TimeClassic', 150.00, '{"length": 4.2, "width": 4.2, "height": 1.2}', '{"https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop"}', '{"đồng hồ", "nam", "thép", "automatic", "swiss"}', true, true, 'Đồng hồ nam thép không gỉ - Máy cơ Swiss', 'Đồng hồ nam thép 316L, máy cơ automatic Swiss'),

('Quần short nữ jean', 'quan-short-nu-jean', 'Quần short jean nữ dáng high-waist trendy, chất liệu denim cotton có độ co giãn. Màu xanh nhạt vintage, phối với nhiều trang phục.', 'Quần short jean nữ high-waist', 'QSNJ', 399000.00, 599000.00, 250000.00, 80, 10, 2, 'Denim Girl', 300.00, '{"length": 35, "width": 38, "height": 2}', '{"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop"}', '{"quần short", "jean", "nữ", "high-waist"}', true, false, 'Quần short jean nữ high-waist - Denim thời trang', 'Quần short jean nữ high-waist, chất denim co giãn'),

-- Books (category_id = 4: Sách)
('Đắc Nhân Tâm', 'dac-nhan-tam', 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử của Dale Carnegie. Một trong những cuốn sách bán chạy nhất mọi thời đại về phát triển bản thân.', 'Sách Đắc Nhân Tâm - Nghệ thuật giao tiếp', 'DNT007', 89000.00, 120000.00, 60000.00, 200, 20, 4, 'NXB Tổng Hợp', 400.00, '{"length": 20.5, "width": 14, "height": 2}', '{"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop"}', '{"sách", "kỹ năng", "giao tiếp", "phát triển bản thân"}', true, true, 'Đắc Nhân Tâm - Sách kỹ năng giao tiếp hay nhất', 'Sách Đắc Nhân Tâm của Dale Carnegie, nghệ thuật giao tiếp'),

('Tư Duy Nhanh Và Chậm', 'tu-duy-nhanh-va-cham', 'Cuốn sách về tâm lý học nhận thức của Daniel Kahneman. Khám phá cách bộ não con người đưa ra quyết định thông qua hai hệ thống tư duy.', 'Tư Duy Nhanh Và Chậm - Tâm lý học nhận thức', 'TDNVC', 169000.00, 220000.00, 120000.00, 150, 15, 4, 'NXB Thế Giới', 450.00, '{"length": 23, "width": 15.5, "height": 2.8}', '{"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop"}', '{"sách", "tâm lý học", "tư duy", "khoa học"}', true, true, 'Tư Duy Nhanh Và Chậm - Tâm lý học hành vi', 'Sách Tư Duy Nhanh Và Chậm, khám phá cơ chế tư duy'),

('Sapiens - Lược Sử Loài Người', 'sapiens-luoc-su-loai-nguoi', 'Tác phẩm của Yuval Noah Harari về lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại. Cái nhìn độc đáo về văn minh nhân loại.', 'Sapiens - Lược sử loài người', 'SPLS', 199000.00, 269000.00, 150000.00, 120, 12, 4, 'NXB Thế Giới', 520.00, '{"length": 23, "width": 15.5, "height": 3.2}', '{"https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop"}', '{"sách", "lịch sử", "nhân loại", "triết học"}', true, false, 'Sapiens - Lược sử loài người Yuval Harari', 'Sách Sapiens, lược sử loài người từ thời tiền sử'),

('Atomic Habits', 'atomic-habits-thoi-quen-nguyen-tu', 'Cuốn sách về xây dựng thói quen tích cực của James Clear. Phương pháp khoa học để tạo lập thói quen tốt và loại bỏ thói quen xấu.', 'Atomic Habits - Thói quen nguyên tử', 'AH2024', 149000.00, 199000.00, 110000.00, 180, 18, 4, 'NXB Thế Giới', 380.00, '{"length": 23, "width": 15.5, "height": 2.5}', '{"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop"}', '{"sách", "thói quen", "phát triển bản thân", "kỹ năng"}', true, true, 'Atomic Habits - Thói quen nguyên tử James Clear', 'Sách Atomic Habits, xây dựng thói quen tích cực'),

('Rich Dad Poor Dad', 'rich-dad-poor-dad', 'Cuốn sách kinh điển về tài chính cá nhân của Robert Kiyosaki. Bài học về tư duy làm giàu và quản lý tài chính thông minh.', 'Rich Dad Poor Dad - Cha giàu cha nghèo', 'RDPD', 119000.00, 159000.00, 85000.00, 160, 16, 4, 'NXB Lao Động', 350.00, '{"length": 20.5, "width": 14, "height": 2.2}', '{"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"}', '{"sách", "tài chính", "đầu tư", "làm giàu"}', true, false, 'Rich Dad Poor Dad - Cha giàu cha nghèo', 'Sách Rich Dad Poor Dad, bài học tài chính cá nhân'),

('The 7 Habits - 7 Thói Quen', 'the-7-habits-7-thoi-quen', 'Cuốn sách nổi tiếng của Stephen Covey về 7 thói quen của người thành đạt. Nguyên tắc sống hiệu quả cho thành công bền vững.', '7 Thói Quen Của Người Thành Đạt', '7HABITS', 139000.00, 189000.00, 100000.00, 140, 14, 4, 'NXB Tổng Hợp', 420.00, '{"length": 23, "width": 15.5, "height": 2.6}', '{"https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"}', '{"sách", "thành công", "thói quen", "lãnh đạo"}', true, true, '7 Thói Quen Của Người Thành Đạt - Stephen Covey', 'Sách 7 thói quen, nguyên tắc sống hiệu quả'),

-- Sports Products (category_id = 5: Thể thao)
('Giày chạy bộ Nike Air Zoom', 'giay-chay-bo-nike-air-zoom', 'Giày chạy bộ Nike Air Zoom với công nghệ đệm khí Zoom Air, đế ngoài cao su chống mài mòn. Thiết kế breathable thoáng khí cho runner.', 'Giày chạy bộ Nike Air Zoom chuyên nghiệp', 'GCBNAZ', 2599000.00, 2999000.00, 2000000.00, 45, 5, 5, 'Nike', 280.00, '{"length": 30, "width": 11, "height": 10}', '{"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop"}', '{"giày", "chạy bộ", "nike", "thể thao", "running"}', true, true, 'Giày chạy bộ Nike Air Zoom - Chuyên nghiệp', 'Giày chạy bộ Nike Air Zoom, công nghệ đệm tiên tiến'),

('Bóng đá FIFA Quality Pro', 'bong-da-fifa-quality-pro', 'Bóng đá chuẩn FIFA Quality Pro cho thi đấu chuyên nghiệp, chất liệu da PU cao cấp. Trọng lượng và kích thước đúng tiêu chuẩn quốc tế.', 'Bóng đá FIFA Quality Pro chuẩn thi đấu', 'BDFQP', 899000.00, 1199000.00, 650000.00, 60, 8, 5, 'SportsBall', 450.00, '{"length": 22, "width": 22, "height": 22}', '{"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"}', '{"bóng đá", "fifa", "thể thao", "thi đấu"}', true, false, 'Bóng đá FIFA Quality Pro - Chuẩn thi đấu', 'Bóng đá FIFA Quality Pro, chất lượng chuyên nghiệp'),

('Gậy golf iron set Titleist', 'gay-golf-iron-set-titleist', 'Bộ gậy golf iron Titleist T200 cho golfer trung bình, thiết kế cavity back dễ đánh. Shaft graphite nhẹ, tăng khoảng cách đánh bóng.', 'Gậy golf Titleist T200 Iron Set', 'GGIST200', 24999000.00, 29999000.00, 20000000.00, 8, 1, 5, 'Titleist', 3500.00, '{"length": 95, "width": 20, "height": 15}', '{"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"}', '{"golf", "gậy golf", "titleist", "iron set"}', true, true, 'Gậy golf Titleist T200 Iron Set - Chuyên nghiệp', 'Gậy golf Titleist T200, thiết kế cavity back'),

('Xe đạp thể thao Giant', 'xe-dap-the-thao-giant', 'Xe đạp thể thao Giant ATX 27.5 với khung nhôm siêu nhẹ, phanh đĩa thủy lực. Hệ thống truyền động Shimano 21 tốc độ mượt mà.', 'Xe đạp thể thao Giant ATX 27.5', 'XDTTG275', 8999000.00, 10999000.00, 7200000.00, 15, 2, 5, 'Giant', 13500.00, '{"length": 180, "width": 60, "height": 100}', '{"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop"}', '{"xe đạp", "thể thao", "giant", "mountain bike"}', true, false, 'Xe đạp thể thao Giant ATX 27.5 - MTB cao cấp', 'Xe đạp thể thao Giant, khung nhôm siêu nhẹ'),

('Găng tay boxing Everlast', 'gang-tay-boxing-everlast', 'Găng tay boxing Everlast PowerLock 16oz cho tập luyện và thi đấu. Da PU cao cấp, đệm foam đa lớp bảo vệ tay hiệu quả.', 'Găng tay boxing Everlast PowerLock 16oz', 'GTBE16', 1299000.00, 1599000.00, 950000.00, 40, 5, 5, 'Everlast', 800.00, '{"length": 32, "width": 18, "height": 12}', '{"https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"}', '{"găng tay", "boxing", "everlast", "võ thuật"}', true, false, 'Găng tay boxing Everlast PowerLock - Chuyên nghiệp', 'Găng tay boxing Everlast 16oz, da PU cao cấp'),

('Tạ đơn cao su 20kg', 'ta-don-cao-su-20kg', 'Tạ đơn cao su 20kg cho tập gym tại nhà, bề mặt cao su chống trầy sàn. Tay cầm ergonomic chống trượt, dễ dàng sử dụng.', 'Tạ đơn cao su 20kg cho tập gym', 'TDCS20', 799000.00, 999000.00, 550000.00, 30, 3, 5, 'FitnessPro', 20000.00, '{"length": 35, "width": 18, "height": 18}', '{"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"}', '{"tạ", "gym", "fitness", "tập luyện", "20kg"}', true, true, 'Tạ đơn cao su 20kg - Tập gym tại nhà', 'Tạ đơn cao su 20kg, tay cầm chống trượt');

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
