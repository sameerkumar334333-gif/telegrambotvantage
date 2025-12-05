# Supabase Storage Bucket Setup - Hindi Instructions

## समस्या
```
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

यह error आ रहा है क्योंकि Supabase Storage में `screenshots` नाम का bucket नहीं बना है।

## Supabase Expert के लिए Step-by-Step Instructions

### Step 1: Supabase Storage तक पहुंचें
1. Supabase Dashboard में login करें
2. Project select करें: `btnqcjrwcdirjhggyhne` (या सही project)
3. Left sidebar में **Storage** पर click करें

### Step 2: Bucket बनाएं
1. **"New bucket"** या **"Create bucket"** button पर click करें
2. Bucket name दर्ज करें: **`screenshots`** (बिल्कुल यही नाम, lowercase में)
3. **जरूरी**: Bucket को **PUBLIC** बनाएं
   - "Public bucket" या "Make public" का toggle/checkbox ढूंढें
   - इसे enable करें - यह बहुत जरूरी है
4. **"Create bucket"** या **"Save"** पर click करें

### Step 3: Bucket Permissions सेट करें (अगर जरूरी हो)
1. Bucket बनने के बाद, उस पर click करके settings खोलें
2. **Policies** या **Permissions** tab पर जाएं
3. Public read access की policy ensure करें:
   - Policy name: "Public Read Access"
   - Operation: SELECT (read)
   - Target roles: `public` या `anon`
   - Policy: `true` (सभी को allow करें)

### Step 4: Bucket Settings Verify करें
Bucket में ये settings होनी चाहिए:
- **Name**: `screenshots` (exact match, case-sensitive)
- **Public**: Yes/Enabled
- **File size limit**: Default रख सकते हैं या 10MB set करें
- **Allowed MIME types**: Empty रख सकते हैं या `image/*` set करें

### Step 5: Storage Credentials (अगर जरूरी हो)
Application में ये credentials already हैं:
- **Access Key**: `d8f8841daf6c976a42f6d69f59b25dfd`
- **Secret Key**: `d888b8e7fb74310ab98ed6fff83808c143401eb9cb25739e71ac4efcf6232ea8`
- **Endpoint**: `https://btnqcjrwcdirjhggyhne.storage.supabase.co/storage/v1/s3`
- **Bucket Name**: `screenshots`

### Step 6: Bucket Test करें
Bucket बनने के बाद:
1. Storage → `screenshots` bucket पर जाएं
2. Manually एक test image upload करके देखें
3. Public URL से access करके verify करें

## Quick Checklist

- [ ] Bucket name exactly `screenshots` है (lowercase)
- [ ] Bucket PUBLIC है
- [ ] Bucket सही Supabase project में है
- [ ] Public read permissions enabled हैं
- [ ] Project में Storage API enabled है

## Common Issues और Solutions

### Issue 1: Bucket है लेकिन फिर भी 404 आ रहा है
- **Solution**: Bucket name की spelling check करें - exactly `screenshots` होना चाहिए (case-sensitive)
- Verify करें कि आप सही Supabase project में हैं

### Issue 2: "Access Denied" errors
- **Solution**: Bucket PUBLIC है या नहीं check करें
- Bucket policies में public read access allow करें

### Issue 3: Bucket को public नहीं बना पा रहे
- **Solution**: Project settings में Storage API enabled है या नहीं check करें
- Verify करें कि आपके पास project पर admin/owner permissions हैं

## Verification

Setup के बाद, bucket इस URL पर accessible होना चाहिए:
```
https://btnqcjrwcdirjhggyhne.supabase.co/storage/v1/object/public/screenshots/
```

## Additional Notes

- यह bucket Telegram bot से आने वाली user screenshots store करेगा
- Files bucket के अंदर `screenshots/` folder में organize होंगी
- हर file को unique UUID filename मिलेगा conflicts से बचने के लिए
- Application S3-compatible API use करके files upload करता है

---

**Bucket बनने और configure होने के बाद, application बिना 404 error के काम करना चाहिए।**

