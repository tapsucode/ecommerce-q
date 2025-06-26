/*
  # Enhanced Order Workflow System

  1. Order Management Enhancements
    - Add salesperson tracking
    - Add shipping information
    - Enhanced order status workflow
    - Tracking code management

  2. Supplier & Purchase Order Management
    - Suppliers table
    - Purchase orders for inventory management
    - Purchase order items

  3. Return Management
    - Order returns tracking
    - Return reasons and conditions

  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- =====================================================
-- ENHANCED ORDER MANAGEMENT
-- =====================================================

-- Add new columns to orders table for enhanced workflow
DO $$
BEGIN
    -- Salesperson tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'salesperson_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN salesperson_id uuid REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Platform and shipping information
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'platform_order_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN platform_order_id text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'shipping_provider'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_provider text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'tracking_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN tracking_code text UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'shipping_fee'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_fee decimal(10,2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'shipping_address_details'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_address_details text;
    END IF;

    -- Confirmation and shipping timestamps
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'confirmed_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN confirmed_at timestamptz;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'shipped_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipped_at timestamptz;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN completed_at timestamptz;
    END IF;
END $$;

-- Update order status enum to match workflow
DO $$
BEGIN
    -- Drop existing constraint if exists
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    
    -- Add new constraint with enhanced statuses
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'RETURNED', 'CANCELLED'));
END $$;

-- =====================================================
-- SUPPLIER MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    address text,
    payment_terms text,
    notes text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read suppliers"
    ON suppliers
    FOR SELECT
    TO authenticated
    USING (active = true);

CREATE POLICY "Managers can manage suppliers"
    ON suppliers
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- =====================================================
-- PURCHASE ORDER MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number text UNIQUE NOT NULL,
    supplier_id uuid NOT NULL REFERENCES suppliers(id),
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date date,
    status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED')),
    total_cost decimal(10,2) DEFAULT 0.00,
    notes text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read purchase orders"
    ON purchase_orders
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage purchase orders"
    ON purchase_orders
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    variant_id uuid REFERENCES product_variants(id),
    product_name text NOT NULL,
    sku text NOT NULL,
    quantity integer NOT NULL,
    cost_price decimal(10,2) NOT NULL,
    received_quantity integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read purchase order items"
    ON purchase_order_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage purchase order items"
    ON purchase_order_items
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- =====================================================
-- RETURN MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS order_returns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id),
    return_number text UNIQUE NOT NULL,
    return_date date NOT NULL DEFAULT CURRENT_DATE,
    reason text NOT NULL CHECK (reason IN ('DAMAGED', 'WRONG_ITEM', 'CUSTOMER_CHANGE_MIND', 'QUALITY_ISSUE', 'OTHER')),
    condition text NOT NULL CHECK (condition IN ('NEW', 'DAMAGED', 'USED')),
    notes text,
    processed_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE order_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order returns"
    ON order_returns
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can manage order returns"
    ON order_returns
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager', 'employee'));

CREATE TABLE IF NOT EXISTS order_return_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id uuid NOT NULL REFERENCES order_returns(id) ON DELETE CASCADE,
    order_item_id uuid NOT NULL REFERENCES order_items(id),
    product_id uuid REFERENCES products(id),
    variant_id uuid REFERENCES product_variants(id),
    quantity integer NOT NULL,
    condition text NOT NULL CHECK (condition IN ('NEW', 'DAMAGED', 'USED')),
    restock boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE order_return_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order return items"
    ON order_return_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can manage order return items"
    ON order_return_items
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager', 'employee'));

-- =====================================================
-- INVENTORY RECEIVING
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_receipts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number text UNIQUE NOT NULL,
    purchase_order_id uuid REFERENCES purchase_orders(id),
    supplier_id uuid NOT NULL REFERENCES suppliers(id),
    receipt_date date NOT NULL DEFAULT CURRENT_DATE,
    notes text,
    received_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE inventory_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read inventory receipts"
    ON inventory_receipts
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can manage inventory receipts"
    ON inventory_receipts
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager', 'employee'));

CREATE TABLE IF NOT EXISTS inventory_receipt_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id uuid NOT NULL REFERENCES inventory_receipts(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    variant_id uuid REFERENCES product_variants(id),
    product_name text NOT NULL,
    sku text NOT NULL,
    quantity integer NOT NULL,
    cost_price decimal(10,2) NOT NULL,
    expiry_date date,
    batch_number text,
    created_at timestamptz DEFAULT now(),
    version bigint DEFAULT 0
);

ALTER TABLE inventory_receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read inventory receipt items"
    ON inventory_receipt_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Employees can manage inventory receipt items"
    ON inventory_receipt_items
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'manager', 'employee'));

-- =====================================================
-- ENHANCED STOCK MOVEMENTS
-- =====================================================

-- Add more movement types for comprehensive tracking
DO $$
BEGIN
    ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_movement_type_check;
    ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_movement_type_check 
    CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED', 'RETURN', 'DAMAGE', 'TRANSFER'));

    ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_reference_type_check;
    ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_reference_type_check 
    CHECK (reference_type IN ('ORDER', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'RESTOCK', 'PURCHASE_ORDER', 'RECEIPT', 'TRANSFER'));
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Order workflow indexes
CREATE INDEX IF NOT EXISTS idx_orders_salesperson ON orders(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_confirmed_at ON orders(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);

-- Purchase order indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);

-- Return management indexes
CREATE INDEX IF NOT EXISTS idx_order_returns_order ON order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_date ON order_returns(return_date);
CREATE INDEX IF NOT EXISTS idx_order_return_items_return ON order_return_items(return_id);

-- Inventory receipt indexes
CREATE INDEX IF NOT EXISTS idx_inventory_receipts_supplier ON inventory_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_receipts_po ON inventory_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_receipt_items_receipt ON inventory_receipt_items(receipt_id);

-- =====================================================
-- FUNCTIONS FOR WORKFLOW AUTOMATION
-- =====================================================

-- Function to auto-generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_number integer;
    po_number text;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 'PO-(\d+)') AS integer)), 0) + 1
    INTO next_number
    FROM purchase_orders
    WHERE po_number ~ '^PO-\d+$';
    
    po_number := 'PO-' || LPAD(next_number::text, 6, '0');
    RETURN po_number;
END;
$$;

-- Function to auto-generate return numbers
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_number integer;
    return_number text;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM 'RET-(\d+)') AS integer)), 0) + 1
    INTO next_number
    FROM order_returns
    WHERE return_number ~ '^RET-\d+$';
    
    return_number := 'RET-' || LPAD(next_number::text, 6, '0');
    RETURN return_number;
END;
$$;

-- Function to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_number integer;
    receipt_number text;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'REC-(\d+)') AS integer)), 0) + 1
    INTO next_number
    FROM inventory_receipts
    WHERE receipt_number ~ '^REC-\d+$';
    
    receipt_number := 'REC-' || LPAD(next_number::text, 6, '0');
    RETURN receipt_number;
END;
$$;

-- Function to process order shipment
CREATE OR REPLACE FUNCTION process_order_shipment(
    order_uuid uuid,
    tracking_code_param text,
    shipping_provider_param text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    order_record record;
    item_record record;
    inventory_record record;
BEGIN
    -- Get order details
    SELECT * INTO order_record FROM orders WHERE id = order_uuid AND status = 'CONFIRMED';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not in CONFIRMED status';
    END IF;
    
    -- Update order status and shipping info
    UPDATE orders 
    SET 
        status = 'SHIPPED',
        tracking_code = tracking_code_param,
        shipping_provider = shipping_provider_param,
        shipped_at = now()
    WHERE id = order_uuid;
    
    -- Process each order item
    FOR item_record IN 
        SELECT * FROM order_items WHERE order_id = order_uuid
    LOOP
        -- Find inventory item
        IF item_record.variant_id IS NOT NULL THEN
            SELECT * INTO inventory_record 
            FROM inventory_items 
            WHERE variant_id = item_record.variant_id
            LIMIT 1;
        ELSE
            SELECT * INTO inventory_record 
            FROM inventory_items 
            WHERE product_id = item_record.product_id
            LIMIT 1;
        END IF;
        
        IF FOUND THEN
            -- Check if enough stock
            IF inventory_record.current_stock < item_record.quantity THEN
                RAISE EXCEPTION 'Insufficient stock for item: %', item_record.product_name;
            END IF;
            
            -- Create stock movement record
            INSERT INTO stock_movements (
                inventory_item_id,
                movement_type,
                quantity,
                previous_stock,
                new_stock,
                reason,
                reference_type,
                reference_id,
                created_by
            ) VALUES (
                inventory_record.id,
                'OUT',
                -item_record.quantity,
                inventory_record.current_stock,
                inventory_record.current_stock - item_record.quantity,
                'Order shipment',
                'ORDER',
                order_uuid,
                auth.uid()
            );
            
            -- Update inventory
            UPDATE inventory_items 
            SET current_stock = current_stock - item_record.quantity
            WHERE id = inventory_record.id;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;

-- Function to process order return
CREATE OR REPLACE FUNCTION process_order_return(
    order_uuid uuid,
    return_items jsonb,
    return_reason text,
    return_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    return_uuid uuid;
    return_number_generated text;
    item jsonb;
    inventory_record record;
    restock_quantity integer;
BEGIN
    -- Generate return number
    return_number_generated := generate_return_number();
    
    -- Create return record
    INSERT INTO order_returns (
        order_id,
        return_number,
        reason,
        condition,
        notes,
        processed_by
    ) VALUES (
        order_uuid,
        return_number_generated,
        return_reason,
        'NEW', -- Default condition
        return_notes,
        auth.uid()
    ) RETURNING id INTO return_uuid;
    
    -- Process each return item
    FOR item IN SELECT * FROM jsonb_array_elements(return_items)
    LOOP
        -- Create return item record
        INSERT INTO order_return_items (
            return_id,
            order_item_id,
            product_id,
            variant_id,
            quantity,
            condition,
            restock
        ) VALUES (
            return_uuid,
            (item->>'order_item_id')::uuid,
            (item->>'product_id')::uuid,
            (item->>'variant_id')::uuid,
            (item->>'quantity')::integer,
            COALESCE(item->>'condition', 'NEW'),
            COALESCE((item->>'restock')::boolean, true)
        );
        
        -- If item should be restocked
        IF COALESCE((item->>'restock')::boolean, true) THEN
            restock_quantity := (item->>'quantity')::integer;
            
            -- Find inventory item
            IF (item->>'variant_id') IS NOT NULL THEN
                SELECT * INTO inventory_record 
                FROM inventory_items 
                WHERE variant_id = (item->>'variant_id')::uuid
                LIMIT 1;
            ELSE
                SELECT * INTO inventory_record 
                FROM inventory_items 
                WHERE product_id = (item->>'product_id')::uuid
                LIMIT 1;
            END IF;
            
            IF FOUND THEN
                -- Create stock movement record
                INSERT INTO stock_movements (
                    inventory_item_id,
                    movement_type,
                    quantity,
                    previous_stock,
                    new_stock,
                    reason,
                    reference_type,
                    reference_id,
                    created_by
                ) VALUES (
                    inventory_record.id,
                    'RETURN',
                    restock_quantity,
                    inventory_record.current_stock,
                    inventory_record.current_stock + restock_quantity,
                    'Order return - ' || return_reason,
                    'RETURN',
                    return_uuid,
                    auth.uid()
                );
                
                -- Update inventory
                UPDATE inventory_items 
                SET current_stock = current_stock + restock_quantity
                WHERE id = inventory_record.id;
            END IF;
        END IF;
    END LOOP;
    
    -- Update order status
    UPDATE orders SET status = 'RETURNED' WHERE id = order_uuid;
    
    RETURN return_uuid;
END;
$$;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES 
('Công ty TNHH Thời Trang ABC', 'Nguyễn Văn A', 'contact@abc-fashion.com', '0901234567', 'Quận 1, TP.HCM'),
('Nhà máy Dệt May XYZ', 'Trần Thị B', 'sales@xyz-textile.com', '0912345678', 'Bình Dương'),
('Công ty Nội Thất DEF', 'Lê Văn C', 'info@def-furniture.com', '0923456789', 'Hà Nội')
ON CONFLICT DO NOTHING;