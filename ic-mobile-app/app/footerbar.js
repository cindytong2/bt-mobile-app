import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
// import { Svg, Path, Rect } from "react-native-svg";

export default function FooterBar({
  onPressHome = () => {},
  onPressAttendance = () => {},
  onPressMap = () => {},
  size = 28,
  backgroundColor = "#FFFFFF",
  tint = "#111827", // default dark tint
}) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity
        accessibilityLabel="Home"
        accessibilityRole="button"
        onPress={onPressHome}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"
            stroke={tint}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Attendance"
        accessibilityRole="button"
        onPress={onPressAttendance}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* card outline */}
          <Rect
            x="2.5"
            y="4"
            width="19"
            height="14"
            rx="2"
            stroke={tint}
            strokeWidth={1.4}
            fill="none"
          />
          {/* user/lines */}
          <Path
            d="M8.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
            stroke={tint}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M6 15s1.2-1.2 3.5-1.2 3.5 1.2 3.5 1.2"
            stroke={tint}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Map"
        accessibilityRole="button"
        onPress={onPressMap}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20.5 4.5l-5 2-6-2-5 2v11l5-2 6 2 5-2v-11z"
            stroke={tint}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M9.5 6.5v11"
            stroke={tint}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // fixed footer feel
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    // mild shadow (Android/iOS)
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  button: {
    padding: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
