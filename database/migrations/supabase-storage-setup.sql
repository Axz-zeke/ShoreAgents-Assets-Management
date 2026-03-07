-- ============================================================
-- Supabase Storage Setup for Asset Dog
-- Run this in the Supabase SQL Editor (https://app.supabase.com)
-- Dashboard → SQL Editor → New Query → paste & Run
-- ============================================================

-- 1. Create the asset-images storage bucket (public so images can be viewed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'asset-images',
  'asset-images',
  true,          -- public bucket: files are readable without auth
  5242880,       -- 5 MB per file limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];


-- 2. Allow authenticated users (and service_role) to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (bucket_id = 'asset-images');

-- 3. Allow anyone to read/view images (needed for public QR code display)
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'asset-images');

-- 4. Allow authenticated users and service_role to update (upsert / overwrite)
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
  ON storage.objects
  FOR UPDATE
  TO authenticated, service_role
  USING (bucket_id = 'asset-images');

-- 5. Allow authenticated users and service_role to delete files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
  ON storage.objects
  FOR DELETE
  TO authenticated, service_role
  USING (bucket_id = 'asset-images');


--   SELECT id, name, public FROM storage.buckets WHERE id = 'asset-images' OR id = 'employee-photos';
-- ============================================================

-- 6. Create the employee-photos storage bucket (public so images can be viewed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-photos',
  'employee-photos',
  true,          -- public bucket: files are readable without auth
  5242880,       -- 5 MB per file limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 7. Add Policies for employee-photos
DROP POLICY IF EXISTS "Allow authenticated uploads for photos" ON storage.objects;
CREATE POLICY "Allow authenticated uploads for photos"
  ON storage.objects FOR INSERT TO authenticated, service_role
  WITH CHECK (bucket_id = 'employee-photos');

DROP POLICY IF EXISTS "Allow public reads for photos" ON storage.objects;
CREATE POLICY "Allow public reads for photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'employee-photos');

DROP POLICY IF EXISTS "Allow authenticated updates for photos" ON storage.objects;
CREATE POLICY "Allow authenticated updates for photos"
  ON storage.objects FOR UPDATE TO authenticated, service_role
  USING (bucket_id = 'employee-photos');

DROP POLICY IF EXISTS "Allow authenticated deletes for photos" ON storage.objects;
CREATE POLICY "Allow authenticated deletes for photos"
  ON storage.objects FOR DELETE TO authenticated, service_role
  USING (bucket_id = 'employee-photos');
