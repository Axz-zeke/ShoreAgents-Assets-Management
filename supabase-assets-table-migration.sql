-- Create assets table for asset management system
-- Run this in Supabase SQL Editor

-- Create the assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_tag_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    description TEXT,
    serial_number VARCHAR(255),
    brand VARCHAR(255),
    model VARCHAR(255),
    cost DECIMAL(15,2),
    purchase_date DATE,
    date_acquired DATE,
    category VARCHAR(255),
    sub_category VARCHAR(255),
    location VARCHAR(255),
    site VARCHAR(255),
    department VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Check Out', 'Move', 'Reserve', 'Lease', 'Dispose', 'Maintenance')),
    assigned_to VARCHAR(255),
    asset_type VARCHAR(255),
    notes TEXT,
    image_url TEXT,
    image_file_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_asset_tag_id ON public.assets(asset_tag_id);
CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON public.assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_location ON public.assets(location);
CREATE INDEX IF NOT EXISTS idx_assets_department ON public.assets(department);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first)
-- Policy: Users can view all assets
DROP POLICY IF EXISTS "Users can view all assets" ON public.assets;
CREATE POLICY "Users can view all assets" ON public.assets
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert assets
DROP POLICY IF EXISTS "Authenticated users can insert assets" ON public.assets;
CREATE POLICY "Authenticated users can insert assets" ON public.assets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update assets they created or are assigned to
DROP POLICY IF EXISTS "Users can update assets" ON public.assets;
CREATE POLICY "Users can update assets" ON public.assets
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid()::text = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.user_type = 'admin'
        )
    );

-- Policy: Only admins can delete assets
DROP POLICY IF EXISTS "Only admins can delete assets" ON public.assets;
CREATE POLICY "Only admins can delete assets" ON public.assets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.user_type = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON public.assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to set created_by on insert
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically set created_by
DROP TRIGGER IF EXISTS set_assets_created_by ON public.assets;
CREATE TRIGGER set_assets_created_by 
    BEFORE INSERT ON public.assets 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_by();

-- Insert some sample data (optional)
INSERT INTO public.assets (
    asset_tag_id, name, description, serial_number, brand, model, cost, 
    purchase_date, category, location, department, status
) VALUES 
(
    'AT-001', 'Dell Laptop', 'Dell Latitude 5520 Laptop', 'DL5520001', 
    'Dell', 'Latitude 5520', 1200.00, '2024-01-15', 'IT Equipment', 
    'Main Office', 'IT Department', 'Available'
),
(
    'AT-002', 'Office Chair', 'Ergonomic Office Chair', 'OC001', 
    'Herman Miller', 'Aeron Chair', 800.00, '2024-01-20', 'Furniture', 
    'Main Office', 'HR Department', 'Check Out'
),
(
    'AT-003', 'Projector', 'Epson Projector', 'EP001', 
    'Epson', 'PowerLite 1781W', 450.00, '2024-02-01', 'AV Equipment', 
    'Conference Room A', 'IT Department', 'Available'
)
ON CONFLICT (asset_tag_id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.assets TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
