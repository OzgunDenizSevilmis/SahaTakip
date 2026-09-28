import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ErrorState({
  message,
  onRetry,
  retryLabel = 'Tekrar Dene',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            {retryLabel}
          </Text>
        </Pressable>
      )}
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
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },

  retryButtonText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});