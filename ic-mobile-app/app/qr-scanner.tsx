import React, { useState, useEffect } from "react";
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

const AUTH_EMAIL_KEY = '@auth_user_email';

export default function QRScannerScreen() {
  const { userEmail: contextUserEmail } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(contextUserEmail);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [recording, setRecording] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permissions in your device settings to use the QR scanner.",
        [{ text: "OK" }]
      );
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    
    try {
      // Try to parse as JSON (since QR codes from the app contain JSON)
      const parsedData = JSON.parse(data);
      console.log("Scanned QR Code:", parsedData);
      
      const scannedName = parsedData.name || 'Unknown';
      const scannedEmail = parsedData.email || 'N/A';
      const scannedUserId = parsedData.userId || 'N/A';
      
      // Check if current user is businesstoday@gmail.com before recording
      const currentUserEmail = userEmail?.toLowerCase();
      if (currentUserEmail === 'businesstoday@gmail.com') {
        // Record scan to Google Sheet
        setRecording(true);
        const success = await recordScanToSheet(scannedName);
        setRecording(false);
        
        if (success) {
          Alert.alert(
            "QR Code Scanned ✓",
            `Email: ${scannedEmail}\nName: ${scannedName}\nUser ID: ${scannedUserId}\n\n✅ Recorded to attendance sheet`,
            [
              {
                text: "Scan Again",
                onPress: () => setScanned(false),
              },
              {
                text: "OK",
                onPress: () => setScanned(false),
              },
            ]
          );
        } else {
          Alert.alert(
            "QR Code Scanned",
            `Email: ${scannedEmail}\nName: ${scannedName}\nUser ID: ${scannedUserId}\n\n⚠️ Could not record to sheet`,
            [
              {
                text: "Scan Again",
                onPress: () => setScanned(false),
              },
              {
                text: "OK",
                onPress: () => setScanned(false),
              },
            ]
          );
        }
      } else {
        // Regular scan without recording
        Alert.alert(
          "QR Code Scanned",
          `Email: ${scannedEmail}\nName: ${scannedName}\nUser ID: ${scannedUserId}`,
          [
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
            {
              text: "OK",
              onPress: () => setScanned(false),
            },
          ]
        );
      }
    } catch (error) {
      // If it's not JSON, just show the raw data
      console.log("Scanned QR Code (raw):", data);
      
      // Still try to record if user is businesstoday@gmail.com
      const currentUserEmail = userEmail?.toLowerCase();
      if (currentUserEmail === 'businesstoday@gmail.com') {
        setRecording(true);
        const success = await recordScanToSheet(data); // Use raw data as name
        setRecording(false);
        
        Alert.alert(
          success ? "QR Code Scanned ✓" : "QR Code Scanned",
          `Data: ${data}${success ? '\n\n✅ Recorded to attendance sheet' : '\n\n⚠️ Could not record to sheet'}`,
          [
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
            {
              text: "OK",
              onPress: () => setScanned(false),
            },
          ]
        );
      } else {
        Alert.alert(
          "QR Code Scanned",
          `Data: ${data}`,
          [
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
            {
              text: "OK",
              onPress: () => setScanned(false),
            },
          ]
        );
      }
    }
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
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
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
            Position the QR code within the frame
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
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#05688e",
    fontWeight: "500",
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

