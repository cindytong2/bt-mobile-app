import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { db } from '../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function ScheduleScreen() {
  const days = ['Saturday', 'Sunday', 'Monday'];
  const [sessions, setSessions] = useState([
    { start: '1:30 pm', end: '2:30 pm', title: 'Session 1', location: 'Firestone Library', highlighted: true },
    { start: '2:30 pm', end: '3:30 pm', title: 'Session 2', location: 'Yeh College' },
    { start: '3:30 pm', end: '4:30 pm', title: 'Session 3', location: 'RoMa Dining Hall' },
    { start: '4:30 pm', end: '5:30 pm', title: 'Session 4', location: 'Firestone Library' },
  ]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState<any>(null);


  // Fetch ic-users collection from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'ic-users');
        const usersSnapshot = await getDocs(usersCollection);
        
        console.log('Found documents:', usersSnapshot.docs.map(d => d.id));
        
        // Fetch data from subcollections within each document
        const usersList = await Promise.all(
          usersSnapshot.docs.map(async (doc) => {
            try {
              // First check if the parent document has data
              const parentData = doc.data();
              
              console.log(`Parent doc ${doc.id} data:`, parentData);
              console.log('this is parent data', parentData)
              console.log(parentData['day1_session1']);
              console.log(parentData['day1_session2']);
              console.log(parentData['day2_session1']);
              console.log(parentData['day2_session2']);
              console.log(parentData['day3_session1']);
              console.log(parentData['day3_session2']);
              // Try to get subcollection with the same name as the document ID
              const subcollectionRef = collection(db, 'ic-users', doc.id, doc.id);
              const subcollectionSnapshot = await getDocs(subcollectionRef);
              
              console.log(`Subcollection for ${doc.id}:`, subcollectionSnapshot.docs.length, 'docs');
              
              if (!subcollectionSnapshot.empty) {
                // Get all documents from the subcollection and log them
                subcollectionSnapshot.docs.forEach((subDoc, idx) => {
                  console.log(`  Subdoc ${idx} (${subDoc.id}):`, subDoc.data());
                });

                const userData = subcollectionSnapshot.docs[0].data();
                setParentData(parentData); // store globally
                return {
                  userId: doc.id,
                  docId: subcollectionSnapshot.docs[0].id,
                  ...userData,
                  ...parentData // optionally merge
                };
              } else {
                console.log(`No documents in subcollection for ${doc.id}`);
              }
            } catch (subError: any) {
              console.error(`Error fetching subcollection for ${doc.id}:`, subError);
              console.error('Error details:', subError?.message || 'Unknown error');
            }
            return null;
          })
        );
        
        // Filter out null values
        const filteredUsers = usersList.filter(user => user !== null);
        setUsers(filteredUsers);
        console.log('Fetched users:', filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#05688e" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading data...</Text>
      </View>
    );
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
          <Text key={idx} style={[styles.dayText, idx === 0 && styles.activeDayText]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Schedule sessions */}
      <ScrollView style={{ marginTop: 10 }}>
        <Text>{JSON.stringify(parentData, null, 2)}</Text>
        {/* Day 1 Sessions */}
            {parentData?.day1_session1 && (
              <View style={[styles.sessionContainer, { backgroundColor: '#05688e' }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: '#ffffff' }]}>1:30 pm</Text>
                  <Text style={[styles.timeText, { color: 'white' }]}>2:30 pm</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.sessionTitle, { color: 'white' }]}>Session 1</Text>
                  <Text style={[styles.sessionLocation, { color: 'white' }]}>{users[0].day1_session1}</Text>
                </View>
              </View>
            )}
            {parentData?.day1_session2 && (
              <View style={[styles.sessionContainer, { backgroundColor: '#f3f4f6' }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: '#000000' }]}>2:30 pm</Text>
                  <Text style={[styles.timeText, { color: 'black' }]}>3:30 pm</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.sessionTitle, { color: 'black' }]}>Session 2</Text>
                  <Text style={[styles.sessionLocation, { color: 'black' }]}>{users[0].day1_session2}</Text>
                </View>
              </View>
            )}
            {/* Day 2 Sessions */}
            {parentData?.day2_session1 && (
              <View style={[styles.sessionContainer, { backgroundColor: '#05688e' }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: '#ffffff' }]}>3:30 pm</Text>
                  <Text style={[styles.timeText, { color: 'white' }]}>4:30 pm</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.sessionTitle, { color: 'white' }]}>Session 3</Text>
                  <Text style={[styles.sessionLocation, { color: 'white' }]}>{parentData?.day2_session1}</Text>
                </View>
              </View>
            )}
            {parentData?.day2_session2 && (
              <View style={[styles.sessionContainer, { backgroundColor: '#f3f4f6' }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: '#000000' }]}>4:30 pm</Text>
                  <Text style={[styles.timeText, { color: 'black' }]}>5:30 pm</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.sessionTitle, { color: 'black' }]}>Session 4</Text>
                  <Text style={[styles.sessionLocation, { color: 'black' }]}>{parentData?.day2_session2}</Text>
                </View>
              </View>
            )}
            {/* Day 3 Sessions */}
            {parentData?.day3_session1 && (
              <View style={[styles.sessionContainer, { backgroundColor: '#05688e' }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: '#ffffff' }]}>5:30 pm</Text>
                  <Text style={[styles.timeText, { color: 'white' }]}>6:30 pm</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.sessionTitle, { color: 'white' }]}>Session 5</Text>
                  <Text style={[styles.sessionLocation, { color: 'white' }]}>{parentData?.day3_session1}</Text>
                </View>
              </View>
            )}
            {parentData?.day3_session2 && (
              <View style={[styles.sessionContainer, { backgroundColor: '#f3f4f6' }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: '#000000' }]}>6:30 pm</Text>
                  <Text style={[styles.timeText, { color: 'black' }]}>7:30 pm</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.sessionTitle, { color: 'black' }]}>Session 6</Text>
                  <Text style={[styles.sessionLocation, { color: 'black' }]}>{users[0].day3_session2}</Text>
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
    backgroundColor: '#f9f7f4',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    paddingTop: 80,
  },
  topTabs: {
    flexDirection: 'row',
    marginTop: 20,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#05688e',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  daysContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dayText: {
    marginRight: 20,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeDayText: {
    color: '#111827',
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
    paddingBottom: 2,
  },
  sessionContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  highlightedSession: {
    backgroundColor: '#05688e',
  },
  timeContainer: {
    width: 70,
    justifyContent: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#111827',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827', // white for highlighted session
  },
  sessionLocation: {
    fontSize: 14,
    color: '#111827', // white for highlighted session
    marginTop: 2,
  },
});
