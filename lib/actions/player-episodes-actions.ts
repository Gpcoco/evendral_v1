'use server';

import { createClient } from '@/lib/supabase/server';

const ADVENTURE_ID = process.env.NEXT_PUBLIC_ADVENTURE_ID!;

export async function getPublishedEpisodes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('adventure_id', ADVENTURE_ID)
    .eq('is_published', true)
    .eq('is_active', true)
    .order('start_datetime', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getFirstNode(episodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('episode_id', episodeId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}