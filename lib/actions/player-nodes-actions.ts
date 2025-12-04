'use server';

import { createClient } from '@/lib/supabase/server';
import type { NodeCategory } from '@/lib/types/database';

export async function getUnlockedNodes(episodeId: string, playerId: string, category?: NodeCategory) {
  const supabase = await createClient();
  
  let query = supabase
    .from('content_nodes')
    .select('*, conditions(*)')
    .eq('episode_id', episodeId)
    .order('created_at', { ascending: true });
  
  // Filtra per categoria se specificata
  if (category) {
    query = query.eq('node_category', category);
  }

  const { data: nodes } = await query;

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