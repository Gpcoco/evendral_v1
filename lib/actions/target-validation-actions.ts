'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =====================================================
// TARGET VALIDATION - Player Actions
// =====================================================

interface ValidateTargetResult {
  success: boolean;
  message: string;
  completed?: boolean;
  nodeCompleted?: boolean;
}

/**
 * Validate CODE_ENTRY target
 */
export async function validateCodeEntry(
  playerId: string,
  episodeId: string,
  nodeId: string,
  targetId: string,
  submittedCode: string
): Promise<ValidateTargetResult> {
  const supabase = await createClient();

  // 1. Get target details
  const { data: target, error: targetError } = await supabase
    .from('targets')
    .select('payload')
    .eq('target_id', targetId)
    .eq('type', 'code_entry')
    .single();

  if (targetError || !target) {
    return { success: false, message: 'Target non trovato' };
  }

  const correctCode = target.payload.code as string;

  // 2. Check if code matches (case-sensitive)
  if (submittedCode !== correctCode) {
    return { success: false, message: 'Codice errato! Riprova.' };
  }

  // 3. Mark target as completed
  const { error: progressError } = await supabase
    .from('player_target_progress')
    .upsert({
      player_id: playerId,
      target_id: targetId,
      episode_id: episodeId,
      completed: true,
      completed_at: new Date().toISOString(),
    });

  if (progressError) {
    console.error('Error updating target progress:', progressError);
    return { success: false, message: 'Errore durante il salvataggio' };
  }

  // 4. Check if all node targets are completed
  const nodeCompleted = await checkNodeCompletion(playerId, episodeId, nodeId);

  revalidatePath(`/player/episodes/${episodeId}`);

  return {
    success: true,
    message: 'Codice corretto!',
    completed: true,
    nodeCompleted,
  };
}

/**
 * Validate GPS_LOCATION target
 */
export async function validateGpsLocation(
  playerId: string,
  episodeId: string,
  nodeId: string,
  targetId: string,
  playerLat: number,
  playerLng: number
): Promise<ValidateTargetResult> {
  const supabase = await createClient();

  // 1. Get target details
  const { data: target, error: targetError } = await supabase
    .from('targets')
    .select('payload')
    .eq('target_id', targetId)
    .eq('type', 'gps_location')
    .single();

  if (targetError || !target) {
    return { success: false, message: 'Target non trovato' };
  }

  const targetLat = target.payload.lat as number;
  const targetLng = target.payload.lng as number;
  const radius = target.payload.radius as number;

  // 2. Calculate distance using Haversine formula
  const distance = calculateDistance(playerLat, playerLng, targetLat, targetLng);

  if (distance > radius) {
    return {
      success: false,
      message: `Sei troppo lontano! Devi trovarti entro ${radius}m dalla location. (Distanza attuale: ${Math.round(distance)}m)`,
    };
  }

  // 3. Mark target as completed
  const { error: progressError } = await supabase
    .from('player_target_progress')
    .upsert({
      player_id: playerId,
      target_id: targetId,
      episode_id: episodeId,
      completed: true,
      completed_at: new Date().toISOString(),
      custom_data: { lat: playerLat, lng: playerLng, distance },
    });

  if (progressError) {
    console.error('Error updating target progress:', progressError);
    return { success: false, message: 'Errore durante il salvataggio' };
  }

  // 4. Check if all node targets are completed
  const nodeCompleted = await checkNodeCompletion(playerId, episodeId, nodeId);

  revalidatePath(`/player/episodes/${episodeId}`);

  return {
    success: true,
    message: 'Posizione corretta!',
    completed: true,
    nodeCompleted,
  };
}

/**
 * Check if player owns required item (owned_item target)
 */
export async function checkOwnedItem(
  playerId: string,
  episodeId: string,
  targetId: string
): Promise<{ owned: boolean; itemName: string }> {
  const supabase = await createClient();

  // 1. Get target details
  const { data: target } = await supabase
    .from('targets')
    .select('payload')
    .eq('target_id', targetId)
    .eq('type', 'owned_item')
    .single();

  if (!target) {
    return { owned: false, itemName: 'Unknown' };
  }

  const itemId = target.payload.item_id as string;

  // 2. Get item name
  const { data: item } = await supabase
    .from('items')
    .select('name')
    .eq('item_id', itemId)
    .single();

  // 3. Check if player owns the item in episode inventory
  const { data: inventory } = await supabase
    .from('player_episode_inventory')
    .select('quantity')
    .eq('player_id', playerId)
    .eq('episode_id', episodeId)
    .eq('item_id', itemId)
    .single();

  const owned = !!inventory && inventory.quantity > 0;

  return {
    owned,
    itemName: item?.name || 'Unknown',
  };
}

/**
 * Validate OWNED_ITEM target
 */
export async function validateOwnedItem(
  playerId: string,
  episodeId: string,
  nodeId: string,
  targetId: string
): Promise<ValidateTargetResult> {
  const supabase = await createClient();

  // 1. Check if player owns the item
  const { owned, itemName } = await checkOwnedItem(playerId, episodeId, targetId);

  if (!owned) {
    return {
      success: false,
      message: `Item mancante: ${itemName}`
    };
  }

  // 2. Mark target as completed
  await supabase
    .from('player_target_progress')
    .upsert({
      player_id: playerId,
      target_id: targetId,
      episode_id: episodeId,
      completed: true,
      completed_at: new Date().toISOString(),
    });

  // 3. Check if all node targets are completed
  const nodeCompleted = await checkNodeCompletion(playerId, episodeId, nodeId);

  revalidatePath(`/player/episodes/${episodeId}`);

  return {
    success: true,
    message: `Item posseduto: ${itemName}`,
    completed: true,
    nodeCompleted,
  };
}

/**
 * Check if all targets of a node are completed
 */
export async function checkNodeCompletion(
  playerId: string,
  episodeId: string,
  nodeId: string
): Promise<boolean> {
  const supabase = await createClient();

  // 1. Get all targets for this node
  const { data: targets } = await supabase
    .from('targets')
    .select('target_id, type, payload')
    .eq('node_id', nodeId);

  if (!targets || targets.length === 0) {
    return false;
  }

  // 2. Check completion for each target
  for (const target of targets) {
    if (target.type === 'owned_item') {
      // Check if player owns the item
      const { owned } = await checkOwnedItem(playerId, episodeId, target.target_id);
      if (!owned) return false;
    } else {
      // Check player_target_progress
      const { data: progress } = await supabase
        .from('player_target_progress')
        .select('completed')
        .eq('player_id', playerId)
        .eq('target_id', target.target_id)
        .single();

      if (!progress || !progress.completed) {
        return false;
      }
    }
  }

  // 3. All targets completed - Apply effects
  await applyNodeEffects(playerId, episodeId, nodeId);

  // 4. Mark node as completed (add progress_item if exists)
  const { data: progressItem } = await supabase
    .from('progress_items')
    .select('progress_item_id')
    .eq('node_id', nodeId)
    .single();

  if (progressItem) {
    await supabase.from('player_steps').upsert({
      player_id: playerId,
      item_id: progressItem.progress_item_id,
      episode_id: episodeId,
    });
  }

  return true;
}

/**
 * Apply node effects (rewards) when node is completed
 */
async function applyNodeEffects(
  playerId: string,
  episodeId: string,
  nodeId: string
): Promise<void> {
  const supabase = await createClient();

  // Get all effects for this node
  const { data: effects } = await supabase
    .from('effects')
    .select('type, payload')
    .eq('node_id', nodeId);

  if (!effects || effects.length === 0) return;

  // Apply each effect
  for (const effect of effects) {
    switch (effect.type) {
      case 'grant_progress_item': {
        const itemId = effect.payload.item_id as string;
        await supabase.from('player_steps').upsert({
          player_id: playerId,
          item_id: itemId,
          episode_id: episodeId,
        });
        break;
      }

      case 'grant_inventory_item': {
        const itemId = effect.payload.item_id as string;
        const quantity = effect.payload.quantity as number;
        
        // Check if item already in inventory
        const { data: existing } = await supabase
          .from('player_episode_inventory')
          .select('quantity')
          .eq('player_id', playerId)
          .eq('episode_id', episodeId)
          .eq('item_id', itemId)
          .single();

        if (existing) {
          // Update quantity
          await supabase
            .from('player_episode_inventory')
            .update({ quantity: existing.quantity + quantity })
            .eq('player_id', playerId)
            .eq('episode_id', episodeId)
            .eq('item_id', itemId);
        } else {
          // Insert new item
          await supabase.from('player_episode_inventory').insert({
            player_id: playerId,
            episode_id: episodeId,
            item_id: itemId,
            quantity,
          });
        }
        break;
      }

      case 'modify_experience': {
        const amount = effect.payload.amount as number;
        // Get current player
        const { data: player } = await supabase
          .from('player')
          .select('experience')
          .eq('player_id', playerId)
          .single();

        if (player) {
          await supabase
            .from('player')
            .update({ experience: player.experience + amount })
            .eq('player_id', playerId);
        }
        break;
      }

      case 'modify_level': {
        const amount = effect.payload.amount as number;
        const { data: player } = await supabase
          .from('player')
          .select('level')
          .eq('player_id', playerId)
          .single();

        if (player) {
          await supabase
            .from('player')
            .update({ level: player.level + amount })
            .eq('player_id', playerId);
        }
        break;
      }

      case 'grant_achievement': {
        const achievementId = effect.payload.achievement_id as string;
        await supabase.from('player_achievements').upsert({
          player_id: playerId,
          achievement_id: achievementId,
        });
        break;
      }

      case 'add_status_effect': {
        const statusType = effect.payload.status_type as string;
        const durationMinutes = effect.payload.duration_minutes as number | undefined;
        
        const expiresAt = durationMinutes
          ? new Date(Date.now() + durationMinutes * 60000).toISOString()
          : null;

        await supabase.from('player_status_effects').insert({
          player_id: playerId,
          episode_id: episodeId,
          status_type: statusType,
          expires_at: expiresAt,
        });
        break;
      }
    }
  }
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}