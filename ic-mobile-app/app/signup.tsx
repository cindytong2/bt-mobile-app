import { StyleSheet, View, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
// import { signInWithPopup } from "firebase/auth";
// import { auth, provider } from "../config/firebaseConfig";

export default function SignUpScreen() {
  const handleGoogleSignUp = async () => {
    // TODO: Implement Google authentication
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
            
            {/* Sign Up Form */}
            <View style={styles.formContainer}>
              <ThemedText style={styles.loginTitle}>Sign Up with Google</ThemedText>
              
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                activeOpacity={0.8}
              >
                <View style={styles.googleButtonContent}>
                  <View style={styles.googleLogoContainer}>
                    <View style={[styles.googleLogoPart, { backgroundColor: '#4285F4', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }]} />
                    <View style={[styles.googleLogoPart, { backgroundColor: '#EA4335' }]} />
                    <View style={[styles.googleLogoPart, { backgroundColor: '#FBBC05', borderTopRightRadius: 10 }]} />
                    <View style={[styles.googleLogoPart, { backgroundColor: '#34A853', borderBottomRightRadius: 10 }]} />
                  </View>
                  <ThemedText style={styles.googleButtonText}>Sign up with Google</ThemedText>
                </View>
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
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogoContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  googleLogoPart: {
    width: 10,
    height: 10,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
});
