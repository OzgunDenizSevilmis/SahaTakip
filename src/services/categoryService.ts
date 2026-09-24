import type { Category } from '../types/models';
import { supabase } from './supabase';

type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as CategoryRow[]).map(mapCategory);
}