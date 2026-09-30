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
import { z } from 'zod';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { signIn } from '../services/auth';
import type { AuthStackParamList } from '../types/Navigation';

import Button from '../components/Button';
import TextInput from '../components/TextInput';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Geçerli bir e-posta adresi girin.'),
  password: z
    .string()
    .min(1, 'Şifre zorunludur.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginScreenNavigationProp =
  NativeStackNavigationProp<
    AuthStackParamList,
    'Login'
  >;

export default function LoginScreen() {
  const navigation =
    useNavigation<LoginScreenNavigationProp>();

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await signIn({
        email: data.email,
        password: data.password,
      });

      console.log('Giriş başarılı');
    } catch (error) {
      console.error(
        'Giriş başarısız:',
        error,
      );

      setSubmitError(
        'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
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
                name="shield-checkmark-outline"
                size={32}
                color={colors.primary}
              />
            </View>

            <Text style={styles.brand}>
              SAHATAKİP
            </Text>

            <Text style={styles.title}>
              Tekrar hoş geldin 👋
            </Text>

            <Text style={styles.subtitle}>
              Taleplerini yönetmek ve saha süreçlerini
              kolayca takip etmek için hesabına giriş yap.
           </Text>
          </View>

          {/* Login Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Giriş Yap
            </Text>

            {/* Email */}
            <View style={styles.field}>
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
            </View>

            {/* Password */}
            <View style={styles.passwordField}>
              <Controller
                control={control}
                name="password"
                render={({
                  field: {
                    onChange,
                    onBlur,
                    value,
                  },
                }) => (
                  <View>
                    <TextInput
                      label="Şifre"
                      placeholder="Şifrenizi girin"
                      secureTextEntry={
                        !showPassword
                      }
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={
                        errors.password?.message
                      }
                    />

                    <Pressable
                      style={styles.passwordToggle}
                      onPress={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={21}
                        color={
                          colors.text.secondary
                        }
                      />
                    </Pressable>
                  </View>
                )}
              />
            </View>

            {/* Forgot Password */}
            <Pressable
              style={styles.forgotPassword}
              onPress={() =>
                navigation.navigate(
                  'ForgotPassword',
                )
              }
              hitSlop={6}
            >
              <Text style={styles.forgotPasswordText}>
                Şifremi Unuttum
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.primary}
              />
            </Pressable>

            {/* Submit Error */}
            {submitError && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={colors.error}
                />

                <Text style={styles.submitError}>
                  {submitError}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Giriş Yap"
                onPress={() => {
                  void handleSubmit(
                    onSubmit,
                  )();
                }}
                loading={isSubmitting}
              />
            </View>
          </View>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Hesabın yok mu?
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate(
                  'SignUp',
                )
              }
              hitSlop={6}
            >
              <Text style={styles.registerLink}>
                Kayıt Ol
              </Text>
            </Pressable>
          </View>
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
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xs,
  },

  formSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  field: {
    marginBottom: spacing.md,
  },

  passwordField: {
    marginBottom: spacing.sm,
  },

  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    bottom: 15,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  forgotPasswordText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.status.cancelled,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  submitError: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
    lineHeight: 19,
  },

  buttonContainer: {
    marginTop: spacing.xs,
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },

  registerText: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  registerLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});
