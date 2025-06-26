-- Enhanced Database Schema following ADR principles
-- ADR 01: UTF8MB4 support for multilingual data
-- ADR 02: JSONB for flexible product attributes and bundle management
-- ADR 03: Separation of ProductType and Category
-- ADR 04: Rule-based promotion system

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Users and Authentication
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name ENUM('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE') UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE TABLE user_roles (
    user_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =====================================================
-- ADR 03: PRODUCT TYPE SYSTEM (Structure Definition)
-- =====================================================

-- Product Types define the structure and attributes for products
CREATE TABLE product_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    -- ADR 02: JSONB for flexible attribute definitions
    -- Example: {"size": {"type": "select", "required": true, "variant": true, "options": ["S", "M", "L"]}}
    attribute_definitions JSON,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- =====================================================
-- ADR 03: CATEGORY SYSTEM (Display Organization)
-- =====================================================

-- Categories for display organization and navigation
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    parent_id BIGINT,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_slug (slug)
);

-- =====================================================
-- ADR 02: ENHANCED PRODUCT SYSTEM
-- =====================================================

-- Main products table with enhanced structure
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- ADR 03: Reference to ProductType for structure definition
    product_type_id BIGINT,
    
    -- ADR 03: Reference to Category for display organization
    category_id BIGINT,
    
    -- ADR 02: JSONB for flexible product attributes
    -- Example: {"color": "Red", "material": "Cotton", "season": "Summer"}
    attributes JSON,
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_sku (sku),
    INDEX idx_product_type (product_type_id),
    INDEX idx_category (category_id),
    INDEX idx_active (active)
);

-- Product images
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

-- =====================================================
-- ADR 02: PRODUCT VARIANTS WITH JSONB ATTRIBUTES
-- =====================================================

-- Product variants with flexible attributes
CREATE TABLE product_variants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    
    -- ADR 02: JSONB for variant-specific attributes
    -- Example: {"size": "L", "color": "Red"}
    attributes JSON,
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_sku (sku),
    INDEX idx_active (active)
);

-- =====================================================
-- ADR 02: BUNDLE MANAGEMENT SYSTEM
-- =====================================================

-- Bundles for combo products
CREATE TABLE bundles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    INDEX idx_sku (sku),
    INDEX idx_active (active)
);

-- Bundle items for managing combo products
CREATE TABLE bundle_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bundle_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (bundle_id) REFERENCES bundles(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_bundle_id (bundle_id),
    INDEX idx_product_id (product_id)
);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

CREATE TABLE inventory_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT,
    variant_id BIGINT,
    sku VARCHAR(100) NOT NULL,
    current_stock INT DEFAULT 0,
    reserved_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    warehouse VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_variant_id (variant_id),
    INDEX idx_sku (sku),
    INDEX idx_warehouse (warehouse)
);

-- =====================================================
-- ADR 01: CUSTOMER MANAGEMENT WITH UTF8MB4
-- =====================================================

CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    city VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    country VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    postal_code VARCHAR(20),
    customer_type ENUM('RETAIL', 'WHOLESALE') DEFAULT 'RETAIL',
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    last_order_at TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    INDEX idx_email (email),
    INDEX idx_customer_type (customer_type),
    INDEX idx_country (country),
    INDEX idx_active (active)
);

-- =====================================================
-- ORDER MANAGEMENT
-- =====================================================

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    channel ENUM('ONLINE', 'RETAIL', 'WHOLESALE') DEFAULT 'ONLINE',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_order_number (order_number),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_channel (channel),
    INDEX idx_created_at (created_at)
);

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    variant_id BIGINT,
    bundle_id BIGINT,
    product_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (bundle_id) REFERENCES bundles(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_variant_id (variant_id),
    INDEX idx_bundle_id (bundle_id)
);

-- =====================================================
-- ADR 04: RULE-BASED PROMOTION SYSTEM
-- =====================================================

CREATE TABLE promotions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    type ENUM('PERCENTAGE_DISCOUNT', 'FIXED_AMOUNT_DISCOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'BUNDLE_DISCOUNT') NOT NULL,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    usage_limit INT NULL,
    usage_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    INDEX idx_type (type),
    INDEX idx_active (active),
    INDEX idx_dates (start_date, end_date)
);

-- ADR 04: Flexible promotion rules stored as JSON
CREATE TABLE promotion_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    promotion_id BIGINT NOT NULL,
    rule_type ENUM('CONDITION', 'ACTION') NOT NULL,
    -- Examples:
    -- Condition: {"condition": "cart_total", "operator": ">=", "value": 100}
    -- Action: {"action": "discount_percentage", "value": 10}
    rule_data JSON NOT NULL,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    INDEX idx_promotion_id (promotion_id),
    INDEX idx_rule_type (rule_type),
    INDEX idx_priority (priority)
);

-- =====================================================
-- SEARCH AND FILTERING SUPPORT TABLES
-- =====================================================

-- Product search index for faceted search
CREATE TABLE product_search_attributes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    searchable BOOLEAN DEFAULT TRUE,
    filterable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_attribute_name (attribute_name),
    INDEX idx_attribute_value (attribute_value),
    INDEX idx_searchable (searchable),
    INDEX idx_filterable (filterable)
);

-- Variant search attributes for variant lookup
CREATE TABLE variant_search_attributes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    variant_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_variant_id (variant_id),
    INDEX idx_product_id (product_id),
    INDEX idx_attribute_name (attribute_name),
    INDEX idx_attribute_value (attribute_value),
    UNIQUE KEY unique_variant_attribute (variant_id, attribute_name)
);

-- =====================================================
-- AUDIT AND LOGGING TABLES
-- =====================================================

CREATE TABLE stock_movements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inventory_item_id BIGINT NOT NULL,
    movement_type ENUM('IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    reference_type ENUM('ORDER', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'RESTOCK') NULL,
    reference_id BIGINT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_inventory_item_id (inventory_item_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for product with all related information
CREATE VIEW product_details AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.description,
    p.price,
    p.cost,
    p.currency,
    p.attributes,
    p.active,
    pt.name as product_type_name,
    pt.attribute_definitions,
    c.name as category_name,
    c.slug as category_slug,
    COUNT(pv.id) as variant_count,
    COALESCE(SUM(ii.current_stock), 0) as total_stock,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN product_types pt ON p.product_type_id = pt.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.active = TRUE
LEFT JOIN inventory_items ii ON p.id = ii.product_id
WHERE p.active = TRUE
GROUP BY p.id;

-- View for available product options (for PDP)
CREATE VIEW product_available_options AS
SELECT 
    p.id as product_id,
    vsa.attribute_name,
    vsa.attribute_value,
    COUNT(DISTINCT pv.id) as variant_count,
    SUM(CASE WHEN ii.current_stock > ii.reserved_stock THEN 1 ELSE 0 END) as available_variants
FROM products p
JOIN product_variants pv ON p.id = pv.product_id AND pv.active = TRUE
JOIN variant_search_attributes vsa ON pv.id = vsa.variant_id
LEFT JOIN inventory_items ii ON pv.id = ii.variant_id
WHERE p.active = TRUE
GROUP BY p.id, vsa.attribute_name, vsa.attribute_value
HAVING available_variants > 0;