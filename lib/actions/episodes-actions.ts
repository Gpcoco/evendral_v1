'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { EpisodeInsert } from '@/lib/types/database';

const ADVENTURE_ID = process.env.NEXT_PUBLIC_ADVENTURE_ID!;

export async function getEpisodes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('adventure_id', ADVENTURE_ID)
    .order('start_datetime', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createEpisode(formData: FormData) {
  const supabase = await createClient();
  
  const episode: EpisodeInsert = {
    adventure_id: ADVENTURE_ID,
    episode_number: null,
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string || null,
    start_datetime: formData.get('start_datetime') as string,
    end_datetime: formData.get('end_datetime') as string,
    max_players: formData.get('max_players') ? parseInt(formData.get('max_players') as string) : null,
    is_active: true,
    is_published: false,
  };

  const { error } = await supabase.from('episodes').insert(episode);
  if (error) throw error;
  
  revalidatePath('/admin/episodes');
}

export async function deleteEpisode(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('episodes')
    .delete()
    .eq('episode_id', id)
    .eq('adventure_id', ADVENTURE_ID);

  if (error) throw error;
  revalidatePath('/admin/episodes');
}