import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Empty from '../components/Empty';
import RequestCard from '../components/RequestCard';
import RequestFilter from '../components/RequestFilter';
import { useRequestFilters } from '../hooks/useRequestFilters';
import { getCategories } from '../services/categoryService';
import { getMyRequests } from '../services/requestService';
import type { RequestListItem } from '../services/requestService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';


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
  return <Loading message="Talepler yükleniyor..." />;
  }

if (errorMessage) {
  return (
    <ErrorState
      message={errorMessage}
      onRetry={handleRefresh}
    />
  );
}
 

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Talepler</Text>

            <Text style={styles.subtitle}>
              Oluşturduğun talepleri buradan takip edebilirsin.
            </Text>

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Taleplerde ara..."
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              style={styles.searchInput}
            />

            <RequestFilter
              statusValue={statusFilter}
              categoryValue={categoryFilter}
              categories={categories}
              onStatusChange={setStatusFilter}
              onCategoryChange={setCategoryFilter}
            />

            <Pressable
              onPress={clearFilters}
              disabled={!hasActiveFilters}
              style={[
                styles.clearFiltersButton,
                !hasActiveFilters &&
                  styles.clearFiltersButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.clearFiltersText,
                  !hasActiveFilters &&
                    styles.clearFiltersTextDisabled,
                ]}
              >
                Filtreleri Temizle
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
  <Empty
    message={
      hasActiveFilters
        ? 'Filtrelere uygun talep bulunamadı.'
        : 'Henüz oluşturduğunuz bir talep bulunmuyor.'
    }
  />
}
        renderItem={({ item }) => (
          <RequestCard
            title={item.title}
            description={item.description}
            categoryName={item.categoryName}
            priority={item.priority}
            status={item.status}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },

  clearFiltersButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },

  clearFiltersButtonDisabled: {
    backgroundColor: colors.border,
  },

  clearFiltersText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },

  clearFiltersTextDisabled: {
    color: colors.text.muted,
  },
});