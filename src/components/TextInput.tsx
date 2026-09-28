import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type TextInputProps = RNTextInputProps & {
  label?: string;
  error?: string;
};

export default function TextInput({
  label,
  error,
  style,
  ...props
}: TextInputProps) {
  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}

      <RNTextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={
          props.placeholderTextColor ?? colors.text.muted
        }
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    ...typography.body,
  },

  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
});