'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUnlockedNodes(episodeId: string, playerId: string) {
  const supabase = await createClient();
  
  const { data: nodes } = await supabase
    .from('content_nodes')
    .select('*, conditions(*)')
    .eq('episode_id', episodeId)
    .order('created_at', { ascending: true });

  if (!nodes) return [];

  const { data: playerSteps } = await supabase
    .from('player_steps')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId);

  const ownedItemIds = new Set(playerSteps?.map(s => s.item_id) || []);

  const unlocked = nodes.filter(node => {
    if (!node.conditions || node.conditions.length === 0) return true;

    return node.conditions.every((condition: { type: string; payload: Record<string, unknown> }) => {
      if (condition.type === 'completed_progress') {
        return ownedItemIds.has(condition.payload.item_id as string);
      }
      return false;
    });
  });

  return unlocked;
}

export async function getEpisodeWithCheck(episodeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('episodes')
    .select('*')
    .eq('episode_id', episodeId)
    .eq('is_published', true)
    .eq('is_active', true)
    .single();
  
  return data;
}