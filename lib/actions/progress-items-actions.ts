// /lib/actions/progress-items-actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ProgressItemInsert {
  episode_id: string;
  node_id?: string | null;
  name: string;
  description?: string | null;
}

export interface ProgressItemUpdate {
  node_id?: string | null;
  name?: string;
  description?: string | null;
}

export async function getProgressItemsByEpisode(episodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('progress_items')
    .select(`
      *,
      content_nodes (
        name
      )
    `)
    .eq('episode_id', episodeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProgressItem(item: ProgressItemInsert) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('progress_items')
    .insert(item);

  if (error) throw error;
  revalidatePath('/admin/progress-items');
}

export async function updateProgressItem(id: string, item: ProgressItemUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('progress_items')
    .update(item)
    .eq('progress_item_id', id);

  if (error) throw error;
  revalidatePath('/admin/progress-items');
}

export async function deleteProgressItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('progress_items')
    .delete()
    .eq('progress_item_id', id);

  if (error) throw error;
  revalidatePath('/admin/progress-items');
}