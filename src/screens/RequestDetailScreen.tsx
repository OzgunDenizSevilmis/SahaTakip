import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import Empty from '../components/Empty';
import ErrorState from '../components/ErrorState';
import Loading from '../components/Loading';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { getRequestById } from '../services/requestService';
import type { RequestListItem } from '../services/requestService';
import type { AppStackParamList } from '../types/Navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RequestDetailScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'RequestDetail'
>;

export default function RequestDetailScreen() {
  const route = useRoute<RequestDetailScreenProps['route']>();

  const { requestId } = route.params;

  const [request, setRequest] =
    useState<RequestListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

const loadRequest = useCallback(async () => {
  setIsLoading(true);
  setErrorMessage(null);

  try {
    const data = await getRequestById(requestId);
    setRequest(data);
  } catch (error) {
    console.error('Talep detayı yüklenemedi:', error);

    setErrorMessage(
      'Talep detayları yüklenirken bir hata oluştu.',
    );
  } finally {
    setIsLoading(false);
  }
}, [requestId]);

useEffect(() => {
  const timeoutId = setTimeout(() => {
    void loadRequest();
  }, 0);

  return () => clearTimeout(timeoutId);
}, [loadRequest]);

  if (isLoading) {
    return <Loading message="Talep detayı yükleniyor..." />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => {
          void loadRequest();
        }}
      />
    );
  }

  if (!request) {
    return <Empty message="Talep bilgileri bulunamadı." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>{request.title}</Text>

          <View style={styles.badges}>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Açıklama</Text>

          <Text style={styles.description}>
            {request.description}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Talep Bilgileri
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kategori</Text>

            <Text style={styles.infoValue}>
              {request.categoryName}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Oluşturulma</Text>

            <Text style={styles.infoValue}>
              {new Date(request.createdAt).toLocaleString('tr-TR')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Son Güncelleme</Text>

            <Text style={styles.infoValue}>
              {new Date(request.updatedAt).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {request.imageUrl && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Görsel</Text>

            <Image
              source={{ uri: request.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
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

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  title: {
    ...typography.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  infoRow: {
    gap: spacing.xs,
  },

  infoLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },

  infoValue: {
    ...typography.body,
    color: colors.text.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
});
