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
    // Create redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    // Get Google OAuth client ID from environment
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured');
    }

    // Request Google OAuth
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri,
      useProxy: true,
    });

    // Prompt for authentication
    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      // Get the ID token
      const { id_token } = result.params;
      
      if (id_token) {
        // Create Firebase credential
        const credential = GoogleAuthProvider.credential(id_token);
        
        // Sign in with Firebase
        const userCredential = await signInWithCredential(auth, credential);
        
        return {
          success: true,
          user: userCredential.user,
          email: userCredential.user.email || null,
        };
      } else {
        throw new Error('No ID token received');
      }
    } else {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication cancelled' : 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
}

