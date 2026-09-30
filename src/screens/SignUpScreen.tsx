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

import { signUp } from '../services/auth';
import type { AuthStackParamList } from '../types/Navigation';

import Button from '../components/Button';
import TextInput from '../components/TextInput';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
    email: z
      .string()
      .trim()
      .email('Geçerli bir e-posta adresi girin.'),
    password: z
      .string()
      .min(6, 'Şifre en az 6 karakter olmalıdır.'),
    passwordConfirmation: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.passwordConfirmation,
    {
      message: 'Şifreler eşleşmiyor.',
      path: ['passwordConfirmation'],
    },
  );

type SignUpFormData = z.infer<typeof signUpSchema>;

type SignUpNavigationProp =
  NativeStackNavigationProp<
    AuthStackParamList,
    'SignUp'
  >;

export default function SignUpScreen() {
  const navigation =
    useNavigation<SignUpNavigationProp>();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showPasswordConfirmation,
    setShowPasswordConfirmation,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      console.log('Kayıt başarılı');
    } catch (error) {
      console.error(
        'Kayıt başarısız:',
        error,
      );

      setSubmitError(
        'Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
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
              Hesabını oluştur 
            </Text>

            <Text style={styles.subtitle}>
              Saha süreçlerini takip etmek için
              birkaç bilgiyle hesabını oluştur.
            </Text>
          </View>

          {/* Register Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Kayıt Ol
            </Text>

            {/* Full Name */}
            <View style={styles.field}>
              <Controller
                control={control}
                name="fullName"
                render={({
                  field: {
                    onChange,
                    onBlur,
                    value,
                  },
                }) => (
                  <TextInput
                    label="Ad Soyad"
                    placeholder="Adınızı ve soyadınızı girin"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    error={
                      errors.fullName?.message
                    }
                  />
                )}
              />
            </View>

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
                      placeholder="En az 6 karakter"
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

            {/* Password Confirmation */}
            <View style={styles.passwordField}>
              <Controller
                control={control}
                name="passwordConfirmation"
                render={({
                  field: {
                    onChange,
                    onBlur,
                    value,
                  },
                }) => (
                  <View>
                    <TextInput
                      label="Şifre Tekrar"
                      placeholder="Şifrenizi tekrar girin"
                      secureTextEntry={
                        !showPasswordConfirmation
                      }
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={
                        errors.passwordConfirmation
                          ?.message
                      }
                    />

                    <Pressable
                      style={styles.passwordToggle}
                      onPress={() =>
                        setShowPasswordConfirmation(
                          (current) =>
                            !current,
                        )
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name={
                          showPasswordConfirmation
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

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Kayıt Ol"
                onPress={() => {
                  void handleSubmit(
                    onSubmit,
                  )();
                }}
                loading={isSubmitting}
              />
            </View>
          </View>

          {/* Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Zaten hesabın var mı?
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate('Login')
              }
              hitSlop={6}
            >
              <Text style={styles.loginLink}>
                Giriş Yap
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

  formSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  field: {
    marginBottom: spacing.md,
  },

  passwordField: {
    marginBottom: spacing.md,
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

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },

  loginText: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  loginLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
});
