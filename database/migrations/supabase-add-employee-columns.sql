-- Add missing columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS site TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS employment_type TEXT,
ADD COLUMN IF NOT EXISTS date_hired TEXT;

-- Update RLS policies if necessary (usually service role bypasses these, but good for consistency)
-- The supabaseAdmin used in the API is service_role, so it bypasses RLS.
