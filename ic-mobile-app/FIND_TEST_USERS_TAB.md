# How to Find the Test Users Tab in Google Cloud Console

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Select Your Project
1. Click the **project dropdown** at the top of the page
2. Select your Firebase project (or the project you're using for OAuth)

### Step 3: Navigate to OAuth Consent Screen
1. In the left sidebar, click **APIs & Services**
2. Then click **OAuth consent screen** (it's in the left sidebar under "APIs & Services")

### Step 4: Find the Test Users Tab
Once you're on the **OAuth consent screen** page, you'll see tabs at the top:

1. **App information** tab (first tab)
2. **Scopes** tab (second tab)
3. **Test users** tab ⭐ **(This is what you need!)**
4. **Summary** tab (last tab)

Click on the **Test users** tab.

---

## Visual Guide

```
Google Cloud Console
├── APIs & Services (left sidebar)
│   └── OAuth consent screen (click this)
│       ├── App information (tab)
│       ├── Scopes (tab)
│       ├── Test users ⭐ ← CLICK THIS TAB
│       └── Summary (tab)
```

---

## What You'll See on the Test Users Tab

Once you click the **Test users** tab, you'll see:

1. A section that says "Test users"
2. A list of email addresses (if any are already added)
3. A button that says **"+ ADD USERS"** or **"ADD TEST USERS"**

---

## Adding Yourself as a Test User

1. Click **"+ ADD USERS"** button
2. A dialog box will appear
3. Enter your email address (the one you'll use to test Google Sign-In)
4. Click **Add** or **Save**
5. Your email should now appear in the test users list
6. Click **Save and Continue** or **Save** at the bottom of the page

---

## If You Don't See the Test Users Tab

If you don't see a **Test users** tab, it might mean:

1. **You haven't created the OAuth consent screen yet**:
   - If this is your first time, you need to complete the setup:
   - Choose **External** as user type
   - Fill in App information (name, email, privacy policy URL, terms URL)
   - Click **Save and Continue**
   - Add scopes
   - Click **Save and Continue**
   - **Then** you'll see the Test users tab

2. **Your app is already published to production**:
   - If your app status is "In production" (not "Testing"), test users might not be available
   - You may need to unpublish it or check if there's a different section

3. **Wrong project selected**:
   - Make sure you're in the correct project

---

## Alternative Path (Direct URL)

You can also go directly to:
```
https://console.cloud.google.com/apis/credentials/consent
```

Make sure you select your project first, then you'll see the OAuth consent screen with all the tabs.

---

## Quick Checklist

- [ ] Signed in to Google Cloud Console
- [ ] Selected correct project (same as Firebase project)
- [ ] Clicked "APIs & Services" in left sidebar
- [ ] Clicked "OAuth consent screen"
- [ ] See tabs at top: App information, Scopes, **Test users**, Summary
- [ ] Clicked **Test users** tab
- [ ] See "+ ADD USERS" button
- [ ] Added your email address
- [ ] Clicked Save

---

## Still Can't Find It?

1. Make sure you're using the correct Google account that has access to the project
2. Try using the direct URL: `https://console.cloud.google.com/apis/credentials/consent`
3. Check if you need to enable the API first: **APIs & Services** → **Library** → Search "Google Sign-In API" → Enable
4. Make sure you're not looking in Firebase Console - you need **Google Cloud Console** (they're linked but different interfaces)

