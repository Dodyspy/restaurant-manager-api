# 🔐 Environment Variables Setup Guide

## ⚠️ SECURITY WARNING

**NEVER commit actual API keys, secrets, or credentials to Git!**

This guide shows you which environment variables to configure on Vercel.

---

## 📋 Required Environment Variables

Configure these in your Vercel project dashboard:

### Firebase Client SDK (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin SDK (Private - Server Only)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### API Configuration
```
NEXT_PUBLIC_API_URL=https://api.restaurantmanagerpro.fr
```

---

## 🔑 How to Get These Values

### 1. Firebase Client SDK
- Go to Firebase Console: https://console.firebase.google.com
- Select your project
- Go to Project Settings (gear icon) → General
- Scroll to "Your apps" → Web app
- Copy the config values

### 2. Firebase Admin SDK
- Go to Firebase Console
- Project Settings → Service Accounts
- Click "Generate new private key"
- Download the JSON file
- Extract the values:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters)

---

## 📦 Setting Up on Vercel

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add each variable one by one
4. Select "Production", "Preview", and "Development" for each
5. Save and redeploy

---

## 🔒 Security Best Practices

✅ **DO:**
- Store secrets in Vercel environment variables
- Use `.env.local` for local development (gitignored)
- Rotate keys if they're ever exposed
- Use different Firebase projects for dev/prod

❌ **DON'T:**
- Commit `.env` files to Git
- Share API keys in documentation
- Hardcode secrets in source code
- Use production keys in development

---

## 🚨 If Keys Are Exposed

1. **Immediately rotate the compromised keys:**
   - Firebase: Generate new service account key
   - Delete the old key
   
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/secret/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (⚠️ dangerous):**
   ```bash
   git push origin --force --all
   ```

4. **Update Vercel environment variables** with new keys

---

## 📝 Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Never commit `.env.local` (already in .gitignore)

---

## ✅ Verification

After setup, verify your API works:
```bash
curl https://api.restaurantmanagerpro.fr/api/check-restaurant-status?code=CASANOVA2024
```

Should return restaurant data without errors.
