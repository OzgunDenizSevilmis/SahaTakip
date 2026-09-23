import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';

import {
  getMyRequestSummary,
  type RequestSummary,
} from '../services/requestService';

export default function HomeScreen() {
  const [summary, setSummary] = useState<RequestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setError(null);

    try {
      const data = await getMyRequestSummary();

      setSummary(data);
    } catch (error) {
      console.error('Ana sayfa verileri alınamadı:', error);
      setError('Ana sayfa verileri yüklenemedi.');
    } finally {
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