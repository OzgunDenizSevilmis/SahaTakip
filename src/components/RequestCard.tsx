import { StyleSheet, Text, View } from 'react-native';

import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type {
  RequestPriority,
  RequestStatus,
} from '../types/models';

type RequestCardProps = {
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  description?: string;
  categoryName?: string;
};

export default function RequestCard({
  title,
  status,
  priority,
  description,
  categoryName,
}: RequestCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {description && (
        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {description}
        </Text>
      )}

      {categoryName && (
        <Text style={styles.category}>
          Kategori: {categoryName}
        </Text>
      )}

      <View style={styles.badges}>
        <PriorityBadge priority={priority} />
        <StatusBadge status={status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  title: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  description: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },

  category: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },

  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});