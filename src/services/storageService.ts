import { File } from 'expo-file-system';
import { supabase } from './supabase';


export async function uploadRequestImage(
  uri: string,
  mimeType: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Kullanıcı oturumu bulunamadı.');
  }

 const file = new File(uri);
const arrayBuffer = await file.arrayBuffer();

  const fileExtension =
    uri.split('.').pop()?.split('?')[0].toLowerCase() || 'jpg';

  const filePath = `${user.id}/${Date.now()}.${fileExtension}`;

  const { error } = await supabase.storage
    .from('request-images')
    .upload(filePath, arrayBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return filePath;
}