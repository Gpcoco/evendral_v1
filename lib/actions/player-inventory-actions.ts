'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPlayerEpisodeInventory(playerId: string, episodeId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('player_episode_inventory')
    .select(`
      *,
      item:items(*)
    `)
    .eq('player_id', playerId)
    .eq('episode_id', episodeId)
    .order('acquired_at', { ascending: false });

  if (error) throw error;
  return data || [];
}