import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Button, Text, TextInput, View } from 'react-native';
import { signUp } from '../services/auth';
import { z } from 'zod';

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
    email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Şifreler eşleşmiyor.',
    path: ['passwordConfirmation'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
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
    await signUp({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });

    console.log('Kayıt başarılı');
  } catch (error) {
    console.error('Kayıt başarısız:', error);
  }
};
  
  return (
    <View>
      <Text>Kayıt Ol</Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="Ad Soyad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.fullName && <Text>{errors.fullName.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="E-posta"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.email && <Text>{errors.email.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="Şifre"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.password && <Text>{errors.password.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="passwordConfirmation"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="Şifre Tekrar"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.passwordConfirmation && (
              <Text>{errors.passwordConfirmation.message}</Text>
            )}
          </View>
        )}
      />

      <Button title="Kayıt Ol" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}