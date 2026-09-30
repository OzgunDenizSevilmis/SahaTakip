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

import Button from '../components/Button';

import TextInput from '../components/TextInput';

import Empty from '../components/Empty';

import ErrorState from '../components/ErrorState';

import Loading from '../components/Loading';

import PriorityBadge from '../components/PriorityBadge';

import StatusBadge from '../components/StatusBadge';

import {
  assignRequest,
  changeRequestStatus,
  getRequestById,
  getRequestStatusHistory,
} from '../services/requestService';

import {
  getCurrentUserRole,
  getStaffUsers,
} from '../services/profileService';

import type { RequestListItem } from '../services/requestService';

import type { AppStackParamList } from '../types/Navigation';

import type {
  RequestStatus,
  StatusHistory,
  User,
  UserRole,
} from '../types/models';

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

  const [userRole, setUserRole] =
    useState<UserRole | null>(null);

  const [staffUsers, setStaffUsers] = useState<User[]>([]);

  const [isAssigning, setIsAssigning] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [statusHistory, setStatusHistory] =
    useState<StatusHistory[]>([]);

  const [isChangingStatus, setIsChangingStatus] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [statusNote, setStatusNote] = useState('');

  const loadRequest = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getRequestById(requestId);

      setRequest(data);
    } catch (error) {
      console.error(
        'Talep detayı yüklenemedi:',
        error,
      );

      setErrorMessage(
        'Talep detayları yüklenirken bir hata oluştu.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  const loadStatusHistory = useCallback(async () => {
    try {
      const history =
        await getRequestStatusHistory(requestId);

      setStatusHistory(history);
    } catch (error) {
      console.error(
        'Durum geçmişi yüklenemedi:',
        error,
      );
    }
  }, [requestId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadRequest();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadRequest]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadStatusHistory();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadStatusHistory]);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await getCurrentUserRole();

        setUserRole(role);
      } catch (error) {
        console.error(
          'Kullanıcı rolü yüklenemedi:',
          error,
        );
      }
    };

    void loadUserRole();
  }, []);

 useEffect(() => {
  if (!userRole) {
    return;
  }

  const timeoutId = setTimeout(() => {
    const loadStaffUsers = async () => {
      try {
        const staff = await getStaffUsers();
        setStaffUsers(staff);
      } catch (error) {
        console.error(
          'Personel listesi yüklenemedi:',
          error,
        );
      }
    };

    void loadStaffUsers();
  }, 0);

  return () => clearTimeout(timeoutId);
}, [userRole]);


  const handleStatusChange = async (
    newStatus: RequestStatus,
  ) => {
    if (!request) return;

    setIsChangingStatus(true);

    try {
      const updatedRequest = await changeRequestStatus(
        request.id,
        newStatus,
        statusNote.trim() || undefined,
      );

      setRequest((currentRequest) => {
        if (!currentRequest) return currentRequest;

        return {
          ...currentRequest,
          ...updatedRequest,
        };
      });

      setStatusNote('');

      await loadStatusHistory();
    } catch (error) {
      console.error(
        'Talep durumu değiştirilemedi:',
        error,
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleAssignStaff = async (
    staffId: string,
  ) => {
    if (!request) return;

    try {
      setIsAssigning(true);

      const updatedRequest = await assignRequest(
        request.id,
        staffId,
      );

      setRequest((currentRequest) => {
        if (!currentRequest) return currentRequest;

        return {
          ...currentRequest,
          ...updatedRequest,
        };
      });
    } catch (error) {
      console.error(
        'Talep atanamadı:',
        error,
      );
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <Loading message="Talep detayı yükleniyor..." />
    );
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
    return (
      <Empty message="Talep bilgileri bulunamadı." />
    );
  }

  const canChangeStatus =
    userRole === 'staff' || userRole === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>
            {request.title}
          </Text>

          <View style={styles.badges}>
            <StatusBadge status={request.status} />

            <PriorityBadge
              priority={request.priority}
            />
          </View>

          {canChangeStatus && (
            <View style={styles.statusActions}>
              <Text style={styles.statusActionTitle}>
                Durumu Değiştir
              </Text>

              <TextInput
                label="Durum Notu"
                placeholder="Durum değişikliği için not ekleyin"
                value={statusNote}
                onChangeText={setStatusNote}
                multiline
              />

              <View style={styles.statusButtons}>
                <Button
                  title="Atandı"
                  onPress={() => {
                    void handleStatusChange(
                      'assigned',
                    );
                  }}
                  loading={
                    isChangingStatus &&
                    request.status !== 'assigned'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status === 'assigned'
                  }
                />

                <Button
                  title="İşlemde"
                  onPress={() => {
                    void handleStatusChange(
                      'in_progress',
                    );
                  }}
                  loading={
                    isChangingStatus &&
                    request.status !== 'in_progress'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status === 'in_progress'
                  }
                />

                <Button
                  title="Çözüldü"
                  onPress={() => {
                    void handleStatusChange(
                      'resolved',
                    );
                  }}
                  loading={
                    isChangingStatus &&
                    request.status !== 'resolved'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status === 'resolved'
                  }
                />

                <Button
                  title="İptal"
                  onPress={() => {
                    void handleStatusChange(
                      'cancelled',
                    );
                  }}
                  loading={
                    isChangingStatus &&
                    request.status !== 'cancelled'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status === 'cancelled'
                  }
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Açıklama
          </Text>

          <Text style={styles.description}>
            {request.description}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Talep Bilgileri
          </Text>

          <View>
  <Text style={styles.infoLabel}>
    Sorumlu Personel
  </Text>

  {request.assignedTo ? (
    <Text style={styles.infoValue}>
      {staffUsers.find(
        (staff) => staff.id === request.assignedTo,
      )?.fullName ?? 'Atanan personel bulunamadı.'}
    </Text>
  ) : (
    <Text style={styles.infoValue}>
      Henüz personel atanmadı.
    </Text>
  )}

  {userRole === 'admin' && (
    <View style={styles.statusButtons}>
      {staffUsers.map((staff) => (
        <Button
          key={staff.id}
          title={
            request.assignedTo === staff.id
              ? `✓ ${staff.fullName}`
              : staff.fullName
          }
          onPress={() => {
            void handleAssignStaff(staff.id);
          }}
          loading={isAssigning}
          disabled={isAssigning}
        />
      ))}
    </View>
  )}
</View>



          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Kategori
            </Text>

            <Text style={styles.infoValue}>
              {request.categoryName}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Oluşturulma
            </Text>

            <Text style={styles.infoValue}>
              {new Date(
                request.createdAt,
              ).toLocaleString('tr-TR')}
            </Text>
          </View>

          {statusHistory.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Durum Geçmişi
              </Text>

              {statusHistory.map(
                (history, index) => (
                  <View
                    key={history.id}
                    style={styles.historyItem}
                  >
                    <Text
                      style={styles.historyStatus}
                    >
                      {history.newStatus}
                    </Text>

                    <Text
                      style={styles.historyDate}
                    >
                      {new Date(
                        history.changedAt,
                      ).toLocaleString('tr-TR')}
                    </Text>

                    {history.note && (
                      <Text
                        style={styles.historyNote}
                      >
                        Not: {history.note}
                      </Text>
                    )}

                    {index <
                      statusHistory.length - 1 && (
                      <View
                        style={
                          styles.historyDivider
                        }
                      />
                    )}
                  </View>
                ),
              )}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Son Güncelleme
            </Text>

            <Text style={styles.infoValue}>
              {new Date(
                request.updatedAt,
              ).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {request.imageUrl && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Görsel
            </Text>

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

  statusActions: {
    marginTop: spacing.lg,
  },

  statusActionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  statusButtons: {
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

  historyItem: {
    paddingVertical: spacing.sm,
  },

  historyStatus: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },

  historyDate: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  historyNote: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  historyDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});