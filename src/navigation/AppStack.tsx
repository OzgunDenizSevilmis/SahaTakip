import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
    </Stack.Navigator>
  );
}