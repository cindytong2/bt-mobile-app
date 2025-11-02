# Fix: Invalid Redirect - Must Use Top-Level Domain

## Problem

**Error**: "Invalid Redirect: must end with a public top-level domain (such as .com or .org)"
**Error**: "Invalid Redirect: must use a domain that is a valid top private domain"

This happens when Google OAuth sees redirect URIs like:
- ❌ `exp://10.48.211.54:8081` (IP address - NOT ALLOWED)
- ❌ `exp://127.0.0.1:8081` (localhost - NOT ALLOWED)

**Google doesn't accept IP addresses in redirect URIs.** You must use HTTPS URLs with valid domains like:
- ✅ `https://auth.expo.io/@anonymous/ic-mobile-app`
- ✅ `https://auth.expo.io`

---

## Solution: Use Expo's HTTPS Proxy

The code has been updated to **force the use of Expo's proxy service**, which provides HTTPS URLs that Google accepts.

### Step 1: Check Your Redirect URI

1. Restart your Expo server:
   ```bash
   npx expo start --clear
   ```

2. Try signing in with Google

3. Check your console logs - you should see:
   ```
   🔍 Google Auth Debug Info:
   Redirect URI: https://auth.expo.io/@anonymous/ic-mobile-app
   ```

   **If you see `exp://10.x.x.x:8081`, something is wrong - see troubleshooting below.**

### Step 2: Add HTTPS Redirect URIs to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (Web application type)
5. Scroll to **Authorized redirect URIs**
6. **Remove** any IP-based URIs:
   - ❌ Remove: `exp://10.48.211.54:8081`
   - ❌ Remove: `exp://127.0.0.1:8081`
   - ❌ Remove: `exp://localhost:8081`

7. **Add** these HTTPS URIs (if not already there):
   ```
   https://auth.expo.io/@anonymous/ic-mobile-app
   https://auth.expo.io/@anonymous/ic-mobile-app/
   https://auth.expo.io
   https://auth.expo.io/
   ```

8. Click **Save**

### Step 3: Verify the Redirect URI

After adding the URIs:
1. Check your console logs for the exact redirect URI
2. Make sure that **exact** URI is in Google Cloud Console
3. It should look like: `https://auth.expo.io/@anonymous/ic-mobile-app`

---

## How It Works Now

The code now **explicitly uses Expo's proxy**:
```typescript
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, // Force use of Expo's HTTPS proxy service
});
```

This ensures you get an HTTPS URL like:
- `https://auth.expo.io/@anonymous/ic-mobile-app`

Instead of IP-based URIs like:
- `exp://10.48.211.54:8081` ❌

---

## Troubleshooting

### Still Getting IP-Based URI?

If your logs still show `exp://10.x.x.x:8081`:

1. **Check your Expo server output**:
   ```bash
   npx expo start
   ```
   Look for a line like:
   ```
   › Web is waiting on https://auth.expo.io/@anonymous/ic-mobile-app
   ```

2. **Make sure you're using the latest code**:
   - The code should have `useProxy: true` explicitly set
   - Restart your Expo server with `--clear`

3. **Check if you're logged in to Expo**:
   - You might need to be logged in: `npx expo login`
   - Or the proxy might not be available - check Expo status

### Redirect URI Still Doesn't Work?

1. **Double-check the exact URI**:
   - Copy the exact redirect URI from console logs
   - Paste it into Google Cloud Console
   - Make sure there are no extra spaces or characters

2. **Try adding multiple variations**:
   ```
   https://auth.expo.io/@anonymous/ic-mobile-app
   https://auth.expo.io/@anonymous/ic-mobile-app/
   https://auth.expo.io
   https://auth.expo.io/
   ```

3. **Wait a few minutes**:
   - Google Cloud changes can take a few minutes to propagate

---

## Why This Happens

**Google's OAuth 2.0 Security Policy:**
- Google requires redirect URIs to use **valid HTTPS domains**
- IP addresses (`10.48.211.54`) are not allowed
- This prevents phishing and improves security

**Expo's Solution:**
- Expo provides a proxy service at `https://auth.expo.io`
- This creates stable HTTPS redirect URIs
- Google accepts these URLs because they use `.io` top-level domain

---

## Quick Checklist

- [ ] Code updated to use `useProxy: true` ✅ (already done)
- [ ] Restart Expo server: `npx expo start --clear`
- [ ] Check console logs - should show `https://auth.expo.io/...`
- [ ] Remove IP-based URIs from Google Cloud Console
- [ ] Add HTTPS redirect URIs to Google Cloud Console
- [ ] Save changes in Google Cloud Console
- [ ] Wait a few seconds for propagation
- [ ] Test Google Sign-In again

---

## Example Redirect URIs to Add

Add ALL of these to be safe:
```
https://auth.expo.io/@anonymous/ic-mobile-app
https://auth.expo.io/@anonymous/ic-mobile-app/
https://auth.expo.io
https://auth.expo.io/
```

Remove these:
```
exp://10.48.211.54:8081
exp://127.0.0.1:8081
exp://localhost:8081
```

---

## Summary

✅ **Fixed**: Code now forces use of Expo's HTTPS proxy
✅ **Action Required**: Add HTTPS redirect URIs to Google Cloud Console
✅ **Remove**: IP-based redirect URIs from Google Cloud Console

The "Invalid Redirect" error should be resolved once you:
1. Restart Expo (to use new code)
2. Add the HTTPS redirect URIs to Google Cloud Console
3. Remove the IP-based URIs

