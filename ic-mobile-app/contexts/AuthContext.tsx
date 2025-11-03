import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

interface AuthContextType {
  user: User | null;
  userEmail: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userEmail: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

const AUTH_EMAIL_KEY = '@auth_user_email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted email from AsyncStorage
    const loadPersistedEmail = async () => {
      try {
        const email = await AsyncStorage.getItem(AUTH_EMAIL_KEY);
        console.log('📧 AuthContext: Loaded email from AsyncStorage:', email);
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Error loading persisted email:', error);
      }
      setLoading(false);
    };

    loadPersistedEmail();

    // Listen for auth state changes (for Firebase auth only)
    // Note: With email-only auth, Firebase auth might not have a user
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Only override email from Firebase if we don't have one from AsyncStorage
      // For email-only auth, we rely on AsyncStorage, not Firebase auth
      if (currentUser && currentUser.email) {
        try {
          const storedEmail = await AsyncStorage.getItem(AUTH_EMAIL_KEY);
          // Only use Firebase email if there's no stored email, or if they match
          if (!storedEmail || storedEmail === currentUser.email) {
            setUserEmail(currentUser.email);
            await AsyncStorage.setItem(AUTH_EMAIL_KEY, currentUser.email);
          }
        } catch (error) {
          console.error('Error saving email:', error);
        }
      } else if (!currentUser) {
        // Don't clear email if Firebase auth has no user - we're using email-only auth
        // Only clear if explicitly logged out
        console.log('📧 AuthContext: No Firebase user, but may have email from AsyncStorage');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


