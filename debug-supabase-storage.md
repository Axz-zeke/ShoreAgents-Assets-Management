# Supabase Storage Debug Guide

## Issue: Images uploading but not displaying

The images are uploading successfully to Supabase Storage, but the URLs are not accessible for display.

## Debug Steps:

### 1. Check Supabase Storage Bucket Permissions

Go to your Supabase Dashboard → Storage → asset-images bucket → Settings

**Required Policies:**

```sql
-- Allow public read access to asset-images bucket
CREATE POLICY "Public read access for asset-images" ON storage.objects
FOR SELECT USING (bucket_id = 'asset-images');

-- Allow authenticated users to upload to asset-images bucket
CREATE POLICY "Authenticated users can upload to asset-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update files in asset-images bucket
CREATE POLICY "Authenticated users can update asset-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);
```

### 2. Check Bucket Configuration

In Supabase Dashboard → Storage → asset-images:
- **Public bucket**: Should be enabled for public access
- **File size limit**: Should be sufficient (default is usually 50MB)
- **Allowed MIME types**: Should include image/*

### 3. Test URL Manually

Try accessing the URL directly in your browser:
```
https://iajjpsiicjecbukyfxvr.supabase.co/storage/v1/object/public/asset-images/SA-00018-TEST.png
```

### 4. Check Network Tab

In browser DevTools → Network tab:
- Look for the image request
- Check the response status code
- Look for CORS errors

### 5. Common Issues:

1. **RLS Policies**: Missing or incorrect Row Level Security policies
2. **Bucket not public**: Bucket needs to be marked as public
3. **CORS**: Cross-origin requests might be blocked
4. **File permissions**: File might not have correct permissions

## Quick Fix Commands:

```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'asset-images';

-- Add public read policy
CREATE POLICY "Public read access for asset-images" ON storage.objects
FOR SELECT USING (bucket_id = 'asset-images');
```

## Test in Browser Console:

```javascript
// Test if URL is accessible
fetch('https://iajjpsiicjecbukyfxvr.supabase.co/storage/v1/object/public/asset-images/SA-00018-TEST.png')
  .then(response => {
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    return response.blob();
  })
  .then(blob => {
    console.log('Success! Blob size:', blob.size);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

