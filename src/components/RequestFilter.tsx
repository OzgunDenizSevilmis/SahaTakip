import { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

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
      <Text style={{ marginBottom: 8 }}>Durum</Text>

      <Pressable
        onPress={() => setOpenFilter('status')}
        style={{
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: '#ffffff',
          marginBottom: 16,
        }}
      >
        <Text>{selectedStatusLabel}</Text>
      </Pressable>

      <Text style={{ marginBottom: 8 }}>Kategori</Text>

      <Pressable
        onPress={() => setOpenFilter('category')}
        style={{
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: '#ffffff',
          marginBottom: 16,
        }}
      >
        <Text>{selectedCategoryLabel}</Text>
      </Pressable>

      <Modal
        visible={openFilter !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          onPress={closeModal}
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
            }}
          >
            {openFilter === 'status' ? (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 12,
                  }}
                >
                  Durum seç
                </Text>

                <Pressable
                  onPress={() => {
                    onStatusChange(null);
                    closeModal();
                  }}
                  style={{ paddingVertical: 12 }}
                >
                  <Text>Tümü</Text>
                </Pressable>

                {statuses.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => {
                      onStatusChange(status);
                      closeModal();
                    }}
                    style={{ paddingVertical: 12 }}
                  >
                    <Text>{statusLabels[status]}</Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 12,
                  }}
                >
                  Kategori seç
                </Text>

                <Pressable
                  onPress={() => {
                    onCategoryChange(null);
                    closeModal();
                  }}
                  style={{ paddingVertical: 12 }}
                >
                  <Text>Tümü</Text>
                </Pressable>

                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      onCategoryChange(category.id);
                      closeModal();
                    }}
                    style={{ paddingVertical: 12 }}
                  >
                    <Text>{category.name}</Text>
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