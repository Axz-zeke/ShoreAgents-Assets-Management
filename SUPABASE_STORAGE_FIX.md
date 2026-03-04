# Supabase Storage RLS Policy Fix

## Problem
Image uploads are failing with: "new row violates row-level security policy"

## Solution
Run the following SQL commands in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to SQL Editor (left sidebar)

### Step 2: Run the RLS Policy Script
Copy and paste this SQL into the SQL Editor and run it:

```sql
-- Supabase Storage RLS Policies Fix
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files to asset-images bucket
CREATE POLICY "Allow authenticated uploads to asset-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow public access to view asset images
CREATE POLICY "Public asset image access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'asset-images');

-- Policy 3: Allow authenticated users to update their uploaded files
CREATE POLICY "Allow authenticated updates to asset-images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their uploaded files
CREATE POLICY "Allow authenticated deletes to asset-images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);
```

### Step 3: Verify the Storage Bucket Exists
1. Go to Storage section in Supabase dashboard
2. Ensure you have an `asset-images` bucket
3. If it doesn't exist, create it:
   - Click "New bucket"
   - Name: `asset-images`
   - Make it Public: ✅ (checked)

### Step 4: Test Image Upload
After running the SQL script, try uploading an image with a new asset - it should work without the RLS error.

## Alternative: Make Bucket Completely Public (Less Secure)
If you want to completely bypass RLS for testing, you can run:

```sql
-- WARNING: This makes the bucket completely public - only use for testing
DROP POLICY IF EXISTS "Disable RLS for asset-images" ON storage.objects;
CREATE POLICY "Disable RLS for asset-images"
ON storage.objects
FOR ALL
USING (bucket_id = 'asset-images');
```

But the first approach with authenticated policies is recommended for production.
