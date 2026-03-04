-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id TEXT NOT NULL,
    maintenance_title TEXT NOT NULL,
    maintenance_details TEXT,
    maintenance_due_date DATE NOT NULL,
    maintenance_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    date_completed DATE,
    maintenance_cost DECIMAL(10,2) DEFAULT 0,
    is_repeating BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on asset_id for faster queries
CREATE INDEX IF NOT EXISTS idx_maintenance_records_asset_id ON maintenance_records(asset_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);

-- Create index on maintenance_due_date for scheduling queries
CREATE INDEX IF NOT EXISTS idx_maintenance_records_due_date ON maintenance_records(maintenance_due_date);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_maintenance_records_created_at ON maintenance_records(created_at);

-- Add foreign key constraint to assets table for referential integrity
-- Note: This assumes the assets table exists with asset_tag_id as the primary key
ALTER TABLE maintenance_records 
ADD CONSTRAINT fk_maintenance_records_asset_id 
FOREIGN KEY (asset_id) REFERENCES assets(asset_tag_id) ON DELETE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maintenance_records table
-- Policy for SELECT: Allow authenticated users to read all maintenance records
CREATE POLICY "Allow authenticated users to read maintenance records" ON maintenance_records
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for INSERT: Allow authenticated users to create maintenance records
CREATE POLICY "Allow authenticated users to create maintenance records" ON maintenance_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for UPDATE: Allow authenticated users to update maintenance records
CREATE POLICY "Allow authenticated users to update maintenance records" ON maintenance_records
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for DELETE: Allow authenticated users to delete maintenance records
CREATE POLICY "Allow authenticated users to delete maintenance records" ON maintenance_records
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on maintenance_records
CREATE TRIGGER trigger_update_maintenance_records_updated_at
    BEFORE UPDATE ON maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_records_updated_at();

-- Insert some sample maintenance records (optional)
-- INSERT INTO maintenance_records (asset_id, maintenance_title, maintenance_details, maintenance_due_date, maintenance_by, status, maintenance_cost, is_repeating)
-- VALUES 
--     ('AE-A13', 'Routine Inspection', 'Monthly safety inspection and cleaning', '2024-02-15', 'John Smith', 'scheduled', 0, true),
--     ('AE-A14', 'Software Update', 'Update operating system and security patches', '2024-02-20', 'IT Department', 'scheduled', 150, false),
--     ('AE-A15', 'Hardware Repair', 'Replace faulty hard drive', '2024-02-25', 'TechFix Solutions', 'in_progress', 300, false);
