export type UserRole = 'requester' | 'staff' | 'admin';

export type RequestStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'cancelled';

export type RequestPriority = string;

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Request = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: RequestPriority;
  status: RequestStatus;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StatusHistory = {
  id: string;
  requestId: string;
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus;
  note: string | null;
  changedBy: string;
  changedAt: string;
};