# Complete Fix: OAuth 2.0 Policy Error 400

## Error You're Seeing

```
Access Blocked: Authorization Error
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy for keeping apps secure.
Error 400: invalid_request
```

This means your **OAuth Consent Screen** is not properly configured in Google Cloud Console.

---

## Complete Step-by-Step Fix

### Step 1: Go to OAuth Consent Screen

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **correct project** (the one with ID `project-1065488262096` based on your error)
3. Click **APIs & Services** → **OAuth consent screen** (left sidebar)

---

### Step 2: Check Publishing Status

Look at the top of the OAuth consent screen page. You'll see:

- **Publishing status**: Should show "Testing" or "In production"
- **App name**: Should show your app name

**If you see errors/warnings**, fix them first before proceeding.

---

### Step 3: Complete App Information Tab

1. Click the **App information** tab (first tab)
2. Fill in ALL required fields:

   **Required:**
   - ✅ **App name**: `IC Mobile App` (or your app name)
   - ✅ **User support email**: Select your email from dropdown
   - ✅ **Application home page**: 
     - You can use: `https://example.com` (placeholder)
     - OR your actual website if you have one
   - ✅ **Privacy policy link**: ⚠️ **REQUIRED** 
     - Use: `https://www.google.com/policies/privacy/` (placeholder for testing)
     - OR create your own privacy policy page
   - ✅ **Terms of service link**: ⚠️ **REQUIRED**
     - Use: `https://www.google.com/policies/terms/` (placeholder for testing)
     - OR create your own terms page
   - ✅ **Authorized domains**: Should auto-populate with your email domain
     - If not, add: `googleusercontent.com` and your domain

3. Click **Save and Continue**

---

### Step 4: Complete Scopes Tab

1. Click the **Scopes** tab (second tab)
2. Click **Add or Remove Scopes** button
3. In the filter box, search for and add:
   - ✅ `.../auth/userinfo.email` (click checkbox)
   - ✅ `.../auth/userinfo.profile` (click checkbox)
   - ✅ `openid` (usually added automatically)

4. Click **Update** button
5. Click **Save and Continue**

---

### Step 5: Add Test Users (CRITICAL!)

1. Click the **Test users** tab (third tab)
2. Click **+ ADD USERS** button
3. **Enter your email address** (the one you'll use to test Google Sign-In)
   - Example: `yourname@gmail.com`
4. Click **Add**
5. **Add any other test users** (repeat for each email)
6. Click **Save and Continue**

⚠️ **IMPORTANT**: 
- You MUST add yourself as a test user
- Only emails in this list can sign in if app is in "Testing" mode
- Use the EXACT email you'll sign in with (case-sensitive)

---

### Step 6: Review Summary

1. Click the **Summary** tab (last tab)
2. Review all information
3. Make sure everything looks correct
4. Click **Back to Dashboard**

---

### Step 7: Verify OAuth Client ID Configuration

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Find your **OAuth 2.0 Client ID** (Web application type)
3. Click on it to edit
4. Verify **Authorized redirect URIs** includes:
   ```
   https://auth.expo.io/@anonymous/ic-mobile-app
   https://auth.expo.io/@anonymous/ic-mobile-app/
   https://auth.expo.io
   https://auth.expo.io/
   ```
5. **Remove** any IP-based URIs (if present):
   - ❌ `exp://10.48.211.54:8081`
   - ❌ `exp://127.0.0.1:8081`
   - ❌ `exp://localhost:8081`
6. Click **Save**

---

### Step 8: Verify Your Test User Email

**This is the most common mistake!**

1. Go back to **OAuth consent screen** → **Test users** tab
2. Verify your email is listed exactly as you'll use it
3. **Case-sensitive**: `YourName@gmail.com` ≠ `yourname@gmail.com`
4. Make sure you're testing with the SAME email that's in the test users list

---

### Step 9: Check App Status

Back in **OAuth consent screen**, verify:

- ✅ **Publishing status**: Should show "Testing" (with test users) or "In production"
- ✅ **App name**: Shows your app name
- ✅ **No errors or warnings** shown

If there are warnings:
- Click on each warning
- Fix the issue
- Save changes

---

### Step 10: Test Again

1. Wait 1-2 minutes for changes to propagate
2. **Make sure you're using the EXACT email** that's in your test users list
3. Try signing in with Google
4. The error should be resolved

---

## Common Mistakes That Cause This Error

### ❌ Mistake 1: Not Added as Test User
- **Fix**: Add your email to Test users tab
- **Check**: OAuth consent screen → Test users → Is your email there?

### ❌ Mistake 2: Missing Privacy Policy/Terms URLs
- **Fix**: Add placeholder URLs if you don't have real ones
- **Check**: OAuth consent screen → App information → Privacy policy & Terms filled?

### ❌ Mistake 3: Wrong Email Address
- **Fix**: Use the EXACT email that's in test users list
- **Check**: Is the email you're signing in with EXACTLY the same as in test users?

### ❌ Mistake 4: App Not Properly Configured
- **Fix**: Complete all tabs (App information, Scopes, Test users)
- **Check**: OAuth consent screen → Summary → All sections completed?

### ❌ Mistake 5: App Not in Testing Mode
- **Fix**: Make sure app status is "Testing" if you want test users only
- **Check**: OAuth consent screen → Publishing status

---

## Verification Checklist

Before testing, verify ALL of these:

- [ ] **App information** tab completed:
  - [ ] App name filled
  - [ ] User support email selected
  - [ ] Privacy policy URL added (even placeholder)
  - [ ] Terms of service URL added (even placeholder)
  - [ ] Clicked "Save and Continue"

- [ ] **Scopes** tab completed:
  - [ ] `.../auth/userinfo.email` added
  - [ ] `.../auth/userinfo.profile` added
  - [ ] Clicked "Save and Continue"

- [ ] **Test users** tab completed:
  - [ ] Your email added as test user
  - [ ] Email matches exactly what you'll use to sign in
  - [ ] Clicked "Save and Continue"

- [ ] **Summary** tab reviewed:
  - [ ] All information looks correct
  - [ ] No warnings or errors

- [ ] **OAuth Client ID** configured:
  - [ ] HTTPS redirect URIs added
  - [ ] IP-based URIs removed
  - [ ] Saved

- [ ] **Publishing status**:
  - [ ] Shows "Testing" or "In production"
  - [ ] No errors shown

---

## If Still Not Working

### 1. Check Exact Error Details

The error message says:
> "If you are a developer of project-1065488262096, see error details"

1. In Google Cloud Console, look for **error details** link
2. Click it to see specific validation errors
3. Fix each error shown

### 2. Verify Your Email

1. Go to OAuth consent screen → Test users
2. Copy your email exactly as shown
3. Sign in with that EXACT email (case-sensitive)

### 3. Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Try signing in
4. Look for detailed error messages
5. Copy exact error and check what it says

### 4. Wait for Propagation

- Google Cloud changes can take 1-5 minutes to propagate
- Wait a few minutes and try again

### 5. Clear Browser Cache

1. Clear your browser cache
2. Try in incognito/private window
3. Sign in again

---

## Quick Fix Summary

The most common cause is **not being added as a test user**. Here's the fastest fix:

1. **OAuth consent screen** → **Test users** tab
2. Click **+ ADD USERS**
3. Add your email (exact email you'll sign in with)
4. Click **Add** → **Save**
5. Wait 1-2 minutes
6. Try signing in with that EXACT email

---

## Need More Help?

If you've checked everything above and it still doesn't work:

1. **Check error details** in Google Cloud Console
2. **Check browser console** for exact error messages
3. **Verify your email** is exactly as listed in test users
4. **Wait for propagation** (1-5 minutes)

The error is almost always one of:
- Missing test user (90% of cases)
- Missing Privacy Policy/Terms URLs
- Wrong email address being used
- App not properly configured

