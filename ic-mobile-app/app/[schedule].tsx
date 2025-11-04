import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { db } from "../config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import { isAdminEmail } from "@/utils/adminEmails";

const AUTH_EMAIL_KEY = "@auth_user_email";

type ICUser = {
  userId: string;
  email?: string;
  name?: string;
  attendee?: boolean;
  day1_session1?: string;
  day1_session2?: string;
  day2_session1?: string;
  day2_session2?: string;
  day3_session1?: string;
  day3_session2?: string;
};

export default function ScheduleScreen() {
  const { userEmail: contextUserEmail, loading: authLoading } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(contextUserEmail);
  const router = useRouter();
  const days = ["Saturday", "Sunday", "Monday"];
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Saturday, 1 = Sunday, 2 = Monday
  const [selectedTab, setSelectedTab] = useState<"schedule" | "qr">("schedule"); // Track active tab
  const [users, setUsers] = useState<ICUser[]>([]);
  const [parentData, setParentData] = useState<ICUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate deterministic QR code data based on user email or userId
  // This ensures the QR code stays the same for each user and doesn't change on re-render
  const qrCodeData = useMemo(() => {
    if (!parentData) return null;

    const qrPayload = {
      email: parentData.email || userEmail || "",
      name: parentData.name || "",
      userId: parentData.userId || "",
    };

    return JSON.stringify(qrPayload);
  }, [parentData?.email, parentData?.name, parentData?.userId, userEmail]);

  // Reload email from AsyncStorage when screen comes into focus
  // This ensures we get the latest email after signing in
  useFocusEffect(
    React.useCallback(() => {
      const loadEmail = async () => {
        try {
          const email = await AsyncStorage.getItem(AUTH_EMAIL_KEY);
          console.log(
            "📧 Schedule: Loaded email from AsyncStorage on focus:",
            email
          );
          if (email) {
            setUserEmail(email);
          } else {
            setUserEmail(null);
          }
        } catch (error) {
          console.error("Error loading email:", error);
        }
      };
      loadEmail();
    }, [])
  );

  // Also sync with context email
  useEffect(() => {
    if (contextUserEmail !== userEmail) {
      console.log("📧 Schedule: Syncing email from context:", contextUserEmail);
      setUserEmail(contextUserEmail);
    }
  }, [contextUserEmail]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userEmail) {
      router.replace("/");
    }
  }, [authLoading, userEmail, router]);

  // Redirect to QR scanner if email is admin
  // Use a ref to prevent multiple redirects and track the last checked email
  // Only redirect if we're sure the email is current (not stale from AsyncStorage)
  const redirectCheckedRef = React.useRef<string | null>(null);
  const redirectTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // Clear any pending redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    
    if (userEmail && redirectCheckedRef.current !== userEmail) {
      const normalizedEmail = userEmail.toLowerCase().trim();
      
      // Add a small delay to ensure AsyncStorage has been updated and context is synced
      // This prevents redirects based on stale data
      redirectTimeoutRef.current = setTimeout(() => {
        // Double-check the email is still the same before redirecting
        if (redirectCheckedRef.current !== userEmail) {
          redirectCheckedRef.current = userEmail;
          
          if (isAdminEmail(userEmail)) {
            console.log("📧 Schedule: Redirecting to QR scanner for:", userEmail);
            router.replace("/qr-scanner");
          } else {
            console.log("📧 Schedule: User is NOT admin, staying on schedule:", normalizedEmail);
          }
        }
      }, 200); // Small delay to let AsyncStorage and context sync
    }
    
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [userEmail, router]);

  // Fetch ic-users collection from Firestore
  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      console.log("📧 Schedule: No userEmail, skipping fetch");
      return;
    }

    console.log("📧 Schedule: Fetching data for email:", userEmail);

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersCollection = collection(db, "ic-users");
        const usersSnapshot = await getDocs(usersCollection);

        // Tell TS that doc.data() has the fields of ICUser (except userId which we add)
        const usersList: ICUser[] = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          ...(doc.data() as Omit<ICUser, "userId">),
        }));

        setUsers(usersList);
        console.log("📧 Schedule: Fetched users:", usersList.length);

        // Find user by authenticated email - make sure we're matching correctly
        const currentUser = usersList.find(
          (user) => user.email?.toLowerCase() === userEmail.toLowerCase()
        );

        console.log("📧 Schedule: Searching for email:", userEmail);
        console.log(
          "📧 Schedule: Found user:",
          currentUser ? currentUser.email : "NOT FOUND"
        );

        if (currentUser) {
          setParentData(currentUser);
          console.log("✅ Schedule: Set parentData for:", currentUser.email);
          console.log("✅ Schedule: User data:", currentUser);
        } else {
          console.log(
            "❌ Schedule: No matching user found for email:",
            userEmail
          );
          console.log(
            "📧 Schedule: Available emails:",
            usersList.map((u) => u.email)
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userEmail]);

  // Show loading or redirect if not authenticated
  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#05688e" />
      </View>
    );
  }

  if (!userEmail) {
    return null; // Will redirect to login
  }

  return (
    <View style={styles.container}>
      {/* Header + disable header at the top */}
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>
        {parentData?.name ? `Hello, ${parentData.name}!` : "Hello!"}
      </Text>

      {/* Top tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "schedule" && styles.activeTab]}
          onPress={() => setSelectedTab("schedule")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "schedule" && styles.activeTabText,
            ]}
          >
            Schedule
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "qr" && styles.activeTab]}
          onPress={() => setSelectedTab("qr")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "qr" && styles.activeTabText,
            ]}
          >
            Your QR Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Show QR Code Card when QR tab is selected */}
      {selectedTab === "qr" && parentData && qrCodeData && (
        <ScrollView style={{ marginTop: 10 }}>
          <View style={styles.qrCodeCard}>
            <Text style={styles.qrCodeTitle}>Scan to Check-In</Text>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={qrCodeData}
                size={200}
                color="#111827"
                backgroundColor="#FFFFFF"
                logo={undefined}
                logoSize={0}
                logoBackgroundColor="transparent"
                logoMargin={0}
                logoBorderRadius={0}
              />
            </View>
          </View>
        </ScrollView>
      )}

      {/* Show Schedule content when Schedule tab is selected */}
      {selectedTab === "schedule" && (
        <>
          {/* Day selector */}
          <View style={styles.daysContainer}>
            {days.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedDayIndex(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayText,
                    idx === selectedDayIndex && styles.activeDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Schedule sessions */}
          <ScrollView style={{ marginTop: 10 }}>
            {/* Render sessions based on selected day */}
            {(() => {
              // Saturday has a full hardcoded schedule
              if (selectedDayIndex === 0) {
                const session1 = parentData?.["day1_session1" as keyof ICUser] as string | undefined;
                const session2 = parentData?.["day1_session2" as keyof ICUser] as string | undefined;

                return (
                  <>
                    {/* Registration */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>11:00 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>11:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Registration</Text>
                      </View>
                    </View>

                    {/* Small Group Meetings */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>11:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>12:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Small Group Meetings</Text>
                      </View>
                    </View>

                    {/* Business Today Opening Remarks */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>12:00 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>12:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Business Today Opening Remarks</Text>
                      </View>
                    </View>

                    {/* Keynote 1 */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>12:15 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>1:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Keynote 1: Duncan Niederauer</Text>
                        <Text style={[styles.sessionLocation, { color: "black" }]}>Former CEO of NYSE Euronext</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>1:00 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>1:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Lunch / Coffee Break */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>1:15 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>2:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Lunch / Coffee Break</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>2:15 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>2:30 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Keynote 2 */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>2:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>3:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Keynote 2: Sruta Vootukuru</Text>
                        <Text style={[styles.sessionLocation, { color: "black" }]}>Chief Digital and Carrier Officer at Liberty Latin America, Founding Executive of Sling TV</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>3:15 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>3:30 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Executive Seminar 1 - Dynamic from Firestore */}
                    {session1 && (
                      <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                        <View style={styles.timeContainer}>
                          <Text style={[styles.timeText, { color: "#000000" }]}>3:45 pm</Text>
                          <Text style={[styles.timeText, { color: "black" }]}>4:30 pm</Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={[styles.sessionTitle, { color: "black" }]}>Executive Seminar 1</Text>
                          <Text style={[styles.sessionLocation, { color: "black" }]}>{session1}</Text>
                        </View>
                      </View>
                    )}

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>4:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>4:45 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Executive Seminar 2 - Dynamic from Firestore */}
                    {session2 && (
                      <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                        <View style={styles.timeContainer}>
                          <Text style={[styles.timeText, { color: "#000000" }]}>4:45 pm</Text>
                          <Text style={[styles.timeText, { color: "black" }]}>5:30 pm</Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={[styles.sessionTitle, { color: "black" }]}>Executive Seminar 2</Text>
                          <Text style={[styles.sessionLocation, { color: "black" }]}>{session2}</Text>
                        </View>
                      </View>
                    )}

                    {/* Dinner */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>5:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>7:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Dinner</Text>
                      </View>
                    </View>

                    {/* Explore NYC */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>7:00 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>10:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Explore NYC</Text>
                      </View>
                    </View>
                  </>
                );
              }

              // Sunday has a full hardcoded schedule
              if (selectedDayIndex === 1) {
                const session1 = parentData?.["day2_session1" as keyof ICUser] as string | undefined;
                const session2 = parentData?.["day2_session2" as keyof ICUser] as string | undefined;

                return (
                  <>
                    {/* Breakfast / Walk to Westin */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>8:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>9:15 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Breakfast / Walk to Westin</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>9:15 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>9:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Keynote 3 */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>9:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>10:15 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Keynote 3: Pallavi Gogoi</Text>
                        <Text style={[styles.sessionLocation, { color: "black" }]}>Chief Business Editor at National Public Radio</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>10:15 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>10:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Executive Seminar 1 - Dynamic from Firestore */}
                    {session1 && (
                      <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                        <View style={styles.timeContainer}>
                          <Text style={[styles.timeText, { color: "#000000" }]}>10:30 am</Text>
                          <Text style={[styles.timeText, { color: "black" }]}>11:15 am</Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={[styles.sessionTitle, { color: "black" }]}>Executive Seminar 1</Text>
                          <Text style={[styles.sessionLocation, { color: "black" }]}>{session1}</Text>
                        </View>
                      </View>
                    )}

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>11:15 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>11:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Keynote 4 */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>11:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>12:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Keynote 4: Daryl Kenningham</Text>
                        <Text style={[styles.sessionLocation, { color: "black" }]}>CEO of Group 1 Automotive</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>12:15 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>12:30 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Lunch / Networking */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>12:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>1:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Lunch / Networking</Text>
                      </View>
                    </View>

                    {/* Impact Challenge */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>1:15 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>2:45 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Impact Challenge</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>2:45 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>3:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Executive Seminar 2 - Dynamic from Firestore */}
                    {session2 && (
                      <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                        <View style={styles.timeContainer}>
                          <Text style={[styles.timeText, { color: "#000000" }]}>3:00 pm</Text>
                          <Text style={[styles.timeText, { color: "black" }]}>3:45 pm</Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={[styles.sessionTitle, { color: "black" }]}>Executive Seminar 2</Text>
                          <Text style={[styles.sessionLocation, { color: "black" }]}>{session2}</Text>
                        </View>
                      </View>
                    )}

                    {/* Recruitment Session / Industry Tables Activity */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>3:45 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>5:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Recruitment Session / Industry Tables Activity</Text>
                      </View>
                    </View>

                    {/* Healthcare Panel */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>5:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>6:30 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Healthcare Panel</Text>
                      </View>
                    </View>

                    {/* Dinner in NYC */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>6:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>8:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Dinner in NYC</Text>
                      </View>
                    </View>

                    {/* Attendee Activity */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>8:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>10:00 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Attendee Activity</Text>
                      </View>
                    </View>
                  </>
                );
              }

              // Monday has a full hardcoded schedule
              if (selectedDayIndex === 2) {
                const session1 = parentData?.["day3_session1" as keyof ICUser] as string | undefined;
                const session2 = parentData?.["day3_session2" as keyof ICUser] as string | undefined;

                return (
                  <>
                    {/* Breakfast / Walk to Westin */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>8:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>9:15 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Breakfast / Walk to Westin</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>9:15 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>9:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* 6G Tech Panel */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>9:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>10:15 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>6G Tech Panel</Text>
                      </View>
                    </View>

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>10:15 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>10:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Executive Seminar 1 - Dynamic from Firestore */}
                    {session1 && (
                      <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                        <View style={styles.timeContainer}>
                          <Text style={[styles.timeText, { color: "#000000" }]}>10:30 am</Text>
                          <Text style={[styles.timeText, { color: "black" }]}>11:15 am</Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={[styles.sessionTitle, { color: "black" }]}>Executive Seminar 1</Text>
                          <Text style={[styles.sessionLocation, { color: "black" }]}>{session1}</Text>
                        </View>
                      </View>
                    )}

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>11:15 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>11:30 am</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Keynote 5 */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>11:30 am</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>12:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Keynote 5: Shivani Govil</Text>
                        <Text style={[styles.sessionLocation, { color: "black" }]}>Former Senior Executive at Google, Forbes Technology Council</Text>
                      </View>
                    </View>

                    {/* Lunch in NYC / Networking */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>12:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>1:15 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Lunch in NYC / Networking</Text>
                      </View>
                    </View>

                    {/* Executive Seminar 2 - Dynamic from Firestore */}
                    {session2 && (
                      <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                        <View style={styles.timeContainer}>
                          <Text style={[styles.timeText, { color: "#000000" }]}>1:45 pm</Text>
                          <Text style={[styles.timeText, { color: "black" }]}>2:30 pm</Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={[styles.sessionTitle, { color: "black" }]}>Executive Seminar 2</Text>
                          <Text style={[styles.sessionLocation, { color: "black" }]}>{session2}</Text>
                        </View>
                      </View>
                    )}

                    {/* Transition Period */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>2:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>2:45 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Transition Period</Text>
                      </View>
                    </View>

                    {/* Student Activity */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#E5E7EB" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>2:45 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>3:30 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Student Activity</Text>
                      </View>
                    </View>

                    {/* Closing Ceremony */}
                    <View style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}>
                      <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, { color: "#000000" }]}>3:30 pm</Text>
                        <Text style={[styles.timeText, { color: "black" }]}>3:45 pm</Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={[styles.sessionTitle, { color: "black" }]}>Closing Ceremony</Text>
                      </View>
                    </View>
                  </>
                );
              }

              // Fallback for any other day
              return null;
            })()}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f7f4",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    paddingTop: 80,
  },
  topTabs: {
    flexDirection: "row",
    marginTop: 20,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#05688e",
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  daysContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  dayText: {
    marginRight: 20,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeDayText: {
    color: "#111827",
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 2,
  },
  sessionContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  highlightedSession: {
    backgroundColor: "#05688e",
  },
  timeContainer: {
    width: 70,
    justifyContent: "center",
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    color: "#111827",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827", // white for highlighted session
  },
  sessionLocation: {
    fontSize: 14,
    color: "#111827", // white for highlighted session
    marginTop: 2,
  },
  qrCodeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  qrCodeContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  qrCodeSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
});
