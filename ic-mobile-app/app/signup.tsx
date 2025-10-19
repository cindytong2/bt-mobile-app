import React, { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../config/firebaseConfig";

export default function SignUpScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User:", result.user.email);
      // Navigate to the schedule page after successful sign in
      router.push('/schedule');
    } catch (error) {
      console.error(error);
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
            
            {/* Google Sign In Form */}
            <View style={styles.formContainer}>
              <ThemedText style={styles.loginTitle}>Sign Up with Google</ThemedText>
              
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleSignIn}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.googleButtonText}>Sign in with Google</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.signupContainer}>
                <ThemedText style={styles.signupText}>Returning user? </ThemedText>
                <TouchableOpacity onPress={() => router.back()}>
                  <ThemedText style={[styles.signupText, styles.signupLink]}>Log in here</ThemedText>
                </TouchableOpacity>
              </View>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#05688e',
    fontWeight: '600',
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
  googleButton: {
    backgroundColor: '#4285f4',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  signupLink: {
    color: '#05688e',
    fontWeight: '600',
  },
});
