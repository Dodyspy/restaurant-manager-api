# 🔧 Fix DNS Configuration

## ❌ Current Problem

The CNAME record is incorrect:
```
api → cname.vercel-dns.com.restaurantmanagerpro.fr
```

This is wrong because Gandi automatically appended the domain name.

## ✅ Solution

You need to edit the DNS record in Gandi:

### **Step 1: Go to Gandi DNS Management**
1. Log in to Gandi
2. Go to domain: `restaurantmanagerpro.fr`
3. Click: DNS Records

### **Step 2: Edit the `api` CNAME Record**
1. Find the record: `api → CNAME → cname.vercel-dns.com`
2. Click: Edit (pencil icon)

### **Step 3: Change the Value**

**Current value (WRONG):**
```
cname.vercel-dns.com
```

**Change it to (add a dot at the end):**
```
cname.vercel-dns.com.
```

**OR use the Vercel-specific value:**
```
f99ec2a2a5903b39.vercel-dns-017.com.
```

**Important:** The trailing dot `.` tells DNS this is an absolute domain and prevents Gandi from appending `.restaurantmanagerpro.fr`

### **Step 4: Save**
1. Click: Save
2. Wait: 5-10 minutes for DNS to update

---

## 🔍 Verify DNS is Fixed

After saving, run this command to check:

```bash
dig api.restaurantmanagerpro.fr CNAME +short
```

**Should show:**
```
cname.vercel-dns.com.
```

**NOT:**
```
cname.vercel-dns.com.restaurantmanagerpro.fr.
```

---

## 📋 Alternative: Use A Record Instead

If CNAME continues to have issues, you can use an A record instead:

1. **Delete** the CNAME record for `api`
2. **Add** A record:
   - Name: `api`
   - Type: `A`
   - Value: `76.76.21.21` (Vercel's IP)
   - TTL: `3600`

Then in Vercel, click "Refresh" on the domain page.

---

## ✅ Once Fixed

After the DNS is corrected:
1. Go to Vercel dashboard
2. Click "Refresh" button on the domain page
3. Wait 2-3 minutes
4. Status should change to "Valid Configuration" ✅
