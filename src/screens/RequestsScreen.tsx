import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput ,View,Button, } from 'react-native';
import {
  priorityColors,
  priorityLabels,
  statusColors,
  statusLabels,
} from '../utils/requestLabels';
import { getMyRequests } from '../services/requestService';
import type { RequestListItem } from '../services/requestService';
import { useRequestFilters } from '../hooks/useRequestFilters';
import RequestFilter from '../components/RequestFilter';
import {getCategories} from '../services/categoryService';


export default function RequestsScreen() {
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<
  { id: string; name: string }[]
 >([]);

  const {
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  filteredRequests,
  clearFilters,
  } = useRequestFilters(requests);

  const hasActiveFilters = 
  searchText.trim().length > 0 ||
  statusFilter !== null ||
  categoryFilter !== null;


  useEffect(() => {
  let isMounted = true;

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      if (isMounted) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  };

  const loadInitialRequests = async () => {
    try {
      const data = await getMyRequests();

      if (isMounted) {
        setRequests(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Talepler yüklenemedi:', error);

      if (isMounted) {
        setErrorMessage('Talepler yüklenirken bir hata oluştu.');
        setIsLoading(false);
      }
    }
  };

  void loadInitialRequests();
  void loadCategories();


  return () => {
    isMounted = false;
  };
}, []);

const handleRefresh = async () => {
  try {
    setIsRefreshing(true);
    setErrorMessage(null);

    const data = await getMyRequests();
    setRequests(data);
  } catch (error) {
    console.error('Talepler yenilenemedi:', error);
    setErrorMessage('Talepler yenilenirken bir hata oluştu.');
  } finally {
    setIsRefreshing(false);
  }
};

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Talepler yükleniyor...</Text>
      </View>
    );
  }

if (errorMessage) {
  return (
    <View>
      <Text>{errorMessage}</Text>
      <Button title="Tekrar Dene" onPress={handleRefresh} />
    </View>
  );
}

  return (
  <FlatList
    data={filteredRequests}
    ListHeaderComponent={
      <View>
      <TextInput
      value={searchText}
      onChangeText={setSearchText}
      placeholder="Taleplerde ara..."
      autoCapitalize="none"
      style={{
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        backgroundColor: '#ffffff',
      }}
      
    />
    <RequestFilter
      statusValue={statusFilter}
      categoryValue={categoryFilter}
      categories={categories}
      onStatusChange={setStatusFilter}
      onCategoryChange={setCategoryFilter}
        />
        <Button title="Filtreleri Temizle" onPress={clearFilters} />
       </View>
  }
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ padding: 16 }}
    refreshing={isRefreshing}
    onRefresh={handleRefresh}
    ListEmptyComponent={
  <View>
    <Text>{hasActiveFilters 
  ? 'Filtrelere uygun talep bulunamadı.' : 'Henüz oluşturduğunuz bir talep bulunmuyor.'}</Text>
  </View>
}
    renderItem={({ item }) => (
  <View
    style={{
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5e7eb',
    }}
  >
    <Text
      style={{
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
      }}
    >
      {item.title}
    </Text>

    <Text
      style={{
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
      }}
    >
      {item.description}
    </Text>

    <Text style={{ marginBottom: 4 }}>
      Kategori: {item.categoryName}
    </Text>

 <View style={{ flexDirection: 'row', marginTop: 4 }}>
  <View
    style={{
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    backgroundColor: priorityColors[item.priority],
      marginRight: 8,
    }}
  >
    <Text>
      Öncelik: {priorityLabels[item.priority]}
    </Text>
  </View>

  <View
    style={{
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: statusColors[item.status],
    }}
  >
    <Text>
      {statusLabels[item.status]}
    </Text>
  </View>
</View>
  </View>
)}
  />
);
}