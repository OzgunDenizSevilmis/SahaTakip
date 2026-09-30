import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import Empty from '../components/Empty';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';
import RequestCard from '../components/RequestCard';
import RequestFilter from '../components/RequestFilter';

import { useRequestFilters } from '../hooks/useRequestFilters';
import { getCategories } from '../services/categoryService';
import { getMyRequests } from '../services/requestService';

import type { RequestListItem } from '../services/requestService';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

import type { AppStackParamList } from '../types/Navigation';

type RequestsScreenNavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

export default function RequestsScreen() {
  const navigation =
    useNavigation<RequestsScreenNavigationProp>();

  const [requests, setRequests] = useState<RequestListItem[]>(
    [],
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

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
        console.error(
          'Kategoriler yüklenemedi:',
          error,
        );
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
        console.error(
          'Talepler yüklenemedi:',
          error,
        );

        if (isMounted) {
          setErrorMessage(
            'Talepler yüklenirken bir hata oluştu.',
          );
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
      console.error(
        'Talepler yenilenemedi:',
        error,
      );

      setErrorMessage(
        'Talepler yenilenirken bir hata oluştu.',
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Loading message="Talepler yükleniyor..." />
    );
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
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={styles.itemSeparator} />
        )}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.eyebrow}>
                SAHATAKİP
              </Text>

              <Text style={styles.title}>
                Talepler
              </Text>

              <Text style={styles.subtitle}>
                Oluşturduğun talepleri buradan
                takip edebilirsin.
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={21}
                color={colors.text.secondary}
              />

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Taleplerde ara..."
                placeholderTextColor={
                  colors.text.muted
                }
                autoCapitalize="none"
                style={styles.searchInput}
              />

              {searchText.length > 0 && (
                <Pressable
                  onPress={() => setSearchText('')}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.text.muted}
                  />
                </Pressable>
              )}
            </View>

            {/* Filters */}
            <View style={styles.filterCard}>
              <View style={styles.filterHeader}>
                <View style={styles.filterTitleContainer}>
                  <View style={styles.filterIcon}>
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  <View>
                    <Text style={styles.filterTitle}>
                      Filtreler
                    </Text>

                    <Text style={styles.filterSubtitle}>
                      Taleplerini daralt
                    </Text>
                  </View>
                </View>

                {hasActiveFilters && (
                  <Pressable
                    onPress={clearFilters}
                    hitSlop={8}
                  >
                    <Text style={styles.clearFiltersText}>
                      Temizle
                    </Text>
                  </Pressable>
                )}
              </View>

              <RequestFilter
                statusValue={statusFilter}
                categoryValue={categoryFilter}
                categories={categories}
                onStatusChange={setStatusFilter}
                onCategoryChange={setCategoryFilter}
              />
            </View>

            {/* Result count */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                Taleplerim
              </Text>

              <Text style={styles.resultCount}>
                {filteredRequests.length} talep
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Empty
              message={
                hasActiveFilters
                  ? 'Filtrelere uygun talep bulunamadı.'
                  : 'Henüz oluşturduğunuz bir talep bulunmuyor.'
              }
            />

            {hasActiveFilters && (
              <Pressable
                onPress={clearFilters}
                style={styles.emptyClearButton}
              >
                <Text style={styles.emptyClearText}>
                  Filtreleri temizle
                </Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <RequestCard
            title={item.title}
            description={item.description}
            categoryName={item.categoryName}
            priority={item.priority}
            status={item.status}
            onPress={() => {
              navigation.navigate(
                'RequestDetail',
                {
                  requestId: item.id,
                },
              );
            }}
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

  header: {
    marginBottom: spacing.xl,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  title: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  searchContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },

  filterCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  filterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },

  filterTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },

  filterSubtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },

  clearFiltersText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  resultTitle: {
    ...typography.heading,
    color: colors.text.primary,
  },

  resultCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  itemSeparator: {
    height: spacing.sm,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },

  emptyClearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },

  emptyClearText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});