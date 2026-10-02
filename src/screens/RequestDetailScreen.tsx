import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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
  getCachedRequest,
  saveCachedRequest,
} from '../services/requestCacheService';


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

type RequestDetailScreenProps =
  NativeStackScreenProps<
    AppStackParamList,
    'RequestDetail'
  >;

export default function RequestDetailScreen() {
  const route =
    useRoute<RequestDetailScreenProps['route']>();

  const { requestId } = route.params;

  const [request, setRequest] =
    useState<RequestListItem | null>(null);

  const [userRole, setUserRole] =
    useState<UserRole | null>(null);

  const [staffUsers, setStaffUsers] =
    useState<User[]>([]);

  const [isAssigning, setIsAssigning] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [statusHistory, setStatusHistory] =
    useState<StatusHistory[]>([]);

  const [isChangingStatus, setIsChangingStatus] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [statusNote, setStatusNote] =
    useState('');

const loadRequest = useCallback(async () => {
  setIsLoading(true);
  setErrorMessage(null);

  try {
    let data;

    try {
      data = await getRequestById(requestId);
    } catch (error) {
      console.error('Talep sunucudan alınamadı:', error);

      data = await getCachedRequest(requestId);

      if (!data) {
        setErrorMessage(
          'Talep detayları yüklenemedi ve kayıtlı talep bulunamadı.',
        );
        return;
      }
    }

    let assignedStaffName = data.assignedStaffName ?? null;

    if (data.assignedTo) {
      try {
        const staff = await getStaffUsers();

        assignedStaffName =
          staff.find((item) => item.id === data.assignedTo)?.fullName ??
          assignedStaffName;
      } catch (error) {
        console.error('Personel listesi alınamadı:', error);
      }
    }

    const enrichedData = {
      ...data,
      assignedStaffName,
    };

    await saveCachedRequest(enrichedData);
    setRequest(enrichedData);
  } catch (error) {
    console.error('Talep detayı yüklenemedi:', error);
    setErrorMessage('Talep detayları yüklenemedi.');
  } finally {
    setIsLoading(false);
  }
}, [requestId]);


  const loadStatusHistory =
    useCallback(async () => {
      try {
        const history =
          await getRequestStatusHistory(
            requestId,
          );

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
        const role =
          await getCurrentUserRole();

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
  const timeoutId = setTimeout(() => {
    const loadStaffUsers = async () => {
      try {
        console.log('Personel listesi yükleme fonksiyonu çalıştı.');

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
}, []);

  const handleStatusChange = async (
    newStatus: RequestStatus,
  ) => {
    if (!request) {
      return;
    }

    setIsChangingStatus(true);

    try {
      const updatedRequest =
        await changeRequestStatus(
          request.id,
          newStatus,
          statusNote.trim() || undefined,
        );

      setRequest((currentRequest) => {
        if (!currentRequest) {
          return currentRequest;
        }

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
    if (!request) {
      return;
    }

    try {
      setIsAssigning(true);

      const updatedRequest =
        await assignRequest(
          request.id,
          staffId,
        );

      setRequest((currentRequest) => {
        if (!currentRequest) {
          return currentRequest;
        }

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
    userRole === 'staff' ||
    userRole === 'admin';

  const assignedStaff = request.assignedTo
    ? staffUsers.find(
        (staff) =>
          staff.id === request.assignedTo,
      )
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>
            TALEP DETAYI
          </Text>

          <Text style={styles.title}>
            {request.title}
          </Text>

          <View style={styles.badges}>
            <StatusBadge
              status={request.status}
            />

            <PriorityBadge
              priority={request.priority}
            />
          </View>

          {/* Status Actions */}
          {canChangeStatus && (
            <View style={styles.statusActions}>
              <View
                style={styles.actionSectionHeader}
              >
                <View
                  style={styles.actionSectionIcon}
                >
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.statusActionTitle
                    }
                  >
                    Durumu Değiştir
                  </Text>

                  <Text
                    style={
                      styles.actionSectionSubtitle
                    }
                  >
                    Talebin mevcut durumunu güncelle
                  </Text>
                </View>
              </View>

              <TextInput
                label="Durum Notu"
                placeholder="İsteğe bağlı not ekleyin"
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
                    request.status !==
                      'in_progress'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status ===
                      'in_progress'
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
                    request.status !==
                      'resolved'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status ===
                      'resolved'
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
                    request.status !==
                      'cancelled'
                  }
                  disabled={
                    isChangingStatus ||
                    request.status ===
                      'cancelled'
                  }
                />
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Açıklama
              </Text>

              <Text style={styles.sectionSubtitle}>
                Talep hakkında verilen bilgiler
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            {request.description}
          </Text>
        </View>

        {/* Request Information */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Talep Bilgileri
              </Text>

              <Text style={styles.sectionSubtitle}>
                Talebin detayları
              </Text>
            </View>
          </View>

          {/* Assigned Staff */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Sorumlu Personel
              </Text>

              <Text style={styles.infoValue}>
                {assignedStaff?.fullName ??
  request.assignedStaffName ??
  (request.assignedTo
    ? 'Atanan personel bulunamadı.'
    : 'Henüz personel atanmadı.')}
    
              </Text>
            </View>
          </View>

          {/* Admin Assignment */}
          {userRole === 'admin' && (
            <View style={styles.assignmentSection}>
              <Text style={styles.assignmentTitle}>
                Personel Ata
              </Text>

              <View style={styles.assignmentButtons}>
                {staffUsers.map((staff) => (
                  <Button
                    key={staff.id}
                    title={
                      request.assignedTo ===
                      staff.id
                        ? `✓ ${staff.fullName}`
                        : staff.fullName
                    }
                    onPress={() => {
                      void handleAssignStaff(
                        staff.id,
                      );
                    }}
                    loading={isAssigning}
                    disabled={isAssigning}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Category */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="grid-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Kategori
              </Text>

              <Text style={styles.infoValue}>
                {request.categoryName}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="location-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Konum
              </Text>

              <Text style={styles.infoValue}>
                {request.latitude !== null &&
                request.longitude !== null
                  ? `${request.latitude}, ${request.longitude}`
                  : 'Konum eklenmemiş.'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Created At */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Oluşturulma
              </Text>

              <Text style={styles.infoValue}>
                {new Date(
                  request.createdAt,
                ).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Status History */}
          {statusHistory.length > 0 && (
            <>
              <View style={styles.divider} />

              <View style={styles.historyHeader}>
                <View
                  style={styles.historyIcon}
                >
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={styles.sectionTitle}
                  >
                    Durum Geçmişi
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Talebin geçmiş hareketleri
                  </Text>
                </View>
              </View>

              <View style={styles.historyContainer}>
                {statusHistory.map(
                  (history, index) => (
                    <View
                      key={history.id}
                      style={styles.historyItem}
                    >
                      <View
                        style={
                          styles.historyIndicator
                        }
                      >
                        <View
                          style={
                            styles.historyDot
                          }
                        />

                        {index <
                          statusHistory.length -
                            1 && (
                          <View
                            style={
                              styles.historyLine
                            }
                          />
                        )}
                      </View>

                      <View
                        style={
                          styles.historyContent
                        }
                      >
                        <Text
                          style={
                            styles.historyStatus
                          }
                        >
                          {history.newStatus}
                        </Text>

                        <Text
                          style={
                            styles.historyDate
                          }
                        >
                          {new Date(
                            history.changedAt,
                          ).toLocaleString(
                            'tr-TR',
                          )}
                        </Text>

                        {history.note && (
                          <Text
                            style={
                              styles.historyNote
                            }
                          >
                            {history.note}
                          </Text>
                        )}
                      </View>
                    </View>
                  ),
                )}
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Updated At */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="refresh-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
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
        </View>

        {/* Image */}
        {request.imageUrl && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Görsel
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Talebe eklenen fotoğraf
                </Text>
              </View>
            </View>

            <Image
              source={{
                uri: request.imageUrl,
              }}
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
    paddingBottom: spacing.xxxl,
  },

  /* Header */

  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  title: {
    ...typography.heading,
    color: colors.text.primary,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: spacing.md,
  },

  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  /* Sections */

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },

  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },

  sectionSubtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },

  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  /* Status */

  statusActions: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  actionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  actionSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },

  statusActionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },

  actionSectionSubtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },

  statusButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  /* Information */

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },

  infoRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: spacing.md,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: 2,
  },

  infoValue: {
    ...typography.body,
    color: colors.text.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  /* Assignment */

  assignmentSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  assignmentTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  assignmentButtons: {
    gap: spacing.sm,
  },

  /* History */

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },

  historyContainer: {
    paddingTop: spacing.xs,
  },

  historyItem: {
    flexDirection: 'row',
    minHeight: 72,
  },

  historyIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 5,
  },

  historyLine: {
    width: 1,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },

  historyContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },

  historyStatus: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
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
    lineHeight: 19,
    marginTop: spacing.xs,
  },

  /* Image */

  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
});
