import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type LoadingProps = {
  message?: string;
};

export default function Loading({
  message = 'Yükleniyor...',
}: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  message: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});