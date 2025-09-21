import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScheduleScreen from './[schedule]';   // adjust path to your file

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}