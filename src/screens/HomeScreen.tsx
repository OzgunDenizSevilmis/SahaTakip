import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Empty from '../components/Empty';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';
import RequestCard from '../components/RequestCard';
import {
  getMyRequestSummary,
  type RequestSummary,
} from '../services/requestService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function HomeScreen() {
  const [summary, setSummary] = useState<RequestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyRequestSummary();

      setSummary(data);
    } catch (error) {
      console.error(
        'Ana sayfa verileri yüklenemedi:',
        error instanceof Error ? error.message : error,
      );

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
    return <Loading message="Ana sayfa yükleniyor..." />;
  }

  if (error || !summary) {
    return (
      <ErrorState
        message={error ?? 'Veriler yüklenemedi.'}
        onRetry={() => {
          void loadSummary();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>

      <Text style={styles.subtitle}>
        Taleplerinin durumunu buradan takip edebilirsin.
      </Text>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Açık</Text>

          <Text style={styles.summaryValue}>
            {summary.openCount}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>İşlemde</Text>

          <Text style={styles.summaryValue}>
            {summary.inProgressCount}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryLabel}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Tamamlanan
          </Text>

          <Text style={styles.summaryValue}>
            {summary.completedCount}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Son Talepler</Text>

      {summary.recentRequests.length === 0 ? (
        <Empty message="Henüz talebiniz bulunmuyor." />
      ) : (
        summary.recentRequests.map((request) => (
          <RequestCard
            key={request.id}
            title={request.title}
            status={request.status}
            priority={request.priority}
          />
        ))
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
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

  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
  },

  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  summaryValue: {
    ...typography.title,
    color: colors.primary,
  },

  sectionTitle: {
    ...typography.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
});