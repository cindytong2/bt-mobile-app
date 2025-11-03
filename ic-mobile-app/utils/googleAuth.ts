import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token', // Updated to v2 token endpoint
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export async function signInWithGoogle() {
  try {
    // Create redirect URI - MUST use proxy for HTTPS URL (Google doesn't accept IP addresses)
    // Google OAuth requires redirect URIs to use valid top-level domains (.com, .org, etc.)
    // Expo proxy provides: https://auth.expo.io/@anonymous/ic-mobile-app
    let redirectUri = AuthSession.makeRedirectUri({
      useProxy: true, // Force use of Expo's HTTPS proxy service
    } as any);
    
    // Force HTTPS proxy URI if we still got an IP-based URI
    if (redirectUri.startsWith('exp://')) {
      console.warn('⚠️  Proxy not working, forcing HTTPS redirect URI...');
      // Manually construct the Expo proxy URI
      redirectUri = 'https://auth.expo.io/@anonymous/ic-mobile-app';
      console.warn('   Using hardcoded proxy URI:', redirectUri);
    }

    // Get Google OAuth client ID from environment
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Debug logging
    console.log('🔍 Google Auth Debug Info:');
    console.log('Redirect URI:', redirectUri);
    console.log('Redirect URI length:', redirectUri.length);
    console.log('Redirect URI (encoded):', encodeURIComponent(redirectUri));
    console.log('⚠️  CRITICAL: Copy the EXACT redirect URI above and verify it in Google Cloud Console!');
    console.log('    Go to: APIs & Services → Credentials → Your OAuth Client ID');
    console.log('    Scroll to "Authorized redirect URIs" section');
    console.log('    Make sure this EXACT string is there:', redirectUri);
    console.log('    NO trailing slash, NO spaces, EXACT match!');
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
      // Important OAuth parameters:
      // - prompt: "select_account" - forces Google to show account selection screen
      // - access_type: "offline" - requests refresh token for persistent auth
      extraParams: {
        prompt: 'select_account',
        access_type: 'offline',
      },
    } as any);

    // Prompt for authentication
    console.log('🚀 Starting Google authentication...');
    console.log('Redirect URI being used:', redirectUri);
    console.log('⚠️  Make sure this EXACT URI is in Google Cloud Console!');
    console.log('   Add BOTH of these to be safe:');
    console.log('   - https://auth.expo.io/@anonymous/ic-mobile-app');
    console.log('   - https://auth.expo.io/@anonymous/ic-mobile-app/');
    
    // Set up timeout to catch if promptAsync never returns
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Authentication timeout after 60 seconds - redirect did not complete'));
      }, 60000);
    });
    
    // Call maybeCompleteAuthSession right before prompting to handle any pending redirects
    WebBrowser.maybeCompleteAuthSession();
    
    let result;
    try {
      console.log('⏳ Waiting for authentication response...');
      console.log('   (This may take up to 60 seconds - if timeout, check redirect URI in Google Cloud Console)');
      console.log('   (If redirect happens but not caught, check deep linking configuration)');
      
      // Race between authentication and timeout
      result = await Promise.race([
        request.promptAsync(discovery).catch((error) => {
          console.error('❌ Error in promptAsync:', error);
          throw error;
        }),
        timeoutPromise
      ]) as any;
      
      if (!result) {
        throw new Error('No result returned from authentication prompt');
      }
      
      console.log('✅ Authentication response received!');
      console.log('📋 Authentication result type:', result.type);
      
    } catch (promptError: any) {
      console.error('❌ Error during authentication prompt:', promptError);
      console.error('Error message:', promptError.message);
      console.error('Error stack:', promptError.stack);
      
      if (promptError.message && promptError.message.includes('timeout')) {
        throw new Error(
          'Authentication timed out after 60 seconds.\n\n' +
          'This usually means:\n' +
          '1. The redirect URI does not match exactly in Google Cloud Console\n' +
          '2. The redirect is happening but not being caught by the app\n' +
          '3. Check that https://auth.expo.io/@anonymous/ic-mobile-app is in Google Cloud Console\n' +
          '4. Wait 2-3 minutes after adding the URI for changes to propagate'
        );
      }
      throw promptError;
    }
    
    if (!result) {
      throw new Error('No result returned from authentication prompt');
    }
    
    console.log('📋 Authentication result type:', result.type);
    
    // Only access params if it's a success result
    if (result.type === 'success') {
      console.log('📋 Result params:', JSON.stringify((result as any).params || {}, null, 2));
    } else {
      console.log('⚠️  Authentication did not succeed. Type:', result.type);
    }

    if (result.type === 'success') {
      // Exchange authorization code for ID token
      const { code } = result.params;
      
      console.log('✅ Authentication successful, received code:', !!code);
      
      if (code) {
        try {
          // Get the code verifier from the request object
          // expo-auth-session stores it internally when PKCE is enabled
          const codeVerifier = (request as any).codeVerifier;
          
          console.log('🔄 Exchanging code for tokens...');
          console.log('Code verifier present:', !!codeVerifier);
          
          if (!codeVerifier) {
            console.error('❌ Code verifier not found in request object');
            throw new Error('PKCE code verifier not found. Unable to exchange code for tokens.');
          }
          
          // Exchange code for tokens using the code verifier from the request
          const tokenResponse = await AuthSession.exchangeCodeAsync(
            {
              clientId,
              code,
              redirectUri,
              extraParams: {},
              codeVerifier,
            } as any, // codeVerifier is required for PKCE but TypeScript may not recognize it
            discovery
          );

          console.log('✅ Token exchange successful');
          console.log('ID token present:', !!tokenResponse.idToken);
          console.log('Access token present:', !!tokenResponse.accessToken);

          const idToken = tokenResponse.idToken;
          
          if (idToken) {
            console.log('🔥 Creating Firebase credential...');
            // Create Firebase credential
            const credential = GoogleAuthProvider.credential(idToken);
            
            console.log('🔐 Signing in with Firebase...');
            // Sign in with Firebase
            const userCredential = await signInWithCredential(auth, credential);
            
            console.log('✅ Firebase sign-in successful!');
            console.log('User email:', userCredential.user.email);
            
            return {
              success: true,
              user: userCredential.user,
              email: userCredential.user.email || null,
            };
          } else {
            console.error('❌ No ID token in token response');
            console.log('Token response:', JSON.stringify(tokenResponse, null, 2));
            throw new Error('No ID token received from token exchange');
          }
        } catch (exchangeError: any) {
          console.error('❌ Token exchange failed:', exchangeError);
          console.error('Error details:', exchangeError.message);
          throw new Error(`Token exchange failed: ${exchangeError.message}`);
        }
      } else {
        console.error('❌ No authorization code in result params');
        console.log('Result params:', JSON.stringify(result.params, null, 2));
        throw new Error('No authorization code received');
      }
    } else {
      console.log('❌ Authentication failed or cancelled:', result.type);
      console.log('Full result object:', JSON.stringify(result, null, 2));
      
      // Check if there's an error in the result
      if ((result as any).error) {
        console.error('Error in result:', (result as any).error);
        console.error('Error description:', (result as any).errorDescription);
      }
      
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

