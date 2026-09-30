import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Empty from '../components/Empty';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';
import RequestCard from '../components/RequestCard';

import {
  getMyRequestSummary,
  type RequestSummary,
} from '../services/requestService';

import type { MainTabParamList } from '../types/Navigation';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type HomeNavigationProp =
  BottomTabNavigationProp<MainTabParamList>;

export default function HomeScreen() {
  const navigation =
    useNavigation<HomeNavigationProp>();

  const [summary, setSummary] =
    useState<RequestSummary | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyRequestSummary();

      setSummary(data);
    } catch (error) {
      console.error(
        'Ana sayfa verileri yüklenemedi:',
        error instanceof Error
          ? error.message
          : error,
      );

      setError(
        'Ana sayfa verileri yüklenemedi.',
      );
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
      <Loading message="Ana sayfa yükleniyor..." />
    );
  }

  if (error || !summary) {
    return (
      <ErrorState
        message={
          error ?? 'Veriler yüklenemedi.'
        }
        onRetry={() => {
          void loadSummary();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              SAHATAKİP
            </Text>

            <Text style={styles.title}>
              Hoş geldin 👋
            </Text>

            <Text style={styles.subtitle}>
              Taleplerini buradan takip edebilir,
              yeni bir talep oluşturabilirsin.
            </Text>
          </View>
        </View>

        {/* Primary Action */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryAction,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            navigation.navigate(
              'CreateRequest',
            );
          }}
        >
          <View style={styles.primaryActionIcon}>
            <Ionicons
              name="add"
              size={24}
              color={colors.text.inverse}
            />
          </View>

          <View style={styles.primaryActionText}>
            <Text style={styles.primaryActionTitle}>
              Yeni Talep Oluştur
            </Text>

            <Text style={styles.primaryActionSubtitle}>
              Karşılaştığın problemi bildir
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.text.inverse}
          />
        </Pressable>

        {/* Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Talep Özeti
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryValue}>
              {summary.openCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Açık
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryValue}>
              {summary.inProgressCount}
            </Text>

            <Text style={styles.summaryLabel}>
              İşlemde
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryValue}>
              {summary.completedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Tamamlanan
            </Text>
          </View>
        </View>

        {/* Recent Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Son Talepler
          </Text>

          {summary.recentRequests.length > 0 && (
            <Pressable
              onPress={() => {
                navigation.navigate(
                  'Requests',
                );
              }}
              hitSlop={8}
            >
              <Text style={styles.seeAll}>
                Tümünü Gör
              </Text>
            </Pressable>
          )}
        </View>

        {summary.recentRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Empty message="Henüz talebiniz bulunmuyor." />

            <Pressable
              style={({ pressed }) => [
                styles.emptyAction,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                navigation.navigate(
                  'CreateRequest',
                );
              }}
            >
              <Ionicons
                name="add"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.emptyActionText}>
                İlk talebini oluştur
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            {summary.recentRequests.map(
              (request) => (
                <RequestCard
                  key={request.id}
                  title={request.title}
                  status={request.status}
                  priority={request.priority}
                />
              ),
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    marginBottom: spacing.xl,
  },

  headerText: {
    gap: spacing.xs,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  title: {
    ...typography.title,
    color: colors.text.primary,
  },

  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  primaryAction: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xxl,
  },

  primaryActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginRight: spacing.md,
  },

  primaryActionText: {
    flex: 1,
  },

  primaryActionTitle: {
    ...typography.body,
    color: colors.text.inverse,
    fontWeight: '700',
    marginBottom: 2,
  },

  primaryActionSubtitle: {
    ...typography.caption,
    color: colors.text.inverse,
    opacity: 0.85,
  },

  pressed: {
    opacity: 0.82,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.heading,
    color: colors.text.primary,
  },

  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },

  summaryCard: {
    flex: 1,
    minHeight: 126,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },

  summaryValue: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 2,
  },

  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  requestsContainer: {
    gap: spacing.sm,
  },

  emptyContainer: {
    alignItems: 'center',
  },

  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  emptyActionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});