import type {User, UserRole} from '../types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STAFF_CACHE_KEY = '@sahatakip/staff-cache';

export async function getStaffUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .order('full_name', { ascending: true });

    if (error) {
      throw error;
    }

    const staffUsers = (data ?? []).map(mapProfile);

    await AsyncStorage.setItem(
      STAFF_CACHE_KEY,
      JSON.stringify(staffUsers),
    );

    return staffUsers;
  } catch (error) {
    try {
      const cachedData = await AsyncStorage.getItem(STAFF_CACHE_KEY);

      if (cachedData) {
        console.warn(
          'Sunucuya ulaşılamadı. Önbellekteki personel listesi kullanılıyor.',
        );

        return JSON.parse(cachedData) as User[];
      }
    } catch (cacheError) {
      console.error(
        'Önbellekteki personel listesi okunamadı:',
        cacheError,
      );
    }

    console.error(
      'Personel listesi sunucudan veya önbellekten alınamadı:',
      error,
    );

    throw error;
  }
}

