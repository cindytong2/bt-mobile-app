# Firebase Google Authentication Setup - Step by Step

Follow these EXACT steps to get your `EXPO_PUBLIC_GOOGLE_CLIENT_ID` for Firebase Google Authentication:

---

## Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your Firebase project (or create a new one if you haven't already)
   - **Note**: Your Firebase project IS a Google Cloud project, so you'll use the same project in both consoles

---

## Step 2: Enable Google Sign-In in Firebase Console

1. In Firebase Console, click on **Authentication** in the left sidebar
2. Click on the **Sign-in method** tab
3. Find **Google** in the list of providers
4. Click on **Google**
5. Toggle **Enable** to ON
6. Click **Save** (you can skip entering the Web client ID and Web client secret for now - we'll get these in the next steps)
7. Keep this page open or remember that Google Sign-In is now enabled

---

## Step 3: Open Google Cloud Console (Same Project)

1. In Firebase Console, click on the **⚙️ gear icon** next to "Project Overview" at the top
2. Click **Project settings**
3. Scroll down to **Your apps** section
4. Find the **Web app** section (or click **Add app** → **Web** if you don't have one)
5. You'll see your Firebase config values
6. Now click on **Project settings** at the top of the page
7. Click **Go to Cloud Console** link (this opens the same project in Google Cloud Console)

**Alternative**: Directly go to [Google Cloud Console](https://console.cloud.google.com/) and select your Firebase project from the project dropdown

---

## Step 4: Enable Google Sign-In API

1. In Google Cloud Console, go to **APIs & Services** → **Library** (left sidebar)
2. Search for **"Google Sign-In API"** in the search bar
3. Click on **Google Sign-In API**
4. Click the **Enable** button
5. Wait for it to enable (may take a few seconds)

**Alternative method**:
- Go to **APIs & Services** → **Enabled APIs**
- Click **+ ENABLE APIS AND SERVICES**
- Search for **"Google Sign-In API"**
- Click on it and click **Enable**

---

## Step 5: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen** (left sidebar)
2. If you see a screen asking to choose User Type:
   - Choose **External** (unless you have a Google Workspace account)
   - Click **Create**
3. Fill in the required information:
   - **App name**: `IC Mobile App` (or your app name)
   - **User support email**: Select your email from the dropdown
   - **Developer contact information**: Enter your email address
4. Click **Save and Continue**
5. On the **Scopes** page:
   - Click **Add or Remove Scopes** button
   - In the filter/search box, type `email`
   - Check the box next to `.../auth/userinfo.email`
   - Check the box next to `.../auth/userinfo.profile`
   - Click **Update** button
   - Click **Save and Continue** button
6. On the **Test users** page (if testing):
   - Click **+ ADD USERS**
   - Enter your email address (the one you'll use to test)
   - Click **Add**
   - Click **Save and Continue**
7. On the **Summary** page:
   - Review the information
   - Click **Back to Dashboard**

---

## Step 6: Create OAuth 2.0 Client ID (Web Application)

1. In Google Cloud Console, go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** button at the top
3. Click **OAuth client ID** from the dropdown
4. If prompted to configure consent screen first, follow Step 5 above
5. In the **Application type** dropdown, select **Web application**
6. Fill in:
   - **Name**: `IC Mobile App Web Client` (or any descriptive name)
   - **Authorized redirect URIs**: Click **+ ADD URI** and add these URIs one by one:
     ```
     https://auth.expo.io/@anonymous/ic-mobile-app
     exp://127.0.0.1:8081
     https://auth.expo.io
     ```
7. Click **Create** button
8. A popup will appear with your **Client ID** and **Client secret**
   - **COPY THE CLIENT ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - You can also copy the Client secret if needed, but for Expo we mainly need the Client ID
9. Click **OK** to close the popup

---

## Step 7: Add Client ID to Firebase Console (Optional but Recommended)

1. Go back to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Google** provider
4. Paste your **Web client ID** (the Client ID you copied)
5. Paste your **Web client secret** (if you copied it)
6. Click **Save**

**Note**: This step is optional because you're using `expo-auth-session` directly, but it helps keep everything in sync.

---

## Step 8: Add Client ID to Your Expo Project

1. Navigate to your project directory:
   ```bash
   cd /Users/cindytong/ic-mobile-app
   ```

2. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   touch .env
   ```

3. Open the `.env` file in a text editor

4. Add your Google Client ID:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
   ```

   Replace `your-client-id-here` with the Client ID you copied. Example:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

   **Important**: 
   - Do NOT add quotes around the value
   - Do NOT add spaces around the `=` sign
   - The variable name MUST start with `EXPO_PUBLIC_`

5. Save the file

---

## Step 9: Verify .env is in .gitignore

1. Check if `.gitignore` file exists in your project root
2. Open `.gitignore` and verify it contains `.env` (to avoid committing secrets)
3. If `.env` is not in `.gitignore`, add it:
   ```
   .env
   ```

---

## Step 10: Restart Expo Development Server

1. **Stop your current Expo server** (if running):
   - Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac) in the terminal

2. **Clear cache and restart**:
   ```bash
   npx expo start --clear
   ```

   The `--clear` flag is important because Expo caches environment variables, and you need to reload them.

3. Wait for the Expo server to start
4. Look for any errors in the console

---

## Step 11: Test Google Authentication

1. Open your app (on a device or emulator)
2. Navigate to the login screen
3. Tap the **"Sign in with Google"** button
4. You should see the Google sign-in flow
5. Sign in with your test account
6. You should be successfully authenticated with Firebase

---

## Troubleshooting

### Error: "EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured"

**Solutions**:
- ✅ Make sure `.env` file is in `/Users/cindytong/ic-mobile-app/` (same directory as `app.json`)
- ✅ Ensure variable name is exactly `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (case-sensitive)
- ✅ Check there are no quotes around the value in `.env`
- ✅ Check there are no spaces around the `=` sign
- ✅ Restart Expo server with `npx expo start --clear`
- ✅ Verify the variable starts with `EXPO_PUBLIC_`

### Error: "redirect_uri_mismatch"

**What this means**: The redirect URI your app is using doesn't match what you configured in Google Cloud Console.

**Solutions**:
1. Find your actual redirect URI:
   - When you run `npx expo start`, look in the console for a message like:
     ```
     › Web is waiting on https://auth.expo.io/@anonymous/ic-mobile-app
     ```
   - Or temporarily add this to your code to log the redirect URI:
     ```typescript
     import * as AuthSession from 'expo-auth-session';
     const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
     console.log('Redirect URI:', redirectUri);
     ```

2. Add the exact redirect URI to Google Cloud Console:
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID
   - In **Authorized redirect URIs**, click **+ ADD URI**
   - Paste the exact redirect URI
   - Click **Save**

3. Common Expo redirect URIs to add:
   ```
   https://auth.expo.io/@anonymous/ic-mobile-app
   exp://127.0.0.1:8081
   exp://localhost:8081
   https://auth.expo.io
   ```

### Error: "Access blocked: This app's request is invalid"

**Solutions**:
- ✅ Make sure you added your email as a **Test user** in OAuth consent screen (Step 5)
- ✅ Verify OAuth consent screen is configured (Step 5)
- ✅ Check that you're using a Google account that's listed as a test user

### Error: "popup_closed_by_user"

**What this means**: The user closed the authentication popup.

**Solutions**:
- This is normal if the user manually closes the popup
- Ensure your redirect URIs are correctly configured
- Check that the app isn't blocking popups

### Still Not Working?

1. **Double-check your Client ID format**:
   - Should look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - Should end with `.apps.googleusercontent.com`

2. **Verify Firebase Authentication is enabled**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Ensure **Google** is enabled (toggle is ON)

3. **Check Expo logs**:
   ```bash
   npx expo start --clear
   ```
   Look for any error messages or warnings

4. **Verify your Firebase config**:
   - Make sure all Firebase environment variables are set:
     - `EXPO_PUBLIC_FIREBASE_API_KEY`
     - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
     - etc.

---

## Summary Checklist

- [ ] Firebase project created/selected
- [ ] Google Sign-In enabled in Firebase Console
- [ ] Google Sign-In API enabled in Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] Test user email added
- [ ] OAuth 2.0 Client ID created (Web application type)
- [ ] Authorized redirect URIs added
- [ ] Client ID copied
- [ ] `.env` file created in project root
- [ ] `EXPO_PUBLIC_GOOGLE_CLIENT_ID` added to `.env`
- [ ] `.env` added to `.gitignore`
- [ ] Expo server restarted with `--clear` flag
- [ ] Google authentication tested successfully

---

## Additional Notes

- **For Development**: The Web application OAuth client ID works fine with Expo development
- **For Production**: You may need to create separate OAuth client IDs for iOS and Android later
  - iOS: Use bundle identifier `com.anonymous.ic-mobile-app` (from `app.json`)
  - Android: Use package name and SHA-1 certificate fingerprint
- **Firebase Project = Google Cloud Project**: They are the same thing, so you only need to configure once

---

Your Firebase Google Authentication should now be working! 🎉

