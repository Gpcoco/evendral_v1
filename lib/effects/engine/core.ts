// /lib/effects/engine/core.ts

import { createClient } from '@/lib/supabase/server';
import {
  EFFECT_PREFIXES,
  EffectPrefix,
  ParsedEffectType,
  PlayerStatusEffect,
  EffectApplicationResult,
  EffectCheckResult,
  EffectPayload,
  JsonValue,
} from '../types';
import { 
  applyHardCodedEffect, 
  removeHardCodedEffect 
} from './hard-coded';

// ============================================
// PARSING UTILITIES
// ============================================

/**
 * Parsa un effect type e estrae prefisso + nome specifico
 * @example parseEffectType('scanner:blocked') → { prefix: 'scanner', specific: 'blocked', full_type: 'scanner:blocked' }
 */
export function parseEffectType(effectType: string): ParsedEffectType {
  const parts = effectType.split(':');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid effect type format: "${effectType}". Expected "prefix:name"`);
  }

  const [prefix, specific] = parts;

  // Valida che il prefisso sia supportato
  const validPrefixes = Object.values(EFFECT_PREFIXES);
  if (!validPrefixes.includes(prefix as EffectPrefix)) {
    throw new Error(
      `Unknown effect prefix: "${prefix}". Valid prefixes: ${validPrefixes.join(', ')}`
    );
  }

  return {
    prefix: prefix as EffectPrefix,
    specific,
    full_type: effectType,
  };
}

/**
 * Verifica se un effetto è hard-coded o dynamic
 */
export function isHardCodedEffect(effectType: string): boolean {
  const { prefix } = parseEffectType(effectType);
  
  const hardCodedPrefixes: EffectPrefix[] = [
    EFFECT_PREFIXES.SCANNER,
    EFFECT_PREFIXES.IDENTITY,
    EFFECT_PREFIXES.NETWORK,
  ];
  
  return hardCodedPrefixes.includes(prefix);
}

/**
 * Verifica se un effetto è dynamic (sicuro, solo JSON)
 */
export function isDynamicEffect(effectType: string): boolean {
  const { prefix } = parseEffectType(effectType);
  
  const dynamicPrefixes: EffectPrefix[] = [
    EFFECT_PREFIXES.MULTIPLIER,
    EFFECT_PREFIXES.PROTECTION,
  ];
  
  return dynamicPrefixes.includes(prefix);
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Applica un effetto a un player
 * Inserisce record in player_status_effects e chiama logica hard-coded se necessario
 */
export async function applyEffect(
  playerId: string,
  episodeId: string,
  effectType: string,
  metadata: EffectPayload | Record<string, JsonValue>,
  expiresAt?: Date | null
): Promise<EffectApplicationResult> {
  try {
    // Valida effect type
    const parsed = parseEffectType(effectType);
    
    const supabase = await createClient();

    // Controlla se il player ha già questo effetto attivo
    const { data: existing } = await supabase
      .from('player_status_effects')
      .select('*')
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .eq('status_type', effectType)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        message: `Player already has effect "${effectType}" active`,
      };
    }

    // Inserisci nuovo effetto
    const { data: appliedEffect, error } = await supabase
      .from('player_status_effects')
      .insert({
        player_id: playerId,
        episode_id: episodeId,
        status_type: effectType,
        metadata: metadata as Record<string, JsonValue>,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    // Se è hard-coded, chiama la logica specifica
    if (isHardCodedEffect(effectType)) {
      await applyHardCodedEffect(playerId, episodeId, parsed, metadata);
    }

    return {
      success: true,
      message: `Effect "${effectType}" applied successfully`,
      applied_effect: appliedEffect,
    };

  } catch (error) {
    console.error('Error applying effect:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Rimuove un effetto da un player
 */
export async function removeEffect(
  playerId: string,
  episodeId: string,
  effectType: string
): Promise<EffectApplicationResult> {
  try {
    const parsed = parseEffectType(effectType);
    const supabase = await createClient();

    // Recupera l'effetto prima di cancellarlo (per cleanup hard-coded)
    const { data: effect } = await supabase
      .from('player_status_effects')
      .select('*')
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .eq('status_type', effectType)
      .maybeSingle();

    if (!effect) {
      return {
        success: false,
        message: `Effect "${effectType}" not found`,
      };
    }

    // Cancella effetto
    const { error } = await supabase
      .from('player_status_effects')
      .delete()
      .eq('status_effect_id', effect.status_effect_id);

    if (error) throw error;

    // Se è hard-coded, chiama cleanup
    if (isHardCodedEffect(effectType)) {
      await removeHardCodedEffect(playerId, episodeId, parsed, effect.metadata);
    }

    return {
      success: true,
      message: `Effect "${effectType}" removed successfully`,
    };

  } catch (error) {
    console.error('Error removing effect:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Controlla se un player ha un effetto specifico attivo
 */
export async function checkEffect(
  playerId: string,
  episodeId: string,
  effectType: string
): Promise<EffectCheckResult> {
  try {
    parseEffectType(effectType); // Valida tipo
    
    const supabase = await createClient();

    const { data: effects } = await supabase
      .from('player_status_effects')
      .select('*')
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .eq('status_type', effectType);

    return {
      has_effect: (effects?.length ?? 0) > 0,
      active_effects: effects ?? [],
      metadata: effects?.[0]?.metadata,
    };

  } catch (error) {
    console.error('Error checking effect:', error);
    return {
      has_effect: false,
      active_effects: [],
    };
  }
}

/**
 * Ottiene tutti gli effetti attivi di un player in un episodio
 */
export async function getActiveEffects(
  playerId: string,
  episodeId: string
): Promise<PlayerStatusEffect[]> {
  try {
    const supabase = await createClient();

    const { data: effects } = await supabase
      .from('player_status_effects')
      .select('*')
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .order('applied_at', { ascending: false });

    return effects ?? [];

  } catch (error) {
    console.error('Error getting active effects:', error);
    return [];
  }
}

/**
 * Ottiene effetti filtrati per prefisso
 */
export async function getEffectsByPrefix(
  playerId: string,
  episodeId: string,
  prefix: EffectPrefix
): Promise<PlayerStatusEffect[]> {
  const allEffects = await getActiveEffects(playerId, episodeId);
  
  return allEffects.filter(effect => {
    try {
      const parsed = parseEffectType(effect.status_type);
      return parsed.prefix === prefix;
    } catch {
      return false;
    }
  });
}

/**
 * Rimuove tutti gli effetti scaduti di un player
 */
export async function cleanExpiredEffects(
  playerId: string,
  episodeId: string
): Promise<number> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Recupera effetti scaduti per cleanup hard-coded
    const { data: expired } = await supabase
      .from('player_status_effects')
      .select('*')
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    if (!expired || expired.length === 0) return 0;

    // Cleanup hard-coded effects
    for (const effect of expired) {
      if (isHardCodedEffect(effect.status_type)) {
        try {
          const parsed = parseEffectType(effect.status_type);
          await removeHardCodedEffect(playerId, episodeId, parsed, effect.metadata);
        } catch (error) {
          console.error('Error cleaning hard-coded effect:', error);
        }
      }
    }

    // Cancella tutti gli effetti scaduti
    const { error } = await supabase
      .from('player_status_effects')
      .delete()
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    if (error) throw error;

    return expired.length;

  } catch (error) {
    console.error('Error cleaning expired effects:', error);
    return 0;
  }
}