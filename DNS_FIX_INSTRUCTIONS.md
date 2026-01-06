# 🔧 EXACT DNS FIX INSTRUCTIONS

## Current Problem
Your DNS shows: `cname.vercel-dns.com.restaurantmanagerpro.fr.`
Should be: `f99ec2a2a5903b39.vercel-dns-017.com.`

---

## Step-by-Step Fix in Gandi

### 1. Go to Gandi DNS
- Login to Gandi
- Select domain: `restaurantmanagerpro.fr`
- Click: DNS Records

### 2. Find the `api` CNAME Record
Look for:
```
Name: api
Type: CNAME
Value: cname.vercel-dns.com
```

### 3. Click Edit (Pencil Icon)

### 4. Change the Value Field

**DELETE the current value completely**

**Type this EXACT value (copy/paste):**
```
f99ec2a2a5903b39.vercel-dns-017.com.
```

**CRITICAL:** Notice the dot `.` at the end - you MUST include it!

### 5. Save the Record

### 6. Wait 5 Minutes

### 7. In Vercel Dashboard
- Click "Refresh" button
- Status should change to "Valid Configuration"

---

## Why the Trailing Dot Matters

- **Without dot:** `f99ec2a2a5903b39.vercel-dns-017.com`
  - Gandi adds your domain: `f99ec2a2a5903b39.vercel-dns-017.com.restaurantmanagerpro.fr` ❌

- **With dot:** `f99ec2a2a5903b39.vercel-dns-017.com.`
  - Gandi treats it as absolute: `f99ec2a2a5903b39.vercel-dns-017.com.` ✅

---

## Verify After Saving

Run this command:
```bash
dig api.restaurantmanagerpro.fr CNAME +short
```

Should show:
```
f99ec2a2a5903b39.vercel-dns-017.com.
```

NOT:
```
f99ec2a2a5903b39.vercel-dns-017.com.restaurantmanagerpro.fr.
```
