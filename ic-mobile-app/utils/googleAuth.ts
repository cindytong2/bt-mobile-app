import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// Complete web browser authentication for OAuth
WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export async function signInWithGoogle() {
  try {
    // Create redirect URI - MUST use proxy for HTTPS URL (Google doesn't accept IP addresses)
    // Google OAuth requires redirect URIs to use valid top-level domains (.com, .org, etc.)
    // Expo proxy provides: https://auth.expo.io/@anonymous/ic-mobile-app
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true, // Force use of Expo's HTTPS proxy service
    } as any);
    
    // Validate that we got an HTTPS URL (not exp:// IP address)
    if (redirectUri.startsWith('exp://')) {
      console.warn('⚠️  Warning: Got IP-based redirect URI. Google requires HTTPS URLs.');
      console.warn('   This might fail. Check your Expo configuration.');
    }

    // Get Google OAuth client ID from environment
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Debug logging
    console.log('🔍 Google Auth Debug Info:');
    console.log('Redirect URI:', redirectUri);
    console.log('⚠️  IMPORTANT: Add this exact redirect URI to Google Cloud Console!');
    console.log('    Go to: APIs & Services → Credentials → Your OAuth Client ID');
    console.log('    Then add this URI to "Authorized redirect URIs":');
    console.log('    →', redirectUri);
    console.log('Client ID configured:', !!clientId);
    console.log('Client ID value:', clientId ? `${clientId.substring(0, 20)}...` : 'NOT SET');
    
    if (!clientId) {
      throw new Error('EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured');
    }

    // Use authorization code flow with PKCE (supported by Google)
    // This avoids the "code_challenge_method not allowed" error
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      // PKCE is automatically used with Code flow, which Google supports
    } as any);

    // Prompt for authentication
    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      // Exchange authorization code for ID token
      const { code } = result.params;
      
      if (code) {
        // Exchange code for tokens using the code verifier from the request
        // The request object stores the codeVerifier internally for PKCE
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri,
            extraParams: {},
            // @ts-ignore - codeVerifier is stored in the request but TypeScript may not see it
            codeVerifier: (request as any).codeVerifier,
          },
          discovery
        );

        const idToken = tokenResponse.idToken;
        
        if (idToken) {
          // Create Firebase credential
          const credential = GoogleAuthProvider.credential(idToken);
          
          // Sign in with Firebase
          const userCredential = await signInWithCredential(auth, credential);
          
          return {
            success: true,
            user: userCredential.user,
            email: userCredential.user.email || null,
          };
        } else {
          throw new Error('No ID token received from token exchange');
        }
      } else {
        throw new Error('No authorization code received');
      }
    } else {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication cancelled' : 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Provide helpful error messages for common OAuth policy errors
    const errorMessage = error.message || '';
    let helpfulMessage = errorMessage;
    
    if (errorMessage.includes('access blocked') || errorMessage.includes('OAuth 2.0 policy')) {
      helpfulMessage = `OAuth Policy Error: Your app doesn't comply with Google OAuth 2.0 policy.\n\n` +
        `🔧 Quick Fix:\n` +
        `1. Go to Google Cloud Console → APIs & Services → OAuth consent screen\n` +
        `2. Make sure Privacy Policy and Terms of Service URLs are added (can use placeholders)\n` +
        `3. Add yourself as a Test User (OAuth consent screen → Test users → + ADD USERS)\n` +
        `4. Verify required scopes are added: userinfo.email, userinfo.profile\n` +
        `5. Make sure you're signing in with an email that's listed as a test user\n\n` +
        `See FIX_OAUTH_POLICY_ERROR.md for detailed steps.`;
    } else if (errorMessage.includes('redirect_uri_mismatch') || errorMessage.includes('redirect_uri') || 
               errorMessage.includes('Invalid Redirect') || errorMessage.includes('top-level domain')) {
      helpfulMessage = `Redirect URI Error: Google doesn't accept IP addresses in redirect URIs.\n\n` +
        `🔧 Quick Fix:\n` +
        `1. The code should now use Expo's HTTPS proxy (https://auth.expo.io/@...)\n` +
        `2. Check the console logs above for your redirect URI\n` +
        `3. Go to Google Cloud Console → APIs & Services → Credentials\n` +
        `4. Edit your OAuth Client ID → Authorized redirect URIs\n` +
        `5. Remove any IP-based URIs (exp://10.x.x.x:8081)\n` +
        `6. Add the HTTPS redirect URI from the logs (should be https://auth.expo.io/@...)\n` +
        `7. Common ones to add:\n` +
        `   - https://auth.expo.io/@anonymous/ic-mobile-app\n` +
        `   - https://auth.expo.io\n` +
        `8. Click Save and wait a few seconds\n\n` +
        `See FIX_REDIRECT_URI.md for detailed steps.`;
    }
    
    return {
      success: false,
      error: helpfulMessage,
    };
  }
}

