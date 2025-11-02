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
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Error loading persisted email:', error);
      }
    };

    loadPersistedEmail();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && currentUser.email) {
        setUserEmail(currentUser.email);
        try {
          await AsyncStorage.setItem(AUTH_EMAIL_KEY, currentUser.email);
        } catch (error) {
          console.error('Error saving email:', error);
        }
      } else {
        setUserEmail(null);
        try {
          await AsyncStorage.removeItem(AUTH_EMAIL_KEY);
        } catch (error) {
          console.error('Error removing email:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


