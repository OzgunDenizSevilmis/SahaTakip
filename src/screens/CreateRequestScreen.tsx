import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/Navigation';

import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { useEffect, useState } from 'react';
import type { Category } from '../types/models';

import { createRequest } from '../services/requestService';
import { getCategories } from '../services/categoryService';
import { uploadRequestImage } from '../services/storageService';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  createRequestSchema,
  type CreateRequestFormValues,
} from '../utils/requestValidation';

import Button from '../components/Button';
import TextInput from '../components/TextInput';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function CreateRequestScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<CreateRequestFormValues>({
  resolver: zodResolver(createRequestSchema),
  mode: 'onBlur',
  defaultValues: {
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium',
  },
});


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'İzin gerekli',
        'Fotoğraf seçebilmek için galeri erişim izni vermeniz gerekiyor.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const permissionResult =
        await Location.requestForegroundPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'İzin gerekli',
          'Konum eklemek için konum izni vermeniz gerekiyor.',
        );
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Konum alınamadı:', error);

      Alert.alert(
        'Hata',
        'Konum alınırken bir hata oluştu.',
      );
    }
  };

  const onSubmit = async (data: CreateRequestFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      let imagePath: string | null = null;

      if (selectedImage) {
        imagePath = await uploadRequestImage(
          selectedImage.uri,
          selectedImage.mimeType ?? 'image/jpeg',
        );
      }

      await createRequest({
        ...data,
        imageUrl: imagePath,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      });

      Alert.alert(
        'Başarılı',
        'Talep başarıyla oluşturuldu.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ],
      );
    } catch (error) {
      console.error('Talep oluşturulamadı:', error);
      setSubmitError(
        'Talep oluşturulurken bir hata oluştu.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryError(null);

        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        console.error('Kategoriler alınamadı:', error);
        setCategoryError('Kategoriler yüklenemedi.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    void loadCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SAHATAKİP</Text>

          <Text style={styles.title}>
            Yeni Talep
          </Text>

          <Text style={styles.subtitle}>
            Karşılaştığın problemi detaylarıyla
            bildirerek yeni bir talep oluştur.
          </Text>
        </View>

        {/* Request Information */}
        <View style={styles.section}>
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
                Talep Bilgileri
              </Text>

              <Text style={styles.sectionSubtitle}>
                Problemi kısaca açıkla
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Controller
              control={control}
              name="title"
              render={({
                field: {
                  onChange,
                  onBlur,
                  value,
                },
              }) => (
                <TextInput
                  label="Başlık"
                  placeholder="Örn. Bilgisayar çalışmıyor"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="description"
            render={({
              field: {
                onChange,
                onBlur,
                value,
              },
            }) => (
              <TextInput
                label="Açıklama"
                placeholder="Problemi detaylı şekilde açıklayın"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                textAlignVertical="top"
                error={errors.description?.message}
              />
            )}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="grid-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Kategori
              </Text>

              <Text style={styles.sectionSubtitle}>
                Talebin hangi konuyla ilgili?
              </Text>
            </View>
          </View>

          {isCategoriesLoading ? (
            <Text style={styles.helperText}>
              Kategoriler yükleniyor...
            </Text>
          ) : categoryError ? (
            <Text style={styles.errorText}>
              {categoryError}
            </Text>
          ) : (
            <Controller
              control={control}
              name="categoryId"
              render={({
                field: {
                  onChange,
                  value,
                },
              }) => (
                <View style={styles.optionGrid}>
                  {categories.map((category) => {
                    const isSelected =
                      value === category.id;

                    return (
                      <Pressable
                        key={category.id}
                        onPress={() =>
                          onChange(category.id)
                        }
                        style={({ pressed }) => [
                          styles.categoryOption,
                          isSelected &&
                            styles.categoryOptionSelected,
                          pressed &&
                            styles.optionPressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.optionIndicator,
                            isSelected &&
                              styles.optionIndicatorSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={15}
                              color={
                                colors.text.inverse
                              }
                            />
                          )}
                        </View>

                        <Text
                          style={[
                            styles.optionText,
                            isSelected &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          )}

          {errors.categoryId && (
            <Text style={styles.errorText}>
              {errors.categoryId.message}
            </Text>
          )}
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Öncelik
              </Text>

              <Text style={styles.sectionSubtitle}>
                Talebin ne kadar acil?
              </Text>
            </View>
          </View>

          <Controller
            control={control}
            name="priority"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (
              <View style={styles.priorityContainer}>
                {[
                  {
                    value: 'low' as const,
                    label: 'Düşük',
                  },
                  {
                    value: 'medium' as const,
                    label: 'Orta',
                  },
                  {
                    value: 'high' as const,
                    label: 'Yüksek',
                  },
                ].map((priority) => {
                  const isSelected =
                    value === priority.value;

                  return (
                    <Pressable
                      key={priority.value}
                      onPress={() =>
                        onChange(
                          priority.value,
                        )
                      }
                      style={({ pressed }) => [
                        styles.priorityOption,
                        isSelected &&
                          styles.priorityOptionSelected,
                        pressed &&
                          styles.optionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          isSelected &&
                            styles.priorityTextSelected,
                        ]}
                      >
                        {priority.label}
                      </Text>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          {errors.priority && (
            <Text style={styles.errorText}>
              {errors.priority.message}
            </Text>
          )}
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Fotoğraf
              </Text>

              <Text style={styles.sectionSubtitle}>
                İstersen probleme ait bir fotoğraf ekle
              </Text>
            </View>
          </View>

          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={styles.actionCardIcon}>
              <Ionicons
                name={
                  selectedImage
                    ? 'image'
                    : 'camera-outline'
                }
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>
                {selectedImage
                  ? 'Fotoğraf seçildi'
                  : 'Fotoğraf Ekle'}
              </Text>

              <Text style={styles.actionCardSubtitle}>
                {selectedImage
                  ? 'Değiştirmek için dokun'
                  : 'Galeriden fotoğraf seç'}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.muted}
            />
          </Pressable>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Konum
              </Text>

              <Text style={styles.sectionSubtitle}>
                Talebin bulunduğu konumu ekle
              </Text>
            </View>
          </View>

          <Pressable
            onPress={getCurrentLocation}
            style={({ pressed }) => [
              styles.actionCard,
              location &&
                styles.actionCardSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <View
              style={[
                styles.actionCardIcon,
                location &&
                  styles.actionCardIconSelected,
              ]}
            >
              <Ionicons
                name={
                  location
                    ? 'checkmark'
                    : 'location-outline'
                }
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>
                {location
                  ? 'Konum alındı'
                  : 'Konumumu Ekle'}
              </Text>

              <Text style={styles.actionCardSubtitle}>
                {location
                  ? `${location.latitude.toFixed(
                      5,
                    )}, ${location.longitude.toFixed(
                      5,
                    )}`
                  : 'Mevcut konumunu kullan'}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.muted}
            />
          </Pressable>
        </View>

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button
            title="Talep Oluştur"
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            loading={isSubmitting}
          />

          {submitError && (
            <Text style={styles.submitError}>
              {submitError}
            </Text>
          )}
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
    marginBottom: spacing.xxl,
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

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
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

  field: {
    marginBottom: spacing.md,
  },

  optionGrid: {
    gap: spacing.sm,
  },

  categoryOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },

  categoryOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  optionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  optionIndicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  optionText: {
    ...typography.body,
    color: colors.text.secondary,
  },

  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  optionPressed: {
    opacity: 0.75,
  },

  priorityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  priorityOption: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
  },

  priorityOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  priorityText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  priorityTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  actionCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.background,
  },

  actionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  actionCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },

  actionCardIconSelected: {
    backgroundColor: colors.surface,
  },

  actionCardContent: {
    flex: 1,
  },

  actionCardTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },

  actionCardSubtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },

  helperText: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },

  submitSection: {
    marginTop: spacing.sm,
  },

  submitError: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

