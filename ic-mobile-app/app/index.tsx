import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { signInWithEmail } from '@/utils/emailAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAdminEmail } from '@/utils/adminEmails';

const AUTH_EMAIL_KEY = '@auth_user_email';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Clear previous error
    setError(null);

    try {
      setLoading(true);
      const result = await signInWithEmail(email);
      
      if (result.success && result.email) {
        // Clear any stale email first to prevent redirect loops
        // Then save the new email to AsyncStorage
        const normalizedEmail = result.email.toLowerCase().trim();
        await AsyncStorage.removeItem(AUTH_EMAIL_KEY);
        await AsyncStorage.setItem(AUTH_EMAIL_KEY, normalizedEmail);
        
        // Small delay to ensure AsyncStorage is updated before navigation
        // This prevents race conditions with AuthContext loading stale data
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Navigate based on email - admin goes to scanner, others go to schedule
        if (isAdminEmail(normalizedEmail)) {
          router.replace('/qr-scanner');
        } else {
          router.replace('/schedule');
        }
      } else {
        // Show inline error message
        setError(result.error || 'Please enter a different email address');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) {
      setError(null);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView lightColor="transparent" darkColor="transparent" style={styles.innerContainer}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/ic-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Login Form */}
            <View style={styles.formContainer}>
              <ThemedText style={styles.loginTitle}>Sign In</ThemedText>
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
                {error && (
                  <ThemedText style={styles.errorText}>
                    {error}
                  </ThemedText>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                onPress={handleEmailSignIn}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f7f4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000000',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#05688e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
});
