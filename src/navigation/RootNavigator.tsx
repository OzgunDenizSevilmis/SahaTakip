import { ActivityIndicator, View } from 'react-native';

import AppStack from './AppStack';
import AuthStack from './AuthStack';
import { useAuth } from '../store/AuthContext';

export default function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return session ? <AppStack /> : <AuthStack />;
}