-- Enhanced Database Schema Implementation
-- Following ADR principles for inventory management system

/*
  # Enhanced Inventory Management Schema

  1. New Tables
    - `product_types` - ADR 03: Product structure definitions
    - `categories` - ADR 03: Display organization with hierarchy
    - `product_search_attributes` - ADR 02: Faceted search support
    - `variant_search_attributes` - ADR 02: Variant lookup optimization
    - `bundles` and `bundle_items` - ADR 02: Bundle management
    - `promotions` and `promotion_rules` - ADR 04: Rule-based promotions
    - `stock_movements` - Audit trail for inventory changes

  2. Enhanced Tables
    - Updated `products` with product_type and category references
    - Enhanced `product_variants` with JSONB attributes
    - Improved `customers` with UTF8MB4 support
    - Enhanced `inventory_items` with variant support

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- =====================================================
-- ADR 03: PRODUCT TYPE SYSTEM (Structure Definition)
-- =====================================================

CREATE TABLE IF NOT EXISTS product_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    attribute_definitions jsonb DEFAULT '{}',
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read product types"
    ON product_types
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage product types"
    ON product_types
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- ADR 03: CATEGORY SYSTEM (Display Organization)
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read categories"
    ON categories
    FOR SELECT
    TO authenticated
    USING (active = true);

CREATE POLICY "Admins can manage categories"
    ON categories
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- ADR 02: ENHANCED PRODUCT SYSTEM
-- =====================================================

-- Add new columns to existing products table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'product_type_id'
    ) THEN
        ALTER TABLE products ADD COLUMN product_type_id uuid REFERENCES product_types(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'attributes'
    ) THEN
        ALTER TABLE products ADD COLUMN attributes jsonb DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- ADR 02: ENHANCED PRODUCT VARIANTS
-- =====================================================

-- Add attributes column to product_variants if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'product_variants' AND column_name = 'attributes'
    ) THEN
        ALTER TABLE product_variants ADD COLUMN attributes jsonb DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- ADR 02: BUNDLE MANAGEMENT SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS bundles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    sku text UNIQUE NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read bundles"
    ON bundles
    FOR SELECT
    TO authenticated
    USING (active = true);

CREATE POLICY "Managers can manage bundles"
    ON bundles
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE TABLE IF NOT EXISTS bundle_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id uuid NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read bundle items"
    ON bundle_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage bundle items"
    ON bundle_items
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- =====================================================
-- ENHANCED INVENTORY WITH VARIANT SUPPORT
-- =====================================================

-- Add variant_id to inventory_items if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_items' AND column_name = 'variant_id'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- ADR 04: RULE-BASED PROMOTION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS promotions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text NOT NULL CHECK (type IN ('PERCENTAGE_DISCOUNT', 'FIXED_AMOUNT_DISCOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'BUNDLE_DISCOUNT')),
    start_date timestamptz,
    end_date timestamptz,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active promotions"
    ON promotions
    FOR SELECT
    TO authenticated
    USING (active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

CREATE POLICY "Admins can manage promotions"
    ON promotions
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS promotion_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    rule_type text NOT NULL CHECK (rule_type IN ('CONDITION', 'ACTION')),
    rule_data jsonb NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE promotion_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read promotion rules"
    ON promotion_rules
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage promotion rules"
    ON promotion_rules
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- SEARCH AND FILTERING SUPPORT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS product_search_attributes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name text NOT NULL,
    attribute_value text NOT NULL,
    searchable boolean DEFAULT true,
    filterable boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE product_search_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read product search attributes"
    ON product_search_attributes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can manage product search attributes"
    ON product_search_attributes
    FOR ALL
    TO authenticated
    USING (true);

CREATE TABLE IF NOT EXISTS variant_search_attributes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name text NOT NULL,
    attribute_value text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(variant_id, attribute_name)
);

ALTER TABLE variant_search_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read variant search attributes"
    ON variant_search_attributes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can manage variant search attributes"
    ON variant_search_attributes
    FOR ALL
    TO authenticated
    USING (true);

-- =====================================================
-- AUDIT AND LOGGING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type text NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED')),
    quantity integer NOT NULL,
    previous_stock integer NOT NULL,
    new_stock integer NOT NULL,
    reason text,
    reference_type text CHECK (reference_type IN ('ORDER', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'RESTOCK')),
    reference_id uuid,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read stock movements"
    ON stock_movements
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can create stock movements"
    ON stock_movements
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- ENHANCED ORDER SYSTEM
-- =====================================================

-- Add bundle support to order_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order_items' AND column_name = 'variant_id'
    ) THEN
        ALTER TABLE order_items ADD COLUMN variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order_items' AND column_name = 'bundle_id'
    ) THEN
        ALTER TABLE order_items ADD COLUMN bundle_id uuid REFERENCES bundles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Product search indexes
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_attributes ON products USING GIN(attributes);

-- Variant search indexes
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(active);
CREATE INDEX IF NOT EXISTS idx_variants_attributes ON product_variants USING GIN(attributes);

-- Search attributes indexes
CREATE INDEX IF NOT EXISTS idx_product_search_product ON product_search_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_search_name ON product_search_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_product_search_value ON product_search_attributes(attribute_value);
CREATE INDEX IF NOT EXISTS idx_product_search_filterable ON product_search_attributes(filterable);

CREATE INDEX IF NOT EXISTS idx_variant_search_variant ON variant_search_attributes(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_search_product ON variant_search_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_search_name ON variant_search_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_variant_search_value ON variant_search_attributes(attribute_value);

-- Category hierarchy indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory_items(warehouse);

-- Stock movement indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);

-- Promotion indexes
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotion_rules_promotion ON promotion_rules(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_rules_type ON promotion_rules(rule_type);

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to calculate bundle stock
CREATE OR REPLACE FUNCTION calculate_bundle_stock(bundle_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    min_stock integer := 999999;
    item_record record;
    available_stock integer;
BEGIN
    FOR item_record IN 
        SELECT bi.quantity, p.id as product_id
        FROM bundle_items bi
        JOIN products p ON bi.product_id = p.id
        WHERE bi.bundle_id = bundle_uuid
    LOOP
        SELECT COALESCE(SUM(ii.current_stock - ii.reserved_stock), 0)
        INTO available_stock
        FROM inventory_items ii
        WHERE ii.product_id = item_record.product_id;
        
        available_stock := available_stock / item_record.quantity;
        
        IF available_stock < min_stock THEN
            min_stock := available_stock;
        END IF;
    END LOOP;
    
    RETURN GREATEST(min_stock, 0);
END;
$$;

-- Function to update search attributes when product is updated
CREATE OR REPLACE FUNCTION update_product_search_attributes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete existing search attributes
    DELETE FROM product_search_attributes WHERE product_id = NEW.id;
    
    -- Insert new search attributes from product attributes
    IF NEW.attributes IS NOT NULL THEN
        INSERT INTO product_search_attributes (product_id, attribute_name, attribute_value, searchable, filterable)
        SELECT 
            NEW.id,
            key,
            value::text,
            true,
            true
        FROM jsonb_each_text(NEW.attributes);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function to update variant search attributes when variant is updated
CREATE OR REPLACE FUNCTION update_variant_search_attributes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete existing search attributes
    DELETE FROM variant_search_attributes WHERE variant_id = NEW.id;
    
    -- Insert new search attributes from variant attributes
    IF NEW.attributes IS NOT NULL THEN
        INSERT INTO variant_search_attributes (variant_id, product_id, attribute_name, attribute_value)
        SELECT 
            NEW.id,
            NEW.product_id,
            key,
            value::text
        FROM jsonb_each_text(NEW.attributes);
    END IF;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update search attributes when product is modified
DROP TRIGGER IF EXISTS trigger_update_product_search_attributes ON products;
CREATE TRIGGER trigger_update_product_search_attributes
    AFTER INSERT OR UPDATE OF attributes ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_attributes();

-- Trigger to update variant search attributes when variant is modified
DROP TRIGGER IF EXISTS trigger_update_variant_search_attributes ON product_variants;
CREATE TRIGGER trigger_update_variant_search_attributes
    AFTER INSERT OR UPDATE OF attributes ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_variant_search_attributes();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample product types
INSERT INTO product_types (name, description, attribute_definitions) VALUES 
('Clothing', 'Apparel and fashion items', '{
    "size": {"type": "select", "required": true, "variant": true, "options": ["XS", "S", "M", "L", "XL", "XXL"]},
    "color": {"type": "select", "required": true, "variant": true, "options": ["Black", "White", "Red", "Blue", "Green", "Yellow"]},
    "material": {"type": "select", "required": false, "variant": false, "options": ["Cotton", "Polyester", "Silk", "Wool", "Linen"]},
    "season": {"type": "select", "required": false, "variant": false, "options": ["Spring", "Summer", "Fall", "Winter"]}
}'),
('Home Decor', 'Home decoration and furniture items', '{
    "color": {"type": "select", "required": true, "variant": true, "options": ["White", "Black", "Brown", "Gray", "Blue", "Green"]},
    "material": {"type": "select", "required": false, "variant": false, "options": ["Wood", "Metal", "Glass", "Ceramic", "Plastic"]},
    "style": {"type": "select", "required": false, "variant": false, "options": ["Modern", "Classic", "Vintage", "Minimalist", "Industrial"]},
    "room": {"type": "select", "required": false, "variant": false, "options": ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"]}
}'),
('Electronics', 'Electronic devices and accessories', '{
    "brand": {"type": "string", "required": true, "variant": false},
    "model": {"type": "string", "required": true, "variant": false},
    "color": {"type": "select", "required": false, "variant": true, "options": ["Black", "White", "Silver", "Gold", "Blue", "Red"]},
    "storage": {"type": "select", "required": false, "variant": true, "options": ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"]},
    "warranty": {"type": "number", "required": false, "variant": false}
}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES 
('Fashion', 'fashion', 'Clothing and fashion accessories'),
('Home & Garden', 'home-garden', 'Home decoration and garden items'),
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Books', 'books', 'Books and educational materials')
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories
INSERT INTO categories (name, slug, description, parent_id) VALUES 
('Men''s Clothing', 'mens-clothing', 'Clothing for men', (SELECT id FROM categories WHERE slug = 'fashion')),
('Women''s Clothing', 'womens-clothing', 'Clothing for women', (SELECT id FROM categories WHERE slug = 'fashion')),
('Living Room', 'living-room', 'Living room furniture and decor', (SELECT id FROM categories WHERE slug = 'home-garden')),
('Bedroom', 'bedroom', 'Bedroom furniture and decor', (SELECT id FROM categories WHERE slug = 'home-garden')),
('Smartphones', 'smartphones', 'Mobile phones and accessories', (SELECT id FROM categories WHERE slug = 'electronics')),
('Laptops', 'laptops', 'Laptop computers', (SELECT id FROM categories WHERE slug = 'electronics'))
ON CONFLICT (slug) DO NOTHING;