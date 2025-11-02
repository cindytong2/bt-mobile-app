# Fix 400 Error - Google Authentication

The "400" error when clicking "Sign in with Google" is usually a **redirect_uri_mismatch** error. Here's how to fix it:

---

## Step 1: Find Your Actual Redirect URI

I've added debug logging to your code. When you click "Sign in with Google", check your console/logs for:

```
🔍 Google Auth Debug Info:
Redirect URI: [your-actual-redirect-uri]
```

**OR** run this in your terminal after starting Expo:
```bash
npx expo start
```

Look for a line that says:
```
› Web is waiting on https://auth.expo.io/@...
```

---

## Step 2: Common Expo Redirect URIs

These are the most common redirect URIs Expo uses:
- `https://auth.expo.io/@anonymous/ic-mobile-app`
- `https://auth.expo.io/@your-username/ic-mobile-app`
- `exp://127.0.0.1:8081`
- `exp://localhost:8081`

---

## Step 3: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (the same one you're using for Firebase)
3. Go to **APIs & Services** → **Credentials** (left sidebar)
4. Find your **OAuth 2.0 Client ID** (the Web application one)
5. Click on it to edit
6. In **Authorized redirect URIs**, click **+ ADD URI**
7. Add **ALL** of these URIs (one by one):
   ```
   https://auth.expo.io/@anonymous/ic-mobile-app
   https://auth.expo.io
   exp://127.0.0.1:8081
   exp://localhost:8081
   ```
   
   **Also add the exact URI from Step 1** (if it's different from above)
8. Click **Save**

---

## Step 4: Verify Your Client ID

1. In the same Google Cloud Console → Credentials page
2. Check your OAuth 2.0 Client ID format:
   - Should be: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - Should end with `.apps.googleusercontent.com`
   - Should be the **Web application** type (not iOS/Android)
3. Copy the **Client ID** (just the Client ID, not the Client Secret)

---

## Step 5: Verify .env File

1. Make sure you have a `.env` file in your project root:
   ```bash
   cd /Users/cindytong/ic-mobile-app
   ls -la | grep .env
   ```

2. If `.env` doesn't exist, create it:
   ```bash
   touch .env
   ```

3. Open `.env` and add (replace with YOUR actual Client ID):
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

   **Important**:
   - No quotes around the value
   - No spaces around the `=`
   - Must start with `EXPO_PUBLIC_`

4. Save the file

---

## Step 6: Restart Expo Server

1. Stop your Expo server (Ctrl+C or Cmd+C)
2. Clear cache and restart:
   ```bash
   npx expo start --clear
   ```

---

## Step 7: Check Console Logs

When you click "Sign in with Google", check your console/logs:

1. You should see the debug info I added:
   ```
   🔍 Google Auth Debug Info:
   Redirect URI: [something]
   Client ID configured: true
   Client ID value: [something]...
   ```

2. If `Client ID configured: false`, your `.env` file isn't being loaded. Fix:
   - Verify `.env` is in the correct location
   - Restart Expo with `--clear`
   - Check for typos in variable name

3. Copy the **exact Redirect URI** from the logs

---

## Step 8: Add Exact Redirect URI to Google Cloud

1. Copy the **exact Redirect URI** from your console logs
2. Go to Google Cloud Console → Credentials
3. Edit your OAuth 2.0 Client ID
4. In **Authorized redirect URIs**, add the **exact URI** from your logs
5. Click **Save**
6. Wait a few seconds for changes to propagate

---

## Step 9: Test Again

1. Try signing in with Google again
2. If you still get 400 error, check:
   - Browser/device console for the exact error message
   - Google Cloud Console → Credentials → your OAuth client → Authorized redirect URIs (verify it's there)
   - Make sure you restarted Expo with `--clear`

---

## Other Common 400 Error Causes

### 1. OAuth Consent Screen Not Configured

1. Go to Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. Make sure it's configured:
   - App name set
   - User support email set
   - Scopes added: `.../auth/userinfo.email` and `.../auth/userinfo.profile`
   - Test users added (your email)

### 2. Google Sign-In API Not Enabled

1. Go to Google Cloud Console → **APIs & Services** → **Library**
2. Search for "Google Sign-In API"
3. Make sure it's **Enabled**

### 3. Wrong Client ID Type

Make sure you're using the **Web application** OAuth Client ID, not iOS or Android.

---

## Quick Checklist

- [ ] Found actual redirect URI from console logs
- [ ] Added redirect URI to Google Cloud Console → Credentials → OAuth Client → Authorized redirect URIs
- [ ] Verified Client ID format (ends with `.apps.googleusercontent.com`)
- [ ] Created `.env` file in project root
- [ ] Added `EXPO_PUBLIC_GOOGLE_CLIENT_ID` to `.env` (no quotes, no spaces)
- [ ] Restarted Expo with `npx expo start --clear`
- [ ] Verified OAuth consent screen is configured
- [ ] Verified Google Sign-In API is enabled
- [ ] Tested again

---

## Still Not Working?

If you're still getting the 400 error after following these steps:

1. **Check the exact error message**: Look in your browser/device console for the full error. It might say something like:
   - `redirect_uri_mismatch`
   - `invalid_client`
   - `invalid_request`

2. **Double-check your redirect URI**:
   - Open your app
   - Click "Sign in with Google"
   - Immediately check console logs for the redirect URI
   - Verify this EXACT URI is in Google Cloud Console

3. **Try adding ALL possible Expo redirect URIs**:
   ```
   https://auth.expo.io/@anonymous/ic-mobile-app
   https://auth.expo.io/@anonymous/ic-mobile-app/
   https://auth.expo.io
   https://auth.expo.io/
   exp://127.0.0.1:8081
   exp://localhost:8081
   ```

4. **Wait a few minutes**: Google Cloud changes can take a few minutes to propagate

---

Let me know what redirect URI you see in the console logs, and I can help you add the exact one!

