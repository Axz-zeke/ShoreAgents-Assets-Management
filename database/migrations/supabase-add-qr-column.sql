-- Migration to add a dedicated QR URL column to the assets table
-- This allows storing QR codes separately from asset photos.

ALTER TABLE assets ADD COLUMN IF NOT EXISTS qr_url TEXT;

-- Optional: If you want to backfill the qr_url from image_url for existing PNGs 
-- that look like QR codes (matching your previous naming convention):
UPDATE assets 
SET qr_url = image_url 
WHERE image_url LIKE '%.png' 
  AND (image_file_name LIKE '%qr%' OR image_url LIKE '%qr-codes%')
  AND qr_url IS NULL;

-- Add a comment for clarity
COMMENT ON COLUMN assets.qr_url IS 'Public URL of the generated QR code image stored in Supabase Storage.';
