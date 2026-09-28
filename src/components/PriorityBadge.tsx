import { StyleSheet, Text, View } from 'react-native';

import { typography } from '../theme/typography';
import type { RequestPriority } from '../types/models';
import {
  priorityColors,
  priorityLabels,
} from '../utils/requestLabels';

type PriorityBadgeProps = {
  priority: RequestPriority;
};

export default function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: priorityColors[priority],
        },
      ]}
    >
      <Text style={styles.text}>
        {priorityLabels[priority]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },

  text: {
    ...typography.small,
  },
});