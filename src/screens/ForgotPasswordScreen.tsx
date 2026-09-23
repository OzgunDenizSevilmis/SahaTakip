import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Button, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { resetPassword } from '../services/auth';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
  console.log('GÖNDERİLEN EMAIL:', JSON.stringify(data.email));

  try {
    await resetPassword(data.email);

    console.log('Şifre sıfırlama e-postası gönderildi.');
  } catch (error) {
    console.error('Şifre sıfırlama başarısız:', error);
  }
};
  return (
    <View>
      <Text>Şifremi Unuttum</Text>

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

      <Button
        title="Şifre Sıfırlama Bağlantısı Gönder"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}