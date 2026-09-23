import { Button, Text, View } from 'react-native';

import { useAuth } from '../store/AuthContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Çıkış başarısız:', error);
    }
  };

  return (
    <View>
      <Text>Profile Screen</Text>

      <Button title="Çıkış Yap" onPress={handleSignOut} />
    </View>
  );
}