# How to Get Your Google OAuth Client ID

Follow these steps to get your `EXPO_PUBLIC_GOOGLE_CLIENT_ID`:

## Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

## Step 2: Create or Select a Project

1. Click on the project dropdown at the top
2. Either:
   - **Create a new project**: Click "New Project", give it a name (e.g., "IC Mobile App"), and click "Create"
   - **Select existing project**: Choose your Firebase project (since you're already using Firebase, you can use the same project)

## Step 3: Enable Google Sign-In API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google Sign-In API" or "Identity Toolkit API"
3. Click on it and click **Enable**

Alternatively:
1. Go to **APIs & Services** → **Enabled APIs**
2. Click **+ ENABLE APIS AND SERVICES**
3. Search for "Google Sign-In API" and enable it

## Step 4: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: IC Mobile App (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the **Scopes** page, click **Add or Remove Scopes**
   - Add: `.../auth/userinfo.email`
   - Add: `.../auth/userinfo.profile`
   - Click **Update**, then **Save and Continue**
7. On the **Test users** page (if testing), add your email as a test user, then click **Save and Continue**
8. Review and click **Back to Dashboard**

## Step 5: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: 
   - For Expo development: Choose **Web application**
   - For production: You may need separate iOS/Android clients later
4. Fill in:
   - **Name**: IC Mobile App Web Client (or any name)
   - **Authorized redirect URIs**: 
     - For Expo development: Add `https://auth.expo.io/@your-username/ic-mobile-app`
     - Or use the proxy: `exp://127.0.0.1:8081` and `https://auth.expo.io`
     - You can add multiple redirect URIs
5. Click **Create**
6. **Copy the Client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

## Step 6: Add Client ID to Your Project

1. In your project root (`ic-mobile-app`), create a `.env` file:
   ```bash
   cd ic-mobile-app
   touch .env
   ```

2. Add your Google Client ID:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
   ```

   Example:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

3. **Important**: Make sure `.env` is in your `.gitignore` (it should already be there)

## Step 7: Restart Your Expo Development Server

After adding the environment variable:
1. Stop your current Expo server (Ctrl+C)
2. Clear the cache and restart:
   ```bash
   npx expo start --clear
   ```

## Troubleshooting

### "EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured" Error

- Make sure your `.env` file is in the `ic-mobile-app` directory (same level as `app.json`)
- Ensure the variable name starts with `EXPO_PUBLIC_`
- Restart the Expo server after adding the variable
- For Expo projects, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible

### "redirect_uri_mismatch" Error

- Add your Expo redirect URI to the **Authorized redirect URIs** in Google Cloud Console
- Common Expo redirect URIs:
  - `exp://localhost:8081`
  - `exp://127.0.0.1:8081`
  - `https://auth.expo.io/@your-username/ic-mobile-app`
  - `https://auth.expo.io/@anonymous/ic-mobile-app`

### Finding Your Expo Redirect URI

When you run `npx expo start`, Expo will show you the redirect URI in the console. Look for a message like:
```
› Web is waiting on https://auth.expo.io/@...
```

You can also check what redirect URI is being used by adding this temporarily to your code:
```typescript
import * as AuthSession from 'expo-auth-session';
const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
console.log('Redirect URI:', redirectUri);
```

## Additional Notes

- For **iOS and Android production builds**, you'll need to create separate OAuth client IDs:
  - iOS: Use bundle identifier from `app.json` (`com.anonymous.ic-mobile-app`)
  - Android: Use package name and SHA-1 certificate fingerprint
- For development, the **Web application** client ID should work with Expo

