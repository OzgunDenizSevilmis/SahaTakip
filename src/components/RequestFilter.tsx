import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RequestStatus } from '../types/models';
import { statusLabels } from '../utils/requestLabels';

type CategoryOption = {
  id: string;
  name: string;
};

type RequestFilterProps = {
  statusValue: RequestStatus | null;
  categoryValue: string | null;
  categories: CategoryOption[];
  onStatusChange: (value: RequestStatus | null) => void;
  onCategoryChange: (value: string | null) => void;
};

const statuses: RequestStatus[] = [
  'new',
  'assigned',
  'in_progress',
  'resolved',
  'cancelled',
];

export default function RequestFilter({
  statusValue,
  categoryValue,
  categories,
  onStatusChange,
  onCategoryChange,
}: RequestFilterProps) {
  const [openFilter, setOpenFilter] = useState<
    'status' | 'category' | null
  >(null);

  const selectedStatusLabel = statusValue
    ? statusLabels[statusValue]
    : 'Tümü';

  const selectedCategoryLabel =
    categories.find((category) => category.id === categoryValue)?.name ??
    'Tümü';

  const closeModal = () => {
    setOpenFilter(null);
  };

  return (
    <View>
      <Text style={styles.filterTitle}>Filtreler</Text>

      <Pressable
        onPress={() => setOpenFilter('status')}
        style={styles.filterOption}
      >
        <View>
          <Text style={styles.filterLabel}>Durum</Text>
          <Text style={styles.filterValue}>
            {selectedStatusLabel}
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable
        onPress={() => setOpenFilter('category')}
        style={styles.filterOption}
      >
        <View>
          <Text style={styles.filterLabel}>Kategori</Text>
          <Text style={styles.filterValue}>
            {selectedCategoryLabel}
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Modal
        visible={openFilter !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          onPress={closeModal}
          style={styles.modalOverlay}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={styles.modalContent}
          >
            {openFilter === 'status' ? (
              <>
                <Text style={styles.modalTitle}>Durum seç</Text>

                <Pressable
                  onPress={() => {
                    onStatusChange(null);
                    closeModal();
                  }}
                  style={styles.modalOption}
                >
                  <Text style={styles.modalOptionText}>Tümü</Text>
                </Pressable>

                {statuses.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => {
                      onStatusChange(status);
                      closeModal();
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>
                      {statusLabels[status]}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Kategori seç</Text>

                <Pressable
                  onPress={() => {
                    onCategoryChange(null);
                    closeModal();
                  }}
                  style={styles.modalOption}
                >
                  <Text style={styles.modalOptionText}>Tümü</Text>
                </Pressable>

                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      onCategoryChange(category.id);
                      closeModal();
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterTitle: {
    ...typography.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },

  filterLabel: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  filterValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },

  chevron: {
    fontSize: 26,
    color: colors.text.muted,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },

  modalTitle: {
    ...typography.heading,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
});