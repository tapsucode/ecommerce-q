-- Insert default roles
INSERT INTO roles (name, description, created_at, updated_at, version) VALUES 
('ROLE_ADMIN', 'Administrator role with full access', NOW(), NOW(), 0),
('ROLE_MANAGER', 'Manager role with management access', NOW(), NOW(), 0),
('ROLE_EMPLOYEE', 'Employee role with basic access', NOW(), NOW(), 0);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, active, created_at, updated_at, version) VALUES 
('admin', 'admin@inventorypro.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'System Administrator', true, NOW(), NOW(), 0);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, country, customer_type, total_orders, total_spent, currency, active, created_at, updated_at, version) VALUES 
('John Smith', 'john.smith@email.com', '+1-555-0123', '123 Main St, New York, NY 10001', 'United States', 'RETAIL', 0, 0.00, 'USD', true, NOW(), NOW(), 0),
('Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0456', '456 Oak Ave, Los Angeles, CA 90210', 'United States', 'WHOLESALE', 0, 0.00, 'USD', true, NOW(), NOW(), 0),
('Emma Wilson', 'emma.wilson@email.com', '+44-20-7946-0958', '789 High Street, London, SW1A 1AA', 'United Kingdom', 'RETAIL', 0, 0.00, 'GBP', true, NOW(), NOW(), 0);

-- Insert sample products
INSERT INTO products (name, sku, category, description, price, cost, currency, active, created_at, updated_at, version) VALUES 
('Premium Cotton T-Shirt', 'TSH-001', 'Fashion', 'High-quality cotton t-shirt available in multiple colors', 29.99, 15.00, 'USD', true, NOW(), NOW(), 0),
('Ceramic Vase Set', 'VAS-001', 'Home Decoration', 'Beautiful ceramic vase set for home decoration', 89.99, 45.00, 'USD', true, NOW(), NOW(), 0),
('Designer Lamp', 'LAM-001', 'Home Decoration', 'Modern designer table lamp with LED lighting', 159.99, 80.00, 'USD', true, NOW(), NOW(), 0),
('Silk Scarf', 'SCF-001', 'Fashion', 'Luxury silk scarf with elegant patterns', 79.99, 40.00, 'USD', true, NOW(), NOW(), 0);

-- Insert product images
INSERT INTO product_images (product_id, image_url) VALUES 
(1, 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg'),
(2, 'https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg'),
(3, 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg'),
(4, 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg');

-- Insert product variants
INSERT INTO product_variants (name, sku, price, cost, stock, product_id, active, created_at, updated_at, version) VALUES 
('Small - Black', 'TSH-001-S-BLK', 29.99, 15.00, 25, 1, true, NOW(), NOW(), 0),
('Medium - Black', 'TSH-001-M-BLK', 29.99, 15.00, 30, 1, true, NOW(), NOW(), 0),
('Large - Black', 'TSH-001-L-BLK', 29.99, 15.00, 20, 1, true, NOW(), NOW(), 0),
('White', 'VAS-001-WHT', 89.99, 45.00, 15, 2, true, NOW(), NOW(), 0),
('Blue', 'VAS-001-BLU', 89.99, 45.00, 12, 2, true, NOW(), NOW(), 0);

-- Insert variant attributes
INSERT INTO variant_attributes (variant_id, attribute_name, attribute_value) VALUES 
(1, 'size', 'S'),
(1, 'color', 'Black'),
(2, 'size', 'M'),
(2, 'color', 'Black'),
(3, 'size', 'L'),
(3, 'color', 'Black'),
(4, 'color', 'White'),
(5, 'color', 'Blue');

-- Insert inventory items
INSERT INTO inventory_items (product_id, sku, current_stock, reserved_stock, reorder_level, warehouse, location, created_at, updated_at, version) VALUES 
(1, 'TSH-001', 75, 5, 20, 'Main Warehouse', 'A1-B2', NOW(), NOW(), 0),
(2, 'VAS-001', 27, 2, 10, 'Main Warehouse', 'B2-C3', NOW(), NOW(), 0),
(3, 'LAM-001', 45, 3, 15, 'Main Warehouse', 'C3-D4', NOW(), NOW(), 0),
(4, 'SCF-001', 18, 1, 8, 'Main Warehouse', 'D4-E5', NOW(), NOW(), 0);