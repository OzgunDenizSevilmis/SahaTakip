import type {StatusHistory,
  Request,
  RequestPriority,
  RequestStatus,
} from '../types/models';



import { supabase } from './supabase';

type RequestRow = {
  id: string;
  title: string;
  description: string;
  category_id: string;
  priority: RequestPriority;
  status: RequestStatus;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  
};
type RequestListRow = RequestRow & {
  categories: {
    name: string;
  } | null;
};
export type RequestListItem = Request & {
  categoryName: string;
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

export async function getMyRequests(): Promise<RequestListItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  let query = supabase
    .from('requests')
    .select(`
      *,
      categories (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (profile.role === 'requester') {
    query = query.eq('created_by', user.id);
  } else if (profile.role === 'staff') {
    query = query.eq('assigned_to', user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as RequestListRow[]).map((row) => ({
    ...mapRequest(row),
    categoryName: row.categories?.name ?? 'Kategori yok',
  }));
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

export async function createRequest(
 data: {
  title: string;
  description: string;
  categoryId: string;
  priority: RequestPriority;
  imageUrl?: string | null;
},

): Promise<Request> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }

  const { data: request, error } = await supabase
    .from('requests')
    .insert({
      title: data.title,
      description: data.description,
      category_id: data.categoryId,
      priority: data.priority,
      created_by: user.id,
      image_url: data.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapRequest(request as RequestRow);
}

export async function getRequestById(
  requestId: string,
): Promise<RequestListItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  let query = supabase
    .from('requests')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('id', requestId);

  if (profile.role === 'requester') {
    query = query.eq('created_by', user.id);
  } else if (profile.role === 'staff') {
    query = query.eq('assigned_to', user.id);
  }

  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  const row = data as RequestListRow;

  return {
    ...mapRequest(row),
    categoryName: row.categories?.name ?? 'Kategori yok',
  };
}

export async function changeRequestStatus(
  requestId: string,
  newStatus: RequestStatus,
  note?: string,
): Promise<Request> {
  const { data, error } = await supabase.rpc(
    'change_request_status',
    {
      p_request_id: requestId,
      p_new_status: newStatus,
      p_note: note ?? null,
    },
  );

  if (error) {
    throw error;
  }

  return mapRequest(data as RequestRow);
}

export async function getRequestStatusHistory(
  requestId: string,
): Promise<StatusHistory[]> {
  const { data, error } = await supabase
    .from('status_history')
    .select(`
      id,
      request_id,
      old_status,
      new_status,
      note,
      changed_by,
      changed_at
    `)
    .eq('request_id', requestId)
    .order('changed_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    requestId: row.request_id,
    oldStatus: row.old_status as RequestStatus | null,
    newStatus: row.new_status as RequestStatus,
    note: row.note,
    changedBy: row.changed_by,
    changedAt: row.changed_at,
  }));
}
