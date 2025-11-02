# Fix Error 400: Access Blocked - OAuth 2.0 Policy Compliance

## Problem
**Error 400: invalid_request** with message:
> "Access blocked: This app's request is invalid. The app doesn't comply with Google OAuth 2.0 policy for keeping apps secure"

This error means Google is blocking your app because the **OAuth Consent Screen** isn't properly configured or you're not authorized as a test user.

---

## Solution: Configure OAuth Consent Screen Properly

### Step 1: Go to OAuth Consent Screen

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (same one as Firebase)
3. Go to **APIs & Services** → **OAuth consent screen** (left sidebar)

### Step 2: Configure App Information (if not done)

1. **User Type**: Choose **External** (unless you have Google Workspace)
2. **App Information**:
   - **App name**: `IC Mobile App` (or your app name)
   - **User support email**: Select your email
   - **App logo** (optional): Can skip for now
   - **Application home page** (optional): Can skip for development
   - **Privacy policy link**: ⚠️ **REQUIRED** - See Step 2A below
   - **Terms of service link**: ⚠️ **REQUIRED** - See Step 2A below
   - **Authorized domains**: Should have your email domain automatically
3. Click **Save and Continue**

#### Step 2A: Privacy Policy and Terms of Service

For development/testing, you can use placeholder URLs:

**Option 1: Use Placeholder URLs (Quick Fix)**
```
Privacy Policy: https://www.google.com/policies/privacy/
Terms of Service: https://www.google.com/policies/terms/
```

**Option 2: Create Simple HTML Pages** (Better for production)
1. Create a simple GitHub Pages site or use any free hosting
2. Add basic privacy policy and terms pages
3. Use those URLs

**Option 3: Use Firebase Hosting** (Best for production)
1. Deploy simple HTML pages to Firebase Hosting
2. Use those URLs

### Step 3: Configure Scopes

1. Click **Add or Remove Scopes**
2. In the filter box, search for and add:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid` (usually added automatically)
3. Click **Update**
4. Click **Save and Continue**

### Step 4: Add Test Users ⚠️ **CRITICAL**

This is the most common cause of "access blocked" errors!

1. On the **Test users** page, click **+ ADD USERS**
2. **Add your email address** (the one you'll use to test Google Sign-In)
3. **Add any other test emails** that need access
4. Click **Add**
5. Click **Save and Continue**

**Important Notes**:
- If your app is in **Testing** status, ONLY test users can sign in
- You MUST add yourself as a test user or you'll get blocked
- Each email address must be added individually

### Step 5: Complete Configuration

1. Review the **Summary** page
2. Click **Back to Dashboard**

---

## Step 6: Verify Your App Status

In **OAuth consent screen**:
- **Publishing status**: Should show "Testing" or "In production"
- If it shows errors or warnings, fix them
- Make sure all required fields (privacy policy, terms) are filled

---

## Step 7: If Still Getting "Access Blocked"

### Check 1: Are you a test user?

1. Go to **OAuth consent screen** → **Test users**
2. Verify your email is listed
3. If not, add it

### Check 2: Is the app in Testing mode?

1. In **OAuth consent screen**, check the **Publishing status**
2. If it's "Testing", make sure you're a test user
3. If you want anyone to sign in, you need to publish for production (requires verification)

### Check 3: Required fields

Make sure these are filled:
- ✅ App name
- ✅ User support email
- ✅ Privacy policy URL (even if placeholder)
- ✅ Terms of service URL (even if placeholder)
- ✅ At least one scope added
- ✅ At least one test user (if in Testing mode)

---

## Step 8: Test Again

1. Try signing in with Google again
2. Make sure you're using an email address that's listed as a test user
3. The "access blocked" error should be resolved

---

## Quick Checklist

- [ ] OAuth consent screen configured (App name, email, etc.)
- [ ] Privacy Policy URL added (can be placeholder)
- [ ] Terms of Service URL added (can be placeholder)
- [ ] Required scopes added (`userinfo.email`, `userinfo.profile`)
- [ ] **Your email added as test user**
- [ ] All test users added
- [ ] Publishing status shows no errors
- [ ] Tried signing in with a test user email

---

## For Production (Later)

When you're ready to publish:

1. Complete the OAuth consent screen fully (real privacy policy, terms, etc.)
2. Submit for verification if using sensitive scopes
3. Publish your app (change from Testing to In production)

For development, staying in Testing mode with test users is fine!

---

## Common Mistakes

1. ❌ **Not adding yourself as a test user** - Most common!
2. ❌ **Missing privacy policy/terms URLs** - Required fields
3. ❌ **Wrong email address** - The email you test with must match test user list
4. ❌ **App not in Testing mode** - If published, anyone can sign in (but needs verification)

---

## Still Not Working?

1. **Double-check test users**: 
   - Go to OAuth consent screen → Test users
   - Make sure your exact email is there (case-sensitive)

2. **Check publishing status**:
   - If "Testing": Only test users can sign in
   - If "In production": Anyone can sign in (but needs verification for sensitive scopes)

3. **Clear browser cache** and try again

4. **Check the exact error message** in your console/logs for more details

