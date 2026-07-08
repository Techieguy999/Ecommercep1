-- ============================================================
-- DEVTECH FASHION — ENTERPRISE DATABASE SEEDING (V3)
-- ============================================================

-- 1. Seed Roles with Static UUIDs
INSERT INTO roles (id, name, description) VALUES
('d3b07384-d113-4a3e-a5ae-be2416f46b31', 'customer', 'Default user access for browsing and shopping.'),
('d3b07384-d113-4a3e-a5ae-be2416f46b32', 'merchant', 'Staff role for product listings and order processing.'),
('d3b07384-d113-4a3e-a5ae-be2416f46b33', 'admin', 'Superuser administrative system access.')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Default Users with Static UUIDs
-- Password: "password123" (Bcrypt Hash: $2a$10$V0yU6BghcMeqgJb48/kPauoGZ04gqFz0zQG/t/4zP2dD/3wR2K3xG)
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, email_verified, status)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'd3b07384-d113-4a3e-a5ae-be2416f46b33',
    'System',
    'Administrator',
    'admin@devtech.com',
    '9999999999',
    '$2a$10$V0yU6BghcMeqgJb48/kPauoGZ04gqFz0zQG/t/4zP2dD/3wR2K3xG',
    TRUE,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Customer User
-- Password: "password123"
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, email_verified, status)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'd3b07384-d113-4a3e-a5ae-be2416f46b31',
    'Demo',
    'Customer',
    'customer@devtech.com',
    '9876543210',
    '$2a$10$V0yU6BghcMeqgJb48/kPauoGZ04gqFz0zQG/t/4zP2dD/3wR2K3xG',
    TRUE,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Bind Admin User to admin_users table
INSERT INTO admin_users (user_id, department)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Technology'
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Seed Categories
INSERT INTO categories (name, slug, description, created_by) VALUES
('Men''s Wear', 'men', 'Tailored suits, premium casuals, and luxury essentials.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Women''s Wear', 'women', 'Timeless grace, modern edits, and high-end dresses.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Kids Wear', 'kids', 'Luxury wear for kids.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Accessories', 'accessories', 'Luxury leather goods, bags, and items.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Brands
INSERT INTO brands (name, slug, logo_url, description, created_by) VALUES
('DevTech Couture', 'devtech-couture', '/assets/brands/dt.png', 'Tailored luxury bespoke clothing.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Prada Solutions', 'prada-solutions', '/assets/brands/prada.png', 'Elegant high-fashion accessory lineups.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed Products with HSN and SEO metadata
INSERT INTO products (category_id, brand_id, title, slug, description, price, compare_at_price, status, country_of_origin, hsn_code, tax_rate, seo_title, seo_description, search_keywords, created_by) VALUES
(
    (SELECT id FROM categories WHERE slug = 'men' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'devtech-couture' LIMIT 1),
    'Classic Indigo Tuxedo Suite',
    'classic-indigo-tuxedo',
    'Handcrafted premium Italian wool luxury tuxedo in standard midnight indigo.',
    24999.00,
    30000.00,
    'active',
    'India',
    '6203.11.00',
    12.00,
    'Bespoke Midnight Indigo Tuxedo Suite | DevTech',
    'Buy luxury handcrafted premium Italian wool tuxedo suit in midnight indigo colors.',
    'tuxedo, suit, men, indigo, tailoring',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    (SELECT id FROM categories WHERE slug = 'women' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'devtech-couture' LIMIT 1),
    'Silk Emerald Evening Dress',
    'silk-emerald-dress',
    'Timeless high-waisted organic silk evening dress in deep emerald colors.',
    18999.00,
    22000.00,
    'active',
    'India',
    '6204.42.00',
    12.00,
    'Bespoke Silk Emerald Evening Dress | DevTech',
    'Buy timeless high-waisted organic emerald silk evening dress online.',
    'dress, women, silk, emerald, formal',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Seed Product Images
INSERT INTO product_images (product_id, url, alt_text, sort_order, image_type) VALUES
(
    (SELECT id FROM products WHERE slug = 'classic-indigo-tuxedo' LIMIT 1),
    '/assets/products/tuxedo-main.jpg',
    'Midnight Indigo Tuxedo Suit Front View',
    1,
    'main'
),
(
    (SELECT id FROM products WHERE slug = 'silk-emerald-dress' LIMIT 1),
    '/assets/products/emerald-dress-main.jpg',
    'Silk Emerald Evening Dress Front View',
    1,
    'main'
);

-- 7. Seed Variants with weight, costs and dimensions
INSERT INTO product_variants (product_id, sku, barcode, price, cost_price, compare_at_price, weight, length, width, height, is_default, status, created_by) VALUES
(
    (SELECT id FROM products WHERE slug = 'classic-indigo-tuxedo' LIMIT 1),
    'SKU-TUX-IND-L',
    '8901234567890',
    24999.00,
    12000.00,
    30000.00,
    1.85,
    45.00,
    35.00,
    8.00,
    TRUE,
    'active',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    (SELECT id FROM products WHERE slug = 'silk-emerald-dress' LIMIT 1),
    'SKU-DRS-EME-M',
    '8901234567891',
    18999.00,
    9000.00,
    22000.00,
    0.65,
    30.00,
    25.00,
    4.00,
    TRUE,
    'active',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
)
ON CONFLICT (sku) DO NOTHING;

-- 8. Seed Warehouses
INSERT INTO warehouses (name, code, address, created_by) VALUES
('Primary Bengaluru Fulfilment Center', 'WH-BLR-01', 'Outer Ring Road, Bengaluru, Karnataka', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (code) DO NOTHING;

-- 9. Seed Inventory with damaged & returned properties
INSERT INTO inventory (variant_id, warehouse_id, quantity, reserved_quantity, damaged_quantity, returned_quantity, low_stock_threshold, updated_by) VALUES
(
    (SELECT id FROM product_variants WHERE sku = 'SKU-TUX-IND-L' LIMIT 1),
    (SELECT id FROM warehouses WHERE code = 'WH-BLR-01' LIMIT 1),
    50,
    0,
    0,
    0,
    5,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    (SELECT id FROM product_variants WHERE sku = 'SKU-DRS-EME-M' LIMIT 1),
    (SELECT id FROM warehouses WHERE code = 'WH-BLR-01' LIMIT 1),
    35,
    0,
    0,
    0,
    5,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
)
ON CONFLICT (variant_id) DO NOTHING;

-- 10. Seed Coupons
INSERT INTO coupons (code, type, value, min_purchase, start_date, end_date, active, created_by) VALUES
('LUXURY10', 'percentage', 10.00, 10000.00, NOW(), NOW() + INTERVAL '30 days', TRUE, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (code) DO NOTHING;

-- 11. Seed Homepage Banners
INSERT INTO homepage_banners (title, image_url, link_url, sort_order, active) VALUES
('The Bespoke Tailoring Suite', '/assets/banners/bespoke.jpg', '/collections/bespoke', 1, TRUE);

-- 12. Seed App Settings
INSERT INTO app_settings (key, value) VALUES
('store_name', '"DevTech Fashion"'),
('currency', '"INR"'),
('support_email', '"support@devtechfashion.com"')
ON CONFLICT (key) DO NOTHING;

-- 13. Seed Customer Address (Required for mock orders)
INSERT INTO user_addresses (id, user_id, full_name, mobile, house_number, street, area, city, state, pincode, latitude, longitude, verified, is_default) VALUES
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Demo Customer',
    '9876543210',
    'Flat 402',
    '12th Main Road',
    'Indiranagar',
    'Bengaluru',
    'Karnataka',
    '560038',
    12.9716,
    77.5946,
    TRUE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 14. Seed Default Order History & Line Items
INSERT INTO orders (id, order_number, user_id, address_id, status, payment_status, shipping_status, subtotal, total) VALUES
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    'ORD-2026-00001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'processing',
    'paid',
    'pending',
    24999.00,
    24999.00
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, variant_id, sku, title, variant_name, brand_name, price, quantity, subtotal, total) VALUES
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    (SELECT id FROM product_variants WHERE sku = 'SKU-TUX-IND-L' LIMIT 1),
    'SKU-TUX-IND-L',
    'Classic Indigo Tuxedo Suite',
    'Indigo / L',
    'DevTech Couture',
    24999.00,
    1,
    24999.00,
    24999.00
)
ON CONFLICT (id) DO NOTHING;
