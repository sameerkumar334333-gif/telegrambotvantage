# Supabase Storage Bucket Setup Instructions

## Error
```
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

This error occurs because the storage bucket `screenshots` does not exist in Supabase Storage.

## Step-by-Step Instructions for Supabase Expert

### Step 1: Access Supabase Storage
1. Log in to the Supabase Dashboard
2. Select the project: `btnqcjrwcdirjhggyhne` (or the correct project)
3. Navigate to **Storage** in the left sidebar

### Step 2: Create the Bucket
1. Click the **"New bucket"** button (or **"Create bucket"**)
2. Enter the bucket name: **`screenshots`** (exactly this name, all lowercase)
3. **IMPORTANT**: Make sure the bucket is set to **PUBLIC**
   - Look for a toggle/checkbox that says "Public bucket" or "Make public"
   - Enable it - this is critical for the application to work
4. Click **"Create bucket"** or **"Save"**

### Step 3: Configure Bucket Permissions (if needed)
1. After creating the bucket, click on it to open settings
2. Go to **Policies** or **Permissions** tab
3. Ensure there's a policy that allows public read access:
   - Policy name: "Public Read Access" (or similar)
   - Operation: SELECT (read)
   - Target roles: `public` or `anon`
   - Policy: `true` (allow all)

### Step 4: Verify Bucket Settings
The bucket should have:
- **Name**: `screenshots` (exact match, case-sensitive)
- **Public**: Yes/Enabled
- **File size limit**: Can be left as default or set to a reasonable limit (e.g., 10MB)
- **Allowed MIME types**: Can be left empty (allows all) or set to `image/*` for images only

### Step 5: Get Storage Credentials (if needed)
The application already has these credentials:
- **Access Key**: `d8f8841daf6c976a42f6d69f59b25dfd`
- **Secret Key**: `d888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8`
- **Endpoint**: `https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3`
- **Bucket Name**: `screenshots`

### Step 6: Test the Bucket
After creating the bucket, you can test by:
1. Going to Storage → `screenshots` bucket
2. Try uploading a test image manually
3. Check if you can access it via public URL

## Quick Checklist

- [ ] Bucket name is exactly `screenshots` (lowercase)
- [ ] Bucket is set to PUBLIC
- [ ] Bucket exists in the correct Supabase project
- [ ] Public read permissions are enabled
- [ ] Storage API is enabled for the project

## Common Issues

### Issue 1: Bucket exists but still getting 404
- **Solution**: Check the bucket name spelling - it must be exactly `screenshots` (case-sensitive)
- Verify you're in the correct Supabase project

### Issue 2: "Access Denied" errors
- **Solution**: Make sure the bucket is PUBLIC
- Check bucket policies allow public read access

### Issue 3: Can't make bucket public
- **Solution**: Check if Storage API is enabled in project settings
- Verify you have admin/owner permissions on the project

## Verification

After setup, the bucket should be accessible at:
```
https://btnqcjrwcdirjhggyhne.supabase.co/storage/v1/object/public/screenshots/
```

## Additional Notes

- The bucket will store user-uploaded screenshots from the Telegram bot
- Files are organized in a `screenshots/` folder within the bucket
- Each file gets a unique UUID filename to prevent conflicts
- The application uses S3-compatible API to upload files

---

**Once the bucket is created and configured, the application should work without the 404 error.**

