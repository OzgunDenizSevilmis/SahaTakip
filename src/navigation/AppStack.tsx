import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import MainTab from './MainTab';
import type { AppStackParamList } from '../types/Navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTab}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RequestDetail"
        component={RequestDetailScreen}
        options={{
          title: 'Talep Detayı',
        }}
      />
    </Stack.Navigator>
  );
}