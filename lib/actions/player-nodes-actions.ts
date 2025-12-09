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
  
  if (category) {
    query = query.eq('node_category', category);
  }

  const { data: nodes } = await query;
  if (!nodes) return [];

  // Recupera progress items (invisibili)
  const { data: playerSteps } = await supabase
    .from('player_steps')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId);

  const ownedProgressItemIds = new Set(playerSteps?.map(s => s.item_id) || []);

  // ✅ AGGIUNGI: Recupera items nell'inventario episodio (visibili)
  const { data: playerInventory } = await supabase
    .from('player_episode_inventory')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId);

  const ownedItemIds = new Set(playerInventory?.map(i => i.item_id) || []);

  const unlocked = nodes.filter(node => {
    if (!node.conditions || node.conditions.length === 0) return true;

    return node.conditions.every((condition: { type: string; payload: Record<string, unknown> }) => {
      // Progress items (invisibili - per catene di unlock tra nodi)
      if (condition.type === 'completed_progress') {
        return ownedProgressItemIds.has(condition.payload.item_id as string);
      }
      
      // ✅ AGGIUNGI: Items inventario (visibili - raccolti dal giocatore)
      if (condition.type === 'hasItem') {
        return ownedItemIds.has(condition.payload.item_id as string);
      }
      
      // Default per tipi di condizioni non implementati
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