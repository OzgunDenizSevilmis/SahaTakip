import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});