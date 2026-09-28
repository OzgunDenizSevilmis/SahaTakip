import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/Navigation';
import { Controller, useForm } from 'react-hook-form';
import { Text, View,Pressable,Alert, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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







export default function CreateRequestScreen() 
{

  const navigation =
  useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  
  const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<CreateRequestFormValues>({
  resolver: zodResolver(createRequestSchema),
  mode: 'onBlur',
});
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
  console.log('SEÇİLEN FOTOĞRAF URI:', result.assets[0].uri);
  console.log('FOTOĞRAF ASSET:', result.assets[0]);

  setSelectedImage(result.assets[0]);
}
};



    const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);

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
  });

    Alert.alert(
      'Başarılı',
      'Talep başarıyla oluşturuldu.',
      [
        {
          text: 'Tamam',
          onPress: () => navigation.navigate('Requests'),
        },
      ],
    );
  } catch (error) {
    console.error('Talep oluşturulamadı:', error);
    setSubmitError('Talep oluşturulurken bir hata oluştu.');
  } finally {
    setIsSubmitting(false);
  }
};

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] =
  useState<ImagePicker.ImagePickerAsset | null>(null);
  
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
    <View>
      <Text>Yeni Talep</Text>

      <Controller
  control={control}
  name="title"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      label="Başlık"
      placeholder="Talep başlığını girin"
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      error={errors.title?.message}
    />
  )}
/>

<Controller
  control={control}
  name="description"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      label="Açıklama"
      placeholder="Talebi açıklayın"
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      multiline
      textAlignVertical="top"
      error={errors.description?.message}
    />
  )}
/>

<Text>Kategori</Text>

    {isCategoriesLoading ? (
      <Text>Kategoriler yükleniyor...</Text>
    ) : categoryError ? (
      <Text>{categoryError}</Text>
    ) : (
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => onChange(category.id)}
              >
                <Text>
                  {value === category.id ? '✓ ' : ''}
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
    )}

{errors.categoryId && (
  <Text>{errors.categoryId.message}</Text>
)}
      <Text>Öncelik</Text>

<Controller
  control={control}
  name="priority"
  render={({ field: { onChange, value } }) => (
    <View>
      <Pressable onPress={() => onChange('low')}>
        <Text>{value === 'low' ? '✓ ' : ''}Düşük</Text>
      </Pressable>

      <Pressable onPress={() => onChange('medium')}>
        <Text>{value === 'medium' ? '✓ ' : ''}Orta</Text>
      </Pressable>

      <Pressable onPress={() => onChange('high')}>
        <Text>{value === 'high' ? '✓ ' : ''}Yüksek</Text>
      </Pressable>

      <Text>Fotoğraf</Text>

<Pressable onPress={pickImage}>
  <Text>
    {selectedImage ? 'Fotoğrafı Değiştir' : 'Fotoğraf Ekle'}
  </Text>
</Pressable>

{selectedImage && (
  <Text>Fotoğraf seçildi.</Text>
)}  
    </View>
  )}
/>

{errors.priority && <Text>{errors.priority.message}</Text>}

     <Button
  title="Talep Oluştur"
  onPress={() => {
    void handleSubmit(onSubmit)();
  }}
  loading={isSubmitting}
/>

{submitError && <Text>{submitError}</Text>}
   
    
    </View>
  );
}