import type {User, UserRole} from '../types/models';
import {supabase} from './supabase';


type ProfileRow = { 
    id: string;
    full_name: string ;
    email: string;
    role : User['role'];
    avatar_url: string | null;
    created_at: string;
};

function mapProfile(row: ProfileRow): User {
    return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
    };
}

export async function getMyProfile(): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }
const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error('Profil bilgileri alınamadı.');
  }

  if (!data) {
    throw new Error('Profil bulunamadı.');
  }

  return mapProfile(data);
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data.role as UserRole;
}
