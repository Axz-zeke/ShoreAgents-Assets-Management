-- Migration script to update asset status values
-- Run this in Supabase SQL Editor

-- Step 1: Remove the existing CHECK constraint
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_status_check;

-- Step 2: Update existing status values to new format
UPDATE public.assets 
SET status = CASE 
    WHEN status = 'Available' THEN 'Available'
    WHEN status = 'In Use' THEN 'Check Out'
    WHEN status = 'Disposed' THEN 'Dispose'
    ELSE status
END;

-- Step 3: Add new CHECK constraint with updated status values
ALTER TABLE public.assets 
ADD CONSTRAINT assets_status_check 
CHECK (status IN ('Available', 'Check Out', 'Move', 'Reserve', 'Lease', 'Dispose', 'Maintenance'));

-- Step 4: Update the default value
ALTER TABLE public.assets ALTER COLUMN status SET DEFAULT 'Available';

-- Step 5: Debug - Check current asset statuses
SELECT status, COUNT(*) as count 
FROM public.assets 
GROUP BY status 
ORDER BY status;

-- Step 6: Debug - Check assets with Reserve status
SELECT asset_tag_id, name, status, notes, updated_at
FROM public.assets 
WHERE status = 'Reserve'
ORDER BY updated_at DESC;

-- Step 7: Debug - Check assets with [RESERVED in notes
SELECT asset_tag_id, name, status, notes, updated_at
FROM public.assets 
WHERE notes LIKE '%[RESERVED%'
ORDER BY updated_at DESC;

-- Step 8: Debug - Check the constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.assets'::regclass 
AND conname = 'assets_status_check';

-- Step 9: Debug - Check recent updates
SELECT asset_tag_id, name, status, updated_at
FROM public.assets 
ORDER BY updated_at DESC
LIMIT 10;
