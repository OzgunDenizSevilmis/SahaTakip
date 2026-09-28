import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        console.error('Profil yüklenemedi:', error);

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
      console.error('Profil tekrar yüklenemedi:', error);
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
      console.error('Çıkış başarısız:', error);
      setErrorMessage('Çıkış yapılırken bir hata oluştu.');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
  return <Loading message="Profil yükleniyor..." />;
  }
if (errorMessage || !profile) {
  return (
    <ErrorState
      message={errorMessage ?? 'Profil bilgileri bulunamadı.'}
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
      <View style={styles.content}>
        <Text style={styles.title}>Profil</Text>

        <Text style={styles.subtitle}>
          Hesap bilgilerini buradan görüntüleyebilirsin.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileInitial}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {profile.fullName}
          </Text>

          <Text style={styles.profileEmail}>
            {profile.email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {roleLabels[profile.role]}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            Hesap Bilgileri
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>
              {profile.fullName}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-posta</Text>
            <Text style={styles.infoValue}>
              {profile.email}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>
              {roleLabels[profile.role]}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            void handleSignOut();
          }}
          disabled={isSigningOut}
          style={[
            styles.signOutButton,
            isSigningOut && styles.signOutButtonDisabled,
          ]}
        >
          {isSigningOut ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.signOutButtonText}>
              Çıkış Yap
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
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

  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },

  avatar: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 36,
    marginBottom: spacing.md,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },

  profileName: {
    ...typography.heading,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  profileEmail: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  roleBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  roleBadgeText: {
    ...typography.small,
    color: colors.primary,
  },

  infoCard: {
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
    marginBottom: spacing.lg,
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

  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginTop: 'auto',
  },

  signOutButtonDisabled: {
    opacity: 0.6,
  },

  signOutButtonText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});