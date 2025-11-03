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

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permissions in your device settings to use the QR scanner.",
        [{ text: "OK" }]
      );
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    
    try {
      // Try to parse as JSON (since QR codes from the app contain JSON)
      const parsedData = JSON.parse(data);
      console.log("Scanned QR Code:", parsedData);
      
      Alert.alert(
        "QR Code Scanned",
        `Email: ${parsedData.email || 'N/A'}\nName: ${parsedData.name || 'N/A'}\nUser ID: ${parsedData.userId || 'N/A'}`,
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
    } catch (error) {
      // If it's not JSON, just show the raw data
      console.log("Scanned QR Code (raw):", data);
      
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
});

