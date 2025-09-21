import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../firebase";

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Navigate to the schedule page
    router.push('/schedule');
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
              <ThemedText style={styles.loginTitle}>Log In</ThemedText>
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Username</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputContainer, { marginTop: 10 }]}>
                <ThemedText style={styles.inputLabel}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  />
              </View>
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.loginButtonText}>Log In</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.signupContainer}>
                <ThemedText style={styles.signupText}>Don't have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <ThemedText style={[styles.signupText, styles.signupLink]}>Sign up here</ThemedText>
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
    marginBottom: 10,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000000',
  },
  loginButton: {
    backgroundColor: '#05688e',
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
  loginButtonText: {
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
