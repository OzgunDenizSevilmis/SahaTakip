import type {
  RequestPriority,
  RequestStatus,
} from '../types/models';

export const priorityLabels: Record<RequestPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

export const statusLabels: Record<RequestStatus, string> = {
  new: 'Yeni',
  assigned: 'Atandı',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  cancelled: 'İptal',
};

export const priorityColors: Record<RequestPriority, string> = {
  low: '#dcfce7',
  medium: '#fef3c7',
  high: '#fee2e2',
};

export const statusColors: Record<RequestStatus, string> = {
  new: '#dbeafe',
  assigned: '#ede9fe',
  in_progress: '#fef3c7',
  resolved: '#dcfce7',
  cancelled: '#fee2e2',
};