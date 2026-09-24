import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import type { AppStackParamList } from '../types/Navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Requests" component={RequestsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="CreateRequest"
        component={CreateRequestScreen}
        options={{ title: 'Yeni Talep' }}
      />
    </Stack.Navigator>
  );
}
