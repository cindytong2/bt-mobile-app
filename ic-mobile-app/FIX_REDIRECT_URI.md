# Fix Redirect URI Error: exp://10.48.211.54:8081

## Problem
Your app is using a redirect URI with a local network IP address: `exp://10.48.211.54:8081`

This happens when:
- Running Expo on a physical device on your local network
- The device connects using your computer's local IP instead of localhost

## Solution: Add Redirect URI to Google Cloud Console

**You do NOT need to configure anything in Firebase.** The redirect URIs are configured in Google Cloud Console (which is linked to your Firebase project).

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project (the same one as your Firebase project)
3. Navigate to **APIs & Services** → **Credentials** (left sidebar)

### Step 2: Edit Your OAuth 2.0 Client ID

1. Find your **OAuth 2.0 Client ID** (the Web application type)
2. Click on it to edit

### Step 3: Add Your Redirect URI

1. Scroll down to **Authorized redirect URIs**
2. Click **+ ADD URI**
3. Add these URIs **one by one**:

```
exp://10.48.211.54:8081
exp://127.0.0.1:8081
exp://localhost:8081
https://auth.expo.io/@anonymous/ic-mobile-app
https://auth.expo.io
```

**Important**: Replace `10.48.211.54` with whatever IP address your console logs show. Your IP might change, so you may need to add it again if it changes.

### Step 4: Save

1. Click **Save** at the bottom
2. Wait a few seconds for changes to propagate (usually instant)

### Step 5: Test Again

1. Try signing in with Google again
2. The redirect URI error should be resolved

---

## Alternative Solution: Use Expo Proxy (Recommended for Development)

Instead of using IP-based redirect URIs (which can change), you can use Expo's proxy service which uses a stable HTTPS URL.

### Option A: Use Expo Proxy Automatically

The code should already be trying to use the proxy. If it's not working, try adding this explicitly:

```typescript
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
});
```

### Option B: Check Your Expo Server

When you run `npx expo start`, look for a line like:
```
› Web is waiting on https://auth.expo.io/@anonymous/ic-mobile-app
```

Use that URL instead - it's more stable and doesn't depend on your local IP.

---

## Why This Happens

- When you run Expo on a physical device, it uses your computer's local network IP address
- Google OAuth requires exact redirect URI matching
- Each redirect URI must be explicitly authorized in Google Cloud Console
- Firebase doesn't manage redirect URIs - only Google Cloud Console does

---

## Troubleshooting

### Still getting redirect_uri_mismatch?

1. **Check the exact redirect URI** in your console logs when you click "Sign in with Google"
2. **Copy that exact URI** and add it to Google Cloud Console
3. **Make sure you clicked Save** in Google Cloud Console
4. **Wait a few seconds** after saving (changes are usually instant but sometimes take a moment)

### Your IP address keeps changing?

Consider using the Expo proxy (`https://auth.expo.io/@anonymous/ic-mobile-app`) which doesn't depend on your local IP.

### How to find your current redirect URI?

The code logs it to the console. Look for:
```
🔍 Google Auth Debug Info:
Redirect URI: exp://...
```

---

## Firebase Configuration

**You do NOT need to configure redirect URIs in Firebase.** Firebase uses the same Google Cloud Console project, so all OAuth configuration happens in Google Cloud Console.

The only Firebase configuration you need is:
- ✅ Google Sign-in method enabled in Firebase Console → Authentication → Sign-in method
- ✅ Your Web client ID from Google Cloud Console (already in your `.env` file)

