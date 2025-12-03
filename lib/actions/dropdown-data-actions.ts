'use server';

import { createClient } from '@/lib/supabase/server';

const ADVENTURE_ID = process.env.NEXT_PUBLIC_ADVENTURE_ID!;

export async function getProgressItems(episodeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('progress_items')
    .select('progress_item_id, name')
    .eq('episode_id', episodeId);
  return data || [];
}

export async function getInventoryItems() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('items')
    .select('item_id, name')
    .eq('adventure_id', ADVENTURE_ID)
    .is('episode_id', null);
  return data || [];
}

export async function getAchievements() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('achievements')
    .select('achievement_id, name')
    .eq('adventure_id', ADVENTURE_ID);
  return data || [];
}