import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { recordScanToSheet } from "@/utils/googleSheets";
import { isAdminEmail } from "@/utils/adminEmails";

const AUTH_EMAIL_KEY = '@auth_user_email';
const SCAN_COOLDOWN_MS = 3000; // 3 seconds cooldown between scans

export default function QRScannerScreen() {
  const { userEmail: contextUserEmail } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(contextUserEmail);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [recording, setRecording] = useState(false);
  const router = useRouter();
  
  // Use refs to track state synchronously and prevent race conditions
  const isProcessingRef = useRef(false);
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedDataRef = useRef<string | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);

  // Load email from AsyncStorage
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const email = await AsyncStorage.getItem(AUTH_EMAIL_KEY);
        if (email) {
          setUserEmail(email);
        } else if (contextUserEmail) {
          setUserEmail(contextUserEmail);
        }
      } catch (error) {
        console.error('Error loading email:', error);
      }
    };
    loadEmail();
  }, [contextUserEmail]);

  // Redirect non-admin users back to schedule
  // Use a ref to prevent multiple redirects and track the last checked email
  // Only redirect if we're sure the email is current (not stale from AsyncStorage)
  const redirectCheckedRef = useRef<string | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // Clear any pending redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    
    const checkAdminAccess = async () => {
      try {
        // Wait for email to be loaded from AsyncStorage
        const email = await AsyncStorage.getItem(AUTH_EMAIL_KEY);
        const currentEmail = email || contextUserEmail || userEmail;
        
        // Only check if email has changed
        if (currentEmail && redirectCheckedRef.current !== currentEmail) {
          const normalizedEmail = currentEmail.toLowerCase().trim();
          
          // Add a small delay to ensure email is current and not stale
          redirectTimeoutRef.current = setTimeout(() => {
            // Double-check the email is still the same before redirecting
            if (redirectCheckedRef.current !== currentEmail) {
              redirectCheckedRef.current = currentEmail;
              
              if (!isAdminEmail(currentEmail)) {
                console.log("🚫 QR Scanner: Non-admin user detected, redirecting to schedule:", normalizedEmail);
                router.replace("/schedule");
              } else {
                console.log("✅ QR Scanner: Admin user confirmed:", normalizedEmail);
              }
            }
          }, 200); // Small delay to let AsyncStorage and context sync
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
      }
    };
    
    // Only check after email is loaded
    if (userEmail || contextUserEmail) {
      checkAdminAccess();
    }
    
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [userEmail, contextUserEmail, router]);

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permissions in your device settings to use the QR scanner.",
        [{ text: "OK" }]
      );
    }
  }, [permission]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    const now = Date.now();
    
    // Prevent multiple scans using refs for synchronous checks
    if (isProcessingRef.current) {
      console.log("⚠️ Scan ignored: Already processing a scan");
      return;
    }
    
    // Check cooldown period
    const timeSinceLastScan = now - lastScanTimeRef.current;
    if (timeSinceLastScan < SCAN_COOLDOWN_MS) {
      console.log(`⚠️ Scan ignored: Cooldown active (${Math.ceil((SCAN_COOLDOWN_MS - timeSinceLastScan) / 1000)}s remaining)`);
      return;
    }
    
    // Prevent scanning the same QR code immediately
    if (data === lastScannedDataRef.current && timeSinceLastScan < SCAN_COOLDOWN_MS * 2) {
      console.log("⚠️ Scan ignored: Same QR code scanned too soon");
      return;
    }
    
    // Mark as processing immediately
    isProcessingRef.current = true;
    lastScanTimeRef.current = now;
    lastScannedDataRef.current = data;
    setScanned(true);
    
    try {
      // Try to parse as JSON (since QR codes from the app contain JSON)
      const parsedData = JSON.parse(data);
      console.log("Scanned QR Code:", parsedData);
      
      const scannedName = parsedData.name || 'Unknown';
      const scannedEmail = parsedData.email || 'N/A';
      const scannedUserId = parsedData.userId || 'N/A';
      
      // Check if current user is admin before recording
      if (isAdminEmail(userEmail)) {
        // Record scan to Google Sheet with staffer email
        setRecording(true);
        let success = false;
        try {
          success = await recordScanToSheet(scannedName, userEmail || "");
        } finally {
          setRecording(false);
        }
        
        // Start cooldown immediately after processing
        startCooldown();
        
        if (success) {
          Alert.alert(
            "QR Code Scanned ✓",
            `Email: ${scannedEmail}\nName: ${scannedName}\nUser ID: ${scannedUserId}\n\n✅ Recorded to attendance sheet`
          );
        } else {
          Alert.alert(
            "QR Code Scanned",
            `Email: ${scannedEmail}\nName: ${scannedName}\nUser ID: ${scannedUserId}\n\n⚠️ Could not record to sheet`
          );
        }
      } else {
        // Regular scan without recording
        // Start cooldown immediately after processing
        startCooldown();
        
        Alert.alert(
          "QR Code Scanned",
          `Email: ${scannedEmail}\nName: ${scannedName}\nUser ID: ${scannedUserId}`
        );
      }
    } catch (error) {
      // If it's not JSON, just show the raw data
      console.log("Scanned QR Code (raw):", data);
      
      // Still try to record if user is admin
      if (isAdminEmail(userEmail)) {
        setRecording(true);
        let success = false;
        try {
          success = await recordScanToSheet(data, userEmail || ""); // Use raw data as name, pass staffer email
        } finally {
          setRecording(false);
        }
        
        // Start cooldown immediately after processing
        startCooldown();
        
        Alert.alert(
          success ? "QR Code Scanned ✓" : "QR Code Scanned",
          `Data: ${data}${success ? '\n\n✅ Recorded to attendance sheet' : '\n\n⚠️ Could not record to sheet'}`
        );
      } else {
        // Start cooldown immediately after processing
        startCooldown();
        
        Alert.alert(
          "QR Code Scanned",
          `Data: ${data}`
        );
      }
    }
  };

  // Start cooldown period after scan
  const startCooldown = () => {
    // Clear any existing timer
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    
    // Set cooldown timer
    cooldownTimerRef.current = setTimeout(() => {
      isProcessingRef.current = false;
      setScanned(false);
      console.log("✅ Cooldown expired, ready for next scan");
    }, SCAN_COOLDOWN_MS);
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#05688e" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.message}>Camera permission is required to scan QR codes.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR Code Scanner</Text>
      </View>

      <View style={styles.cameraContainer}>
        {recording && (
          <View style={styles.recordingIndicator}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.recordingText}>Recording to sheet...</Text>
          </View>
        )}
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned || isProcessingRef.current ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Overlay with scanning frame */}
        <View style={styles.overlay}>
          <View style={styles.frameContainer}>
            <View style={styles.scanFrame} />
          </View>
          <Text style={styles.instructions}>
            {scanned || isProcessingRef.current
              ? "Processing scan... Please wait"
              : "Position the QR code within the frame"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f7f4",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  frameContainer: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderColor: "#05688e",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructions: {
    marginTop: 40,
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#05688e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  recordingIndicator: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(5, 104, 142, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  recordingText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});

