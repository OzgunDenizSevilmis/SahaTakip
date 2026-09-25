import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import{SafeAreaView} from 'react-native-safe-area-context';

import {
  getMyRequestSummary,
  type RequestSummary,
} from '../services/requestService';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

import {
  priorityLabels,
  statusLabels,
} from '../utils/requestLabels';


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
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error ?? 'Veriler yüklenemedi.'}
        </Text>
      </View>
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
          <Text style={styles.summaryValue}>{summary.openCount}</Text>
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
        
        </View>
      </View>

      <Text style={styles.sectionTitle}>Son Talepler</Text>

      {summary.recentRequests.length === 0 ? (
        <Text style={styles.emptyText}>
          Henüz talebiniz bulunmuyor.
        </Text>
      ) : (
       summary.recentRequests.map((request) => (
  <View key={request.id} style={styles.requestCard}>
    <Text style={styles.requestTitle} numberOfLines={1}>
      {request.title}
    </Text>

    <View style={styles.requestMeta}>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: colors.status[request.status],
          },
        ]}
      >
        <Text style={styles.badgeText}>
          {statusLabels[request.status]}
        </Text>
      </View>

      <View style={styles.priorityBadge}>
        <Text style={styles.badgeText}>
          {priorityLabels[request.priority]}
        </Text>
      </View>
    </View>
  </View>
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

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  requestCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  requestTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  requestMeta: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
},

statusBadge: {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
},

priorityBadge: {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
},

badgeText: {
  ...typography.small,
  color: colors.text.primary,
},

  requestStatus: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },

  loadingText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },

  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});
