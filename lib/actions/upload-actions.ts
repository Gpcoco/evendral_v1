'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadItemImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;
  
  if (!file) {
    return { error: 'No file provided' };
  }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Formato non supportato. Usa PNG, JPG, JPEG, WebP o GIF' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File troppo grande. Max 5MB' };
  }

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `items/${fileName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('media-content')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    return { error: 'Errore durante l\'upload' };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media-content')
    .getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function deleteItemImage(imageUrl: string) {
  const supabase = await createClient();
  
  // Extract path from URL
  const urlParts = imageUrl.split('media-content/');
  if (urlParts.length < 2) {
    return { error: 'Invalid URL' };
  }
  
  const filePath = urlParts[1];
  
  const { error } = await supabase.storage
    .from('media-content')
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    return { error: 'Errore durante l\'eliminazione' };
  }

  return { success: true };
}