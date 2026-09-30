import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../store/AuthContext';
import { getMyProfile } from '../services/profileService';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

import type { User } from '../types/models';

import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

const roleLabels: Record<User['role'], string> = {
  requester: 'Talep Oluşturucu',
  staff: 'Personel',
  admin: 'Yönetici',
};

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const [profile, setProfile] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInitialProfile = async () => {
      try {
        const data = await getMyProfile();

        if (isMounted) {
          setProfile(data);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error(
          'Profil yüklenemedi:',
          error,
        );

        if (isMounted) {
          setErrorMessage(
            'Profil bilgileri yüklenirken bir hata oluştu.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getMyProfile();

      setProfile(data);
    } catch (error) {
      console.error(
        'Profil tekrar yüklenemedi:',
        error,
      );

      setErrorMessage(
        'Profil bilgileri yüklenirken bir hata oluştu.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      await signOut();
    } catch (error) {
      console.error(
        'Çıkış başarısız:',
        error,
      );

      setErrorMessage(
        'Çıkış yapılırken bir hata oluştu.',
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <Loading message="Profil yükleniyor..." />
    );
  }

  if (errorMessage || !profile) {
    return (
      <ErrorState
        message={
          errorMessage ??
          'Profil bilgileri bulunamadı.'
        }
        onRetry={() => {
          void handleRetry();
        }}
      />
    );
  }

  const profileInitial = profile.fullName
    .trim()
    .charAt(0)
    .toUpperCase();

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
          <Text style={styles.eyebrow}>
            SAHATAKİP
          </Text>

          <Text style={styles.title}>
            Profil
          </Text>

          <Text style={styles.subtitle}>
            Hesap bilgilerini buradan
            görüntüleyebilirsin.
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileInitial}
              </Text>
            </View>

            <View style={styles.avatarBadge}>
              <Ionicons
                name="person"
                size={13}
                color={colors.text.inverse}
              />
            </View>
          </View>

          <Text style={styles.profileName}>
            {profile.fullName}
          </Text>

          <Text style={styles.profileEmail}>
            {profile.email}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={colors.primary}
            />

            <Text style={styles.roleBadgeText}>
              {roleLabels[profile.role]}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Hesap Bilgileri
              </Text>

              <Text style={styles.sectionSubtitle}>
                Kayıtlı hesap bilgilerin
              </Text>
            </View>
          </View>

          {/* Name */}
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
                Ad Soyad
              </Text>

              <Text style={styles.infoValue}>
                {profile.fullName}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                E-posta
              </Text>

              <Text
                style={styles.infoValue}
                numberOfLines={2}
              >
                {profile.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Role */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={colors.text.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Rol
              </Text>

              <Text style={styles.infoValue}>
                {roleLabels[profile.role]}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Text style={styles.signOutLabel}>
            Hesap
          </Text>

          <Pressable
            onPress={() => {
              void handleSignOut();
            }}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed &&
                styles.signOutButtonPressed,
              isSigningOut &&
                styles.signOutButtonDisabled,
            ]}
          >
            {isSigningOut ? (
              <ActivityIndicator
                color={colors.error}
              />
            ) : (
              <>
                <View
                  style={styles.signOutIcon}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={colors.error}
                  />
                </View>

                <Text
                  style={styles.signOutButtonText}
                >
                  Çıkış Yap
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.error}
                />
              </>
            )}
          </Pressable>
        </View>
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
    paddingBottom: spacing.xxxl,
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

  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },

  avatar: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 39,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
  },

  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  profileName: {
    ...typography.heading,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  profileEmail: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  roleBadgeText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },

  infoCard: {
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
    marginBottom: 2,
  },

  sectionSubtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },

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

  signOutSection: {
    marginTop: spacing.sm,
  },

  signOutLabel: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  signOutButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
  },

  signOutButtonPressed: {
    opacity: 0.75,
  },

  signOutButtonDisabled: {
    opacity: 0.6,
  },

  signOutIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.cancelled,
    marginRight: spacing.md,
  },

  signOutButtonText: {
    ...typography.bodyMedium,
    color: colors.error,
    flex: 1,
  },
});