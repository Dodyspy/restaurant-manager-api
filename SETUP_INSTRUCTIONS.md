# 🚀 Restaurant Manager Pro API - Setup Instructions

## Current Status
✅ Dependencies installed
✅ Git repository initialized
⏳ Ready to push to GitHub

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# If you have GitHub CLI installed
gh repo create restaurant-manager-api --public --source=. --remote=origin --push
```

### Option B: Manual Setup (If no GitHub CLI)

1. **Go to GitHub:** https://github.com/new
2. **Repository name:** `restaurant-manager-api`
3. **Description:** "API backend for Restaurant Manager Pro - handles all widget reservations"
4. **Visibility:** Public
5. **DO NOT** initialize with README (we already have files)
6. **Click:** Create repository

Then run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/restaurant-manager-api.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### A. Import Repository to Vercel

1. **Go to:** https://vercel.com/new
2. **Click:** "Import Git Repository"
3. **Select:** `restaurant-manager-api`
4. **Configure:**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Node Version: **22.x**

5. **Click:** Deploy (don't add env vars yet, we'll do that next)

### B. Wait for Initial Deployment
- First deployment will take 2-3 minutes
- It will get a temporary URL like: `restaurant-manager-api-xyz.vercel.app`

---

## Step 4: Configure Custom Domain

1. **In Vercel Dashboard:**
   - Go to project settings
   - Click **Domains**
   - Click **Add Domain**
   - Enter: `api.restaurantmanagerpro.fr`
   - Click **Add**

2. **Vercel will show DNS instructions:**
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   ```

3. **Go to your DNS provider (Gandi/Cloudflare):**
   - Add the CNAME record as shown
   - Wait 5-10 minutes for DNS propagation

---

## Step 5: Add Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

### Firebase Client (Public)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=casanova-dissy-reservations.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=casanova-dissy-reservations
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=casanova-dissy-reservations.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXXXXXX
```

### Firebase Admin (Server-side)
```bash
FIREBASE_PROJECT_ID=casanova-dissy-reservations
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-XXXXX@casanova-dissy-reservations.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n"
```

### Other Configuration
```bash
FUNCTIONS_BASE_URL=https://us-central1-casanova-dissy-reservations.cloudfunctions.net
RESERVATION_API_KEY=casanova-reserve-app-key
DEFAULT_RESTAURANT_CODE=DEMO2024
```

### Sentry (Optional - for error monitoring)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@XXXXXX.ingest.sentry.io/XXXXXXX
```

**IMPORTANT:** 
- For each variable, select **Production**, **Preview**, and **Development**
- Click **Save** after adding all variables
- Redeploy the project after adding env vars

---

## Step 6: Get Environment Variables from Backoffice

To get the Firebase credentials, run:
```bash
cat "/Users/sxy/AppTest/SaaS Reservations/restaurant-manager-backoffice/.env.local"
```

Copy the values and paste them into Vercel.

---

## Step 7: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## Step 8: Test API

Once deployed, test the API:

```bash
# Test restaurant status endpoint
curl "https://api.restaurantmanagerpro.fr/api/check-restaurant-status?code=CASANOVADI2025"

# Should return restaurant data
```

---

## Step 9: Update Widget

Update the widget to use the new API URL:

```bash
cd "/Users/sxy/AppTest/SaaS Reservations/reservation-widget"

# Edit widget.js and replace all instances of:
# https://casanovadissy.fr/api/
# with:
# https://api.restaurantmanagerpro.fr/api/

git add widget.js
git commit -m "Update API endpoint to api.restaurantmanagerpro.fr"
git push origin main
```

---

## ✅ Verification Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Initial deployment successful
- [ ] Custom domain configured (api.restaurantmanagerpro.fr)
- [ ] DNS CNAME record added
- [ ] Environment variables added
- [ ] Project redeployed with env vars
- [ ] API responds at https://api.restaurantmanagerpro.fr
- [ ] Widget updated to use new API URL
- [ ] Test reservation works end-to-end

---

## 🆘 Troubleshooting

### DNS not resolving
- Wait 10-30 minutes for DNS propagation
- Check DNS with: `nslookup api.restaurantmanagerpro.fr`

### API returns 500 error
- Check Vercel logs for errors
- Verify environment variables are set correctly
- Check Firebase credentials are valid

### CORS errors
- Add CORS headers to API endpoints
- Verify widget domain is allowed

---

## 📞 Next Steps After Deployment

1. Test with multiple restaurants (CASANOVADI2025, Review123!)
2. Monitor Sentry for errors
3. Check rate limiting works
4. Verify email/phone validation
5. Test from real restaurant website

**You're ready to deploy!** 🚀
