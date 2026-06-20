-- Drop existing tables (in correct order to avoid foreign key errors)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  supplier TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  order_date TIMESTAMP DEFAULT NOW(),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- Stock Movements Table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  movement_type TEXT CHECK (movement_type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (allow all operations for now)
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON order_items FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON stock_movements FOR ALL USING (true);

-- Insert sample data
INSERT INTO products (sku, name, description, category, price, stock_quantity, supplier) VALUES
('SKU-001', 'Product A', 'High-quality product', 'Category 1', 100.00, 50, 'Supplier X'),
('SKU-002', 'Product B', 'Premium product', 'Category 2', 200.00, 20, 'Supplier Y'),
('SKU-003', 'Product C', 'Standard product', 'Category 1', 150.00, 5, 'Supplier X');

INSERT INTO customers (name, email, phone, address) VALUES
('John Doe', 'john@example.com', '123-456-7890', '123 Main St'),
('Jane Smith', 'jane@example.com', '987-654-3210', '456 Oak Ave');

INSERT INTO orders (customer_id, total_amount, status, payment_method) VALUES
((SELECT id FROM customers WHERE email = 'john@example.com'), 250.00, 'completed', 'cash'),
((SELECT id FROM customers WHERE email = 'jane@example.com'), 400.00, 'pending', 'credit_card');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
((SELECT id FROM orders WHERE total_amount = 250.00 LIMIT 1), (SELECT id FROM products WHERE sku = 'SKU-001'), 2, 100.00, 200.00),
((SELECT id FROM orders WHERE total_amount = 250.00 LIMIT 1), (SELECT id FROM products WHERE sku = 'SKU-003'), 1, 150.00, 150.00),
((SELECT id FROM orders WHERE total_amount = 400.00 LIMIT 1), (SELECT id FROM products WHERE sku = 'SKU-002'), 2, 200.00, 400.00);