import React, { useState, useEffect } from "react";
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

const AUTH_EMAIL_KEY = '@auth_user_email';

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
  const [sessions, setSessions] = useState([
    {
      start: "1:30 pm",
      end: "2:30 pm",
      title: "Session 1",
      location: "Firestone Library",
      highlighted: true,
    },
    {
      start: "2:30 pm",
      end: "3:30 pm",
      title: "Session 2",
      location: "Yeh College",
    },
    {
      start: "3:30 pm",
      end: "4:30 pm",
      title: "Session 3",
      location: "RoMa Dining Hall",
    },
    {
      start: "4:30 pm",
      end: "5:30 pm",
      title: "Session 4",
      location: "Firestone Library",
    },
  ]);
  const [users, setUsers] = useState<ICUser[]>([]);
  const [parentData, setParentData] = useState<ICUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Reload email from AsyncStorage when screen comes into focus
  // This ensures we get the latest email after signing in
  useFocusEffect(
    React.useCallback(() => {
      const loadEmail = async () => {
        try {
          const email = await AsyncStorage.getItem(AUTH_EMAIL_KEY);
          console.log('📧 Schedule: Loaded email from AsyncStorage on focus:', email);
          if (email) {
            setUserEmail(email);
          } else {
            setUserEmail(null);
          }
        } catch (error) {
          console.error('Error loading email:', error);
        }
      };
      loadEmail();
    }, [])
  );

  // Also sync with context email
  useEffect(() => {
    if (contextUserEmail !== userEmail) {
      console.log('📧 Schedule: Syncing email from context:', contextUserEmail);
      setUserEmail(contextUserEmail);
    }
  }, [contextUserEmail]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userEmail) {
      router.replace('/');
    }
  }, [authLoading, userEmail, router]);

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
        console.log("📧 Schedule: Found user:", currentUser ? currentUser.email : 'NOT FOUND');

        if (currentUser) {
          setParentData(currentUser);
          console.log("✅ Schedule: Set parentData for:", currentUser.email);
          console.log("✅ Schedule: User data:", currentUser);
        } else {
          console.log("❌ Schedule: No matching user found for email:", userEmail);
          console.log("📧 Schedule: Available emails:", usersList.map(u => u.email));
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
      <Text style={styles.header}>Your Schedule</Text>

      {/* Top tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Schedule</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Emergency</Text>
        </TouchableOpacity> */}
      </View>

      {/* Day selector */}
      <View style={styles.daysContainer}>
        {days.map((day, idx) => (
          <Text
            key={idx}
            style={[styles.dayText, idx === 0 && styles.activeDayText]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Schedule sessions */}
      <ScrollView style={{ marginTop: 10 }}>
        {/* <Text>{JSON.stringify(parentData, null, 2)}</Text> */}
        {/* Day 1 Sessions */}
        {parentData?.day1_session1 && (
          <View
            style={[styles.sessionContainer, { backgroundColor: "#05688e" }]}
          >
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: "#ffffff" }]}>
                1:30 pm
              </Text>
              <Text style={[styles.timeText, { color: "white" }]}>2:30 pm</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.sessionTitle, { color: "white" }]}>
                Session 1
              </Text>
              <Text style={[styles.sessionLocation, { color: "white" }]}>
                {parentData?.day1_session1}
              </Text>
            </View>
          </View>
        )}
        {parentData?.day1_session2 && (
          <View
            style={[styles.sessionContainer, { backgroundColor: "#f3f4f6" }]}
          >
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: "#000000" }]}>
                2:30 pm
              </Text>
              <Text style={[styles.timeText, { color: "black" }]}>3:30 pm</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.sessionTitle, { color: "black" }]}>
                Session 2
              </Text>
              <Text style={[styles.sessionLocation, { color: "black" }]}>
                {parentData?.day1_session2}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
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
});
