// /lib/effects/engine/hard-coded.ts

import { createClient } from '@/lib/supabase/server';
import {
  EFFECT_PREFIXES,
  ParsedEffectType,
  EffectPayload,
  JsonValue,
  ScannerBlockedPayload,
  ScannerCooldownPayload,
  ScannerZoneForbiddenPayload,
  ScannerLootBoostPayload,
  IdentityRolePayload,
  IdentityFactionPayload,
  NetworkVisibilityPayload,
  NetworkContagionPayload,
  NetworkGroupXpPayload,
} from '../types';

// ============================================
// SCANNER EFFECTS (Hard-coded)
// ============================================

/**
 * scanner:blocked - Blocca completamente lo scanner QR
 */
async function applyScannerBlocked(
  playerId: string,
  episodeId: string,
  payload: ScannerBlockedPayload
): Promise<void> {
  console.log(`[SCANNER:BLOCKED] Player ${playerId} scanner disabled`, payload);
  
  // TODO: Implementazione futura
  // - Aggiungere flag in player_episode_stats o custom_data
  // - Lo scanner controller verificherà questo flag prima di permettere scan
  // - Opzionale: inviare notification push al player con reason
}

async function removeScannerBlocked(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[SCANNER:BLOCKED] Player ${playerId} scanner re-enabled`);
  void episodeId;
  // TODO: Cleanup flag
}

/**
 * scanner:cooldown_modifier - Modifica il cooldown dello scanner
 */
async function applyScannerCooldown(
  playerId: string,
  episodeId: string,
  payload: ScannerCooldownPayload
): Promise<void> {
  console.log(`[SCANNER:COOLDOWN] Player ${playerId} cooldown modifier: ${payload.multiplier}x`);
  
  // TODO: Implementazione futura
  // - Salvare multiplier in player_episode_stats.custom_data
  // - Lo scanner controller leggerà questo valore e applicherà: baseCooldown * multiplier
}

async function removeScannerCooldown(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[SCANNER:COOLDOWN] Player ${playerId} cooldown reset to default`);
  void episodeId;
  // TODO: Reset multiplier a 1.0
}

/**
 * scanner:zone_forbidden - Zona GPS proibita per scanning
 */
async function applyScannerZoneForbidden(
  playerId: string,
  episodeId: string,
  payload: ScannerZoneForbiddenPayload
): Promise<void> {
  console.log(`[SCANNER:ZONE_FORBIDDEN] Player ${playerId} forbidden zone at (${payload.lat}, ${payload.lng}), radius: ${payload.radius_meters}m`);
  
  // TODO: Implementazione futura
  // - Salvare coordinate forbidden zone in player_episode_stats.custom_data
  // - Target GPS validation verificherà distanza da zone proibite
  // - Se player è dentro zona: bloccare submit target
}

async function removeScannerZoneForbidden(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[SCANNER:ZONE_FORBIDDEN] Player ${playerId} forbidden zones cleared`);
  void episodeId;
  // TODO: Rimuovere zone da custom_data
}

/**
 * scanner:loot_boost - Aumenta drop rate dello scanner
 */
async function applyScannerLootBoost(
  playerId: string,
  episodeId: string,
  payload: ScannerLootBoostPayload
): Promise<void> {
  console.log(`[SCANNER:LOOT_BOOST] Player ${playerId} loot multiplier: ${payload.multiplier}x`);
  
  // TODO: Implementazione futura
  // - Salvare multiplier in player_episode_stats.custom_data
  // - Quando assegni items da QR scan: quantità * multiplier
  // - Se payload.item_categories presente: applicare solo a quelle categorie
}

async function removeScannerLootBoost(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[SCANNER:LOOT_BOOST] Player ${playerId} loot boost removed`);
  void episodeId;
  // TODO: Reset multiplier
}

// ============================================
// IDENTITY EFFECTS (Hard-coded)
// ============================================

/**
 * identity:role_* - Assegna ruolo al player (vampiro, cacciatore, cittadino)
 */
async function applyIdentityRole(
  playerId: string,
  episodeId: string,
  payload: IdentityRolePayload
): Promise<void> {
  console.log(`[IDENTITY:ROLE] Player ${playerId} assigned role: ${payload.role_name}`);
  
  const supabase = await createClient();
  
  // Salva ruolo in player_episode_stats
  const { error } = await supabase
    .from('player_episode_stats')
    .upsert({
      player_id: playerId,
      episode_id: episodeId,
      custom_stats: {
        role: payload.role_name,
        permissions: payload.permissions || [],
        restrictions: payload.restrictions || [],
      },
    }, {
      onConflict: 'player_id,episode_id',
    });

  if (error) {
    console.error('Error saving role:', error);
  }
  
  // TODO: Implementazioni future basate su ruolo:
  // - Se "vampire": applicare automaticamente scanner:blocked durante giorno
  // - Se "hunter": bonus XP contro vampiri
  // - Content nodes possono avere condizioni "requires_role: vampire"
}

async function removeIdentityRole(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[IDENTITY:ROLE] Player ${playerId} role removed`);
  
  const supabase = await createClient();
  
  // Reset ruolo
  const { error } = await supabase
    .from('player_episode_stats')
    .update({
      custom_stats: {
        role: null,
      },
    })
    .eq('player_id', playerId)
    .eq('episode_id', episodeId);

  if (error) {
    console.error('Error removing role:', error);
  }
}

/**
 * identity:faction_* - Assegna fazione al player
 */
async function applyIdentityFaction(
  playerId: string,
  episodeId: string,
  payload: IdentityFactionPayload
): Promise<void> {
  console.log(`[IDENTITY:FACTION] Player ${playerId} joined faction: ${payload.faction_name}`);
  
  const supabase = await createClient();
  
  // Salva faction in player_episode_stats
  const { error } = await supabase
    .from('player_episode_stats')
    .upsert({
      player_id: playerId,
      episode_id: episodeId,
      custom_stats: {
        faction_id: payload.faction_id,
        faction_name: payload.faction_name,
      },
    }, {
      onConflict: 'player_id,episode_id',
    });

  if (error) {
    console.error('Error saving faction:', error);
  }
  
  // TODO: Implementazioni future:
  // - Visibilità sulla mappa solo tra membri stessa faction
  // - Quest exclusive per faction
  // - PvP restrictions basate su faction
}

async function removeIdentityFaction(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[IDENTITY:FACTION] Player ${playerId} left faction`);
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('player_episode_stats')
    .update({
      custom_stats: {
        faction_id: null,
        faction_name: null,
      },
    })
    .eq('player_id', playerId)
    .eq('episode_id', episodeId);

  if (error) {
    console.error('Error removing faction:', error);
  }
}

// ============================================
// NETWORK EFFECTS (Hard-coded)
// ============================================

/**
 * network:invisible_map - Rende player invisibile sulla mappa
 */
async function applyNetworkInvisibleMap(
  playerId: string,
  episodeId: string,
  payload: NetworkVisibilityPayload
): Promise<void> {
  console.log(`[NETWORK:INVISIBLE] Player ${playerId} now invisible on map`, payload);
  
  // TODO: Implementazione futura
  // - Salvare flag in player_episode_stats.custom_data
  // - API che ritorna posizioni players verificherà questo flag
  // - Se payload.visible_to_factions: mostrare solo a quelle factions
}

async function removeNetworkInvisibleMap(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[NETWORK:INVISIBLE] Player ${playerId} now visible on map`);
  void episodeId;
  // TODO: Rimuovere flag invisibilità
}

/**
 * network:contagion_active - Abilita contagio di effetti ad altri player
 */
async function applyNetworkContagion(
  playerId: string,
  episodeId: string,
  payload: NetworkContagionPayload
): Promise<void> {
  console.log(`[NETWORK:CONTAGION] Player ${playerId} can now spread: ${payload.effect_type_to_spread}`);
  
  // TODO: Implementazione futura
  // - Salvare config contagio in player_episode_stats.custom_data
  // - Background job ogni N secondi:
  //   1. Trova tutti player con contagion_active
  //   2. Calcola player vicini (entro spread_radius_meters)
  //   3. RNG con spread_chance_percent
  //   4. Se successo: applica effect_type_to_spread al player vicino
  // - Esempio: vampiro contagia "identity:role_vampire" a chi sta vicino
}

async function removeNetworkContagion(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[NETWORK:CONTAGION] Player ${playerId} contagion removed`);
  void episodeId;
  // TODO: Rimuovere config contagio
}

/**
 * network:group_xp_share - Condivide XP con player vicini
 */
async function applyNetworkGroupXpShare(
  playerId: string,
  episodeId: string,
  payload: NetworkGroupXpPayload
): Promise<void> {
  console.log(`[NETWORK:GROUP_XP] Player ${playerId} shares ${payload.share_percentage}% XP with group`);
  
  // TODO: Implementazione futura
  // - Quando player guadagna XP:
  //   1. Calcola player vicini (entro max_distance_meters)
  //   2. Distribuisci (xp_gained * share_percentage / 100) a ciascuno
  //   3. Player originale mantiene XP pieno (bonus per tutti)
}

async function removeNetworkGroupXpShare(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log(`[NETWORK:GROUP_XP] Player ${playerId} no longer shares XP`);
  void episodeId;
  // TODO: Rimuovere config XP sharing
}

// ============================================
// ROUTER PRINCIPALE
// ============================================

/**
 * Router che smista gli effetti hard-coded alle funzioni specifiche
 */
export async function applyHardCodedEffect(
  playerId: string,
  episodeId: string,
  parsed: ParsedEffectType,
  metadata: EffectPayload | Record<string, JsonValue>
): Promise<void> {
  
  // Scanner effects
  if (parsed.prefix === EFFECT_PREFIXES.SCANNER) {
    switch (parsed.full_type) {
      case 'scanner:blocked':
        return applyScannerBlocked(playerId, episodeId, metadata as ScannerBlockedPayload);
      case 'scanner:cooldown_modifier':
        return applyScannerCooldown(playerId, episodeId, metadata as ScannerCooldownPayload);
      case 'scanner:zone_forbidden':
        return applyScannerZoneForbidden(playerId, episodeId, metadata as ScannerZoneForbiddenPayload);
      case 'scanner:loot_boost':
        return applyScannerLootBoost(playerId, episodeId, metadata as ScannerLootBoostPayload);
      default:
        console.warn(`Unknown scanner effect: ${parsed.full_type}`);
    }
  }
  
  // Identity effects
  if (parsed.prefix === EFFECT_PREFIXES.IDENTITY) {
    if (parsed.full_type.startsWith('identity:role_')) {
      return applyIdentityRole(playerId, episodeId, metadata as IdentityRolePayload);
    }
    if (parsed.full_type.startsWith('identity:faction_')) {
      return applyIdentityFaction(playerId, episodeId, metadata as IdentityFactionPayload);
    }
    console.warn(`Unknown identity effect: ${parsed.full_type}`);
  }
  
  // Network effects
  if (parsed.prefix === EFFECT_PREFIXES.NETWORK) {
    switch (parsed.full_type) {
      case 'network:invisible_map':
      case 'network:visible_to_faction':
        return applyNetworkInvisibleMap(playerId, episodeId, metadata as NetworkVisibilityPayload);
      case 'network:contagion_active':
        return applyNetworkContagion(playerId, episodeId, metadata as NetworkContagionPayload);
      case 'network:group_xp_share':
        return applyNetworkGroupXpShare(playerId, episodeId, metadata as NetworkGroupXpPayload);
      default:
        console.warn(`Unknown network effect: ${parsed.full_type}`);
    }
  }
}

/**
 * Router per la rimozione degli effetti hard-coded
 */
export async function removeHardCodedEffect(
  playerId: string,
  episodeId: string,
  parsed: ParsedEffectType,
  metadata: EffectPayload | Record<string, JsonValue>
): Promise<void> {
  
  // Scanner effects
  if (parsed.prefix === EFFECT_PREFIXES.SCANNER) {
    switch (parsed.full_type) {
      case 'scanner:blocked':
        return removeScannerBlocked(playerId, episodeId);
      case 'scanner:cooldown_modifier':
        return removeScannerCooldown(playerId, episodeId);
      case 'scanner:zone_forbidden':
        return removeScannerZoneForbidden(playerId, episodeId);
      case 'scanner:loot_boost':
        return removeScannerLootBoost(playerId, episodeId);
      default:
        console.warn(`Unknown scanner effect: ${parsed.full_type}`);
    }
  }
  
  // Identity effects
  if (parsed.prefix === EFFECT_PREFIXES.IDENTITY) {
    if (parsed.full_type.startsWith('identity:role_')) {
      return removeIdentityRole(playerId, episodeId);
    }
    if (parsed.full_type.startsWith('identity:faction_')) {
      return removeIdentityFaction(playerId, episodeId);
    }
    console.warn(`Unknown identity effect: ${parsed.full_type}`);
  }
  
  // Network effects
  if (parsed.prefix === EFFECT_PREFIXES.NETWORK) {
    switch (parsed.full_type) {
      case 'network:invisible_map':
      case 'network:visible_to_faction':
        return removeNetworkInvisibleMap(playerId, episodeId);
      case 'network:contagion_active':
        return removeNetworkContagion(playerId, episodeId);
      case 'network:group_xp_share':
        return removeNetworkGroupXpShare(playerId, episodeId);
      default:
        console.warn(`Unknown network effect: ${parsed.full_type}`);
    }
  }
  
  // Cleanup metadata (evita warning unused)
  void metadata;
}