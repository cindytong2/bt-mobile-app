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
import { Stack } from "expo-router";
import { db } from "../config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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

  // Fetch ic-users collection from Firestore
  // Fetch ic-users collection from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "ic-users");
        const usersSnapshot = await getDocs(usersCollection);

        // Tell TS that doc.data() has the fields of ICUser (except userId which we add)
        const usersList: ICUser[] = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          ...(doc.data() as Omit<ICUser, "userId">),
        }));

        setUsers(usersList);
        console.log("Fetched users:", usersList);

        // Replace hardcoded email later with authenticated user's email
        const currentUser = usersList.find(
          (user) => user.email === "lp4566@princeton.edu"
        );

        if (currentUser) {
          setParentData(currentUser);
          console.log("Set parentData:", currentUser);
        } else {
          console.log("No matching user found for email");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

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
                {users[0].day1_session1}
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
                {users[0].day1_session2}
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
