import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { AuthStackParamList } from '../types/Navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
  name="Login"
  component={LoginScreen}
  options={{
    headerShown: false,
  }}
/>

      <Stack.Screen name="SignUp" component={SignUpScreen}
      options={{
        headerShown: false,
      }} />

      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
      options={{
        headerShown: false,
      }} />
    </Stack.Navigator>
  );
}
