import type { Request, RequestStatus } from '../types/models';

import { supabase } from './supabase';

type RequestRow = {
  id: string;
  title: string;
  description: string;
  category_id: string;
  priority: string;
  status: RequestStatus;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

function mapRequest(row: RequestRow): Request {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    priority: row.priority,
    status: row.status.trim() as RequestStatus,
    imageUrl: row.image_url,
    latitude: row.latitude,
    longitude: row.longitude,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMyRequests(): Promise<Request[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as RequestRow[]).map(mapRequest);
}

export type RequestSummary = {
  openCount: number;
  inProgressCount: number;
  completedCount: number;
  recentRequests: Request[];
};

export async function getMyRequestSummary(): Promise<RequestSummary> {
  const requests = await getMyRequests();

  return {
    openCount: requests.filter(
      (request) =>
        request.status === 'new' || request.status === 'assigned',
    ).length,
    inProgressCount: requests.filter(
      (request) => request.status === 'in_progress',
    ).length,
    completedCount: requests.filter(
      (request) => request.status === 'resolved',
    ).length,
    recentRequests: requests.slice(0, 5),
  };
}