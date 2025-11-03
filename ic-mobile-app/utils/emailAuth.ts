import { collection, query, where, getDocs } from 'firebase/firestore';
// @ts-ignore - firebaseConfig is a .js file without types
import { db } from '../config/firebaseConfig';

export interface EmailAuthResult {
  success: boolean;
  email?: string;
  userData?: any;
  error?: string;
}

/**
 * Simple email-based authentication that matches email in Firestore
 * No password required - just validates email exists in ic-users collection
 */
export async function signInWithEmail(email: string): Promise<EmailAuthResult> {
  try {
    if (!email || !email.trim()) {
      return {
        success: false,
        error: 'Please enter an email address',
      };
    }

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('🔍 Checking email in Firestore:', normalizedEmail);

    // Special case: Allow businesstoday@gmail.com to bypass Firestore check
    // This is for QR scanner access
    if (normalizedEmail === 'businesstoday@gmail.com') {
      console.log('✅ Special admin email detected, allowing access');
      return {
        success: true,
        email: normalizedEmail,
        userData: {
          email: normalizedEmail,
          isAdmin: true,
        },
      };
    }

    // Query Firestore for user with this email
    const usersRef = collection(db, 'ic-users');
    const q = query(usersRef, where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ No user found with email:', normalizedEmail);
      return {
        success: false,
        error: 'Please enter a different email address',
      };
    }

    // User found - get their data
    const userDoc = querySnapshot.docs[0];
    const userData = {
      userId: userDoc.id,
      ...userDoc.data(),
    };

    console.log('✅ User found:', userData);

    return {
      success: true,
      email: normalizedEmail,
      userData,
    };
  } catch (error: any) {
    console.error('❌ Error during email authentication:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during authentication',
    };
  }
}

