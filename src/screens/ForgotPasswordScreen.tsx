import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';

import { resetPassword } from '../services/auth';
import type { AuthStackParamList } from '../types/Navigation';

import Button from '../components/Button';
import TextInput from '../components/TextInput';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Geçerli bir e-posta adresi girin.'),
});

type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordNavigationProp =
  NativeStackNavigationProp<
    AuthStackParamList,
    'ForgotPassword'
  >;

export default function ForgotPasswordScreen() {
  const navigation =
    useNavigation<ForgotPasswordNavigationProp>();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSuccess, setIsSuccess] =
    useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } =
    useForm<ForgotPasswordFormData>({
      resolver: zodResolver(
        forgotPasswordSchema,
      ),
      defaultValues: {
        email: '',
      },
    });

  const onSubmit = async (
    data: ForgotPasswordFormData,
  ) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setIsSuccess(false);

      await resetPassword(data.email);

      setIsSuccess(true);
    } catch (error) {
      console.error(
        'Şifre sıfırlama başarısız:',
        error,
      );

      setSubmitError(
        'Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.contentContainer
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="lock-open-outline"
                size={32}
                color={colors.primary}
              />
            </View>

            <Text style={styles.brand}>
              SAHATAKİP
            </Text>

            <Text style={styles.title}>
              Şifreni mi unuttun?
            </Text>

            <Text style={styles.subtitle}>
              Endişelenme. E-posta adresini gir,
              sana şifreni yenileyebileceğin bir
              bağlantı gönderelim.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Şifre Sıfırlama
            </Text>

            <Controller
              control={control}
              name="email"
              render={({
                field: {
                  onChange,
                  onBlur,
                  value,
                },
              }) => (
                <TextInput
                  label="E-posta"
                  placeholder="ornek@mail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={
                    errors.email?.message
                  }
                />
              )}
            />

            {/* Success */}
            {isSuccess && (
              <View
                style={styles.successContainer}
              >
                <View
                  style={styles.successIcon}
                >
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.success}
                  />
                </View>

                <Text
                  style={styles.successText}
                >
                  Şifre sıfırlama bağlantısı
                  e-posta adresinize gönderildi.
                  Gelen kutunuzu kontrol edin.
                </Text>
              </View>
            )}

            {/* Error */}
            {submitError && (
              <View
                style={styles.errorContainer}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={colors.error}
                />

                <Text
                  style={styles.submitError}
                >
                  {submitError}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Bağlantı Gönder"
                onPress={() => {
                  void handleSubmit(
                    onSubmit,
                  )();
                }}
                loading={isSubmitting}
              />
            </View>
          </View>

          {/* Back to Login */}
          <Pressable
            style={styles.loginLinkContainer}
            onPress={() =>
              navigation.navigate('Login')
            }
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={17}
              color={colors.primary}
            />

            <Text style={styles.loginLink}>
              Giriş ekranına dön
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },

  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.md,
  },

  brand: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },

  title: {
    ...typography.title,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 330,
  },

  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.lg,
  },

  formTitle: {
    ...typography.heading,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },

  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },

  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
  },

  successText: {
    ...typography.caption,
    color: colors.success,
    flex: 1,
    lineHeight: 19,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.status.cancelled,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },

  submitError: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
    lineHeight: 19,
  },

  buttonContainer: {
    marginTop: spacing.lg,
  },

  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },

  loginLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});