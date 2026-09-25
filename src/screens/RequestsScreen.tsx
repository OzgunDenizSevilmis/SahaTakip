import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RequestFilter from '../components/RequestFilter';
import { useRequestFilters } from '../hooks/useRequestFilters';
import { getCategories } from '../services/categoryService';
import { getMyRequests } from '../services/requestService';
import type { RequestListItem } from '../services/requestService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  priorityColors,
  priorityLabels,
  statusColors,
  statusLabels,
} from '../utils/requestLabels';

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
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Talepler yükleniyor...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>

        <Pressable
          onPress={handleRefresh}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </Pressable>
      </View>
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? 'Filtrelere uygun talep bulunamadı.'
                : 'Henüz oluşturduğunuz bir talep bulunmuyor.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <Text style={styles.requestTitle}>
              {item.title}
            </Text>

            <Text
              style={styles.requestDescription}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            <Text style={styles.categoryText}>
              Kategori: {item.categoryName}
            </Text>

            <View style={styles.badgesRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      priorityColors[item.priority],
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  Öncelik: {priorityLabels[item.priority]}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: statusColors[item.status],
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {statusLabels[item.status]}
                </Text>
              </View>
            </View>
          </View>
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

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },

  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },

  retryButtonText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
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

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },

  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  requestCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  requestTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  requestDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },

  categoryText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },

  badgeText: {
    ...typography.small,
    color: colors.text.primary,
  },
});