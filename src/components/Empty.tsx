import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type EmptyProps = {
  message: string;
};

export default function Empty({ message }: EmptyProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },

  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});