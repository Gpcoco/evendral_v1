'use server';

import { createClient } from '@/lib/supabase/server';

export interface PlayerEpisodeStats {
  nodesCompleted: number;
  nodesTotal: number;
  completionPercentage: number;
}

export interface ActiveStatusEffect {
  status_effect_id: string;
  status_type: string;
  applied_at: string;
  expires_at: string | null;
  metadata: Record<string, unknown>;
}

interface PlayerStepWithNode {
  item_id: string;
  progress_items: {
    node_id: string;
    content_nodes: {
      episode_id: string;
      node_category: string;
    };
  };
}

/**
 * Recupera le statistiche di completamento dell'episodio per un giocatore
 */
export async function getPlayerEpisodeStats(
  playerId: string,
  episodeId: string
): Promise<PlayerEpisodeStats> {
  const supabase = await createClient();

  // Conta i nodi totali dell'episodio (main_story)
  const { count: totalNodes } = await supabase
    .from('content_nodes')
    .select('*', { count: 'exact', head: true })
    .eq('episode_id', episodeId)
    .eq('node_category', 'main_story');

  // Conta i nodi completati dal giocatore (hanno un progress_item associato)
  const { data: completedNodes } = await supabase
    .from('player_steps')
    .select(`
      item_id,
      progress_items!inner (
        node_id,
        content_nodes!inner (
          episode_id,
          node_category
        )
      )
    `)
    .eq('player_id', playerId)
    .eq('episode_id', episodeId);

  // Filtra solo main_story
  const mainStoryCompleted = (completedNodes as PlayerStepWithNode[] | null)?.filter(
    (step) => 
      step.progress_items?.content_nodes?.node_category === 'main_story'
  ).length || 0;

  const percentage = totalNodes && totalNodes > 0 
    ? Math.round((mainStoryCompleted / totalNodes) * 100) 
    : 0;

  return {
    nodesCompleted: mainStoryCompleted,
    nodesTotal: totalNodes || 0,
    completionPercentage: percentage,
  };
}

/**
 * Recupera tutti gli effetti attivi di un giocatore in un episodio
 */
// /lib/actions/player-stats-actions.ts

export async function getActiveStatusEffects(
  playerId: string,
  episodeId: string
): Promise<ActiveStatusEffect[]> {
  const supabase = await createClient();

  // Query più semplice - prendi tutti e filtra dopo
  const { data, error } = await supabase
    .from('player_status_effects')
    .select('*')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching status effects:', error);
    return [];
  }

  // Filtra lato client gli effetti scaduti
  const now = new Date();
  const activeEffects = (data || []).filter(effect => {
    // Se non ha scadenza, è attivo
    if (!effect.expires_at) return true;
    // Se ha scadenza, controlla se è nel futuro
    return new Date(effect.expires_at) > now;
  });

  console.log('🔍 Active effects found:', activeEffects.length); // Debug log
  
  return activeEffects;
}

/**
 * Recupera statistiche e effetti in un'unica chiamata (ottimizzato)
 */
export async function getPlayerEpisodeStatsAndEffects(
  playerId: string,
  episodeId: string
): Promise<{
  stats: PlayerEpisodeStats;
  effects: ActiveStatusEffect[];
}> {
  const [stats, effects] = await Promise.all([
    getPlayerEpisodeStats(playerId, episodeId),
    getActiveStatusEffects(playerId, episodeId),
  ]);

  return { stats, effects };
}