import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Button, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { signIn } from '../services/auth';
import type { AuthStackParamList } from '../types/Navigation';

const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

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
      await signIn({
        email: data.email,
        password: data.password,
      });

      console.log('Giriş başarılı');
    } catch (error) {
      console.error('Giriş başarısız:', error);
    }
  };

  return (
    <View>
      <Text>Giriş Yap</Text>

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

      <Button title="Giriş Yap" onPress={handleSubmit(onSubmit)} />

      <Button
        title="Şifremi Unuttum"
        onPress={() => navigation.navigate('ForgotPassword')}
      />

      <Button
        title="Kayıt Ol"
        onPress={() => navigation.navigate('SignUp')}
      />
    </View>
  );
}