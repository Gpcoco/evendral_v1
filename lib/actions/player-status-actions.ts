'use server';

import { createClient } from '@/lib/supabase/server';

export async function getActiveStatusEffects(playerId: string, episodeId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('player_status_effects')
    .select('*')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching status effects:', error);
    return [];
  }

  return data || [];
}

export async function getPlayerEpisodeStats(playerId: string, episodeId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('player_episode_stats')
    .select('*')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId)
    .single();

  if (error) {
    console.error('Error fetching episode stats:', error);
    return null;
  }

  return data;
}

export async function getRecentInteractions(playerId: string, episodeId: string, limit = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('player_interactions')
    .select(`
      *,
      player1:player!fk_player_interactions_player1_id_player(display_name),
      player2:player!fk_player_interactions_player2_id_player(display_name)
    `)
    .eq('episode_id', episodeId)
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }

  return data || [];
}