import { StyleSheet, Text, View } from 'react-native';

import { typography } from '../theme/typography';
import type { RequestStatus } from '../types/models';
import { statusColors, statusLabels } from '../utils/requestLabels';

type StatusBadgeProps = {
  status: RequestStatus;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColors[status],
        },
      ]}
    >
      <Text style={styles.text}>{statusLabels[status]}</Text>
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