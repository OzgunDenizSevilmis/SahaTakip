import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/Navigation';


import {
  getMyRequestSummary,
  type RequestSummary,
} from '../services/requestService';

export default function HomeScreen() {
    const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [summary, setSummary] = useState<RequestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadSummary = async () => {
    setError(null);

    try {
      const data = await getMyRequestSummary();

      setSummary(data);
    } catch (error) {
  console.error('ANA SAYFA HATASI:', error);
  console.error(
    'Hata mesajı:',
    error instanceof Error ? error.message : error,
  );
  console.error(
    'Hata stack:',
    error instanceof Error ? error.stack : 'Stack yok',
  );
}finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View>
        <Text>{error ?? 'Veriler yüklenemedi.'}</Text>
        <Button title="Tekrar Dene" onPress={() => void loadSummary()} />
      </View>
    );
  }

  return (
    <View>
      <Text>Açık Talepler: {summary.openCount}</Text>
      <Text>İşlemdeki Talepler: {summary.inProgressCount}</Text>
      <Text>Tamamlanan Talepler: {summary.completedCount}</Text>
      
      <Button
      title="Yeni Talep Oluştur"
      onPress={() => navigation.navigate('CreateRequest')}
      />

      <Text>Son Talepler</Text>

      {summary.recentRequests.length === 0 ? (
        <Text>Henüz talebiniz bulunmuyor.</Text>
      ) : (
        summary.recentRequests.map((request) => (
          <View key={request.id}>
            <Text>{request.title}</Text>
            <Text>{request.status}</Text>
          </View>
        ))
      )}
    </View>
  );
}