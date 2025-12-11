// /lib/actions/effects.ts
'use server';

import {
  applyEffect,
  removeEffect,
  checkEffect,
  getActiveEffects,
  getEffectsByPrefix,
  cleanExpiredEffects,
  parseEffectType,
  isHardCodedEffect,
  isDynamicEffect,
} from '@/lib/effects/engine/core';

import {
  calculateXpWithBoost,
  calculateDropRateWithBoost,
  calculateCurrencyWithBonus,
  calculateMultiplier,
  getActiveShields,
  calculateDamageReduction,
  getReviveCount,
  calculateFinalDamage,
  isImmuneToEffect,
} from '@/lib/effects/engine/dynamic';

import {
  EffectType,
  EffectPrefix,
  EffectPayload,
  JsonValue,
  EffectApplicationResult,
  EffectCheckResult,
  PlayerStatusEffect,
} from '@/lib/effects/types';

// ============================================
// APPLY & REMOVE EFFECTS
// ============================================

/**
 * Applica un effetto a un player
 * Validazione + inserimento DB + logica hard-coded
 */
export async function applyEffectAction(
  playerId: string,
  episodeId: string,
  effectType: string,
  metadata: EffectPayload | Record<string, JsonValue>,
  expiresInMinutes?: number
): Promise<EffectApplicationResult> {
  try {
    // Validazione basic
    if (!playerId || !episodeId || !effectType) {
      return {
        success: false,
        message: 'Missing required parameters',
      };
    }

    // Calcola expiration
    let expiresAt: Date | null = null;
    if (expiresInMinutes && expiresInMinutes > 0) {
      expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    }

    return await applyEffect(playerId, episodeId, effectType, metadata, expiresAt);

  } catch (error) {
    console.error('Error in applyEffectAction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Rimuove un effetto da un player
 */
export async function removeEffectAction(
  playerId: string,
  episodeId: string,
  effectType: string
): Promise<EffectApplicationResult> {
  try {
    if (!playerId || !episodeId || !effectType) {
      return {
        success: false,
        message: 'Missing required parameters',
      };
    }

    return await removeEffect(playerId, episodeId, effectType);

  } catch (error) {
    console.error('Error in removeEffectAction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Rimuove tutti gli effetti scaduti di un player
 * Da chiamare periodicamente (es. all'inizio sessione gameplay)
 */
export async function cleanExpiredEffectsAction(
  playerId: string,
  episodeId: string
): Promise<{ success: boolean; cleaned: number }> {
  try {
    const cleaned = await cleanExpiredEffects(playerId, episodeId);
    return { success: true, cleaned };
  } catch (error) {
    console.error('Error cleaning expired effects:', error);
    return { success: false, cleaned: 0 };
  }
}

// ============================================
// CHECK & GET EFFECTS
// ============================================

/**
 * Verifica se un player ha un effetto specifico attivo
 */
export async function checkEffectAction(
  playerId: string,
  episodeId: string,
  effectType: string
): Promise<EffectCheckResult> {
  return await checkEffect(playerId, episodeId, effectType);
}

/**
 * Ottiene tutti gli effetti attivi di un player
 */
export async function getActiveEffectsAction(
  playerId: string,
  episodeId: string
): Promise<PlayerStatusEffect[]> {
  return await getActiveEffects(playerId, episodeId);
}

/**
 * Ottiene effetti filtrati per prefisso
 */
export async function getEffectsByPrefixAction(
  playerId: string,
  episodeId: string,
  prefix: EffectPrefix
): Promise<PlayerStatusEffect[]> {
  return await getEffectsByPrefix(playerId, episodeId, prefix);
}

// ============================================
// MULTIPLIER HELPERS (Dynamic)
// ============================================

/**
 * Calcola XP con tutti i boost attivi
 * Da usare quando assegni XP al player
 */
export async function calculateXpWithBoostAction(
  playerId: string,
  episodeId: string,
  baseXp: number,
  source?: string
): Promise<number> {
  return await calculateXpWithBoost(playerId, episodeId, baseXp, source);
}

/**
 * Calcola drop rate con boost attivi
 * Da usare nel QR scanner per aumentare probabilità drop
 */
export async function calculateDropRateWithBoostAction(
  playerId: string,
  episodeId: string,
  baseRate: number,
  itemCategory?: string
): Promise<number> {
  return await calculateDropRateWithBoost(playerId, episodeId, baseRate, itemCategory);
}

/**
 * Calcola currency con bonus attivi
 */
export async function calculateCurrencyWithBonusAction(
  playerId: string,
  episodeId: string,
  baseAmount: number
): Promise<number> {
  return await calculateCurrencyWithBonus(playerId, episodeId, baseAmount);
}

/**
 * Ottiene multiplier generico per un tipo
 */
export async function getMultiplierAction(
  playerId: string,
  episodeId: string,
  multiplierType: 'xp_boost' | 'drop_rate' | 'currency_bonus' | 'speed'
): Promise<number> {
  return await calculateMultiplier(playerId, episodeId, multiplierType);
}

// ============================================
// PROTECTION HELPERS (Dynamic)
// ============================================

/**
 * Calcola damage finale dopo protezioni
 * Da usare in sistemi PvP o PvE
 */
export async function calculateFinalDamageAction(
  playerId: string,
  episodeId: string,
  incomingDamage: number
): Promise<{
  finalDamage: number;
  damageReduced: number;
  damageAbsorbed: number;
  shieldsDestroyed: number;
}> {
  return await calculateFinalDamage(playerId, episodeId, incomingDamage);
}

/**
 * Verifica se player è immune a un effetto
 * Da chiamare prima di applicare effetti di contagio/debuff
 */
export async function isImmuneToEffectAction(
  playerId: string,
  episodeId: string,
  effectType: EffectType
): Promise<boolean> {
  return await isImmuneToEffect(playerId, episodeId, effectType);
}

/**
 * Ottiene info su shield attivi
 */
export async function getActiveShieldsAction(
  playerId: string,
  episodeId: string
): Promise<{ count: number; totalAbsorb: number }> {
  const shields = await getActiveShields(playerId, episodeId);
  const totalAbsorb = shields.reduce((sum, s) => sum + (s.remaining_absorb ?? s.absorb_amount), 0);
  
  return {
    count: shields.length,
    totalAbsorb,
  };
}

/**
 * Ottiene riduzione damage percentuale attiva
 */
export async function getDamageReductionAction(
  playerId: string,
  episodeId: string
): Promise<number> {
  return await calculateDamageReduction(playerId, episodeId);
}

/**
 * Ottiene numero revive disponibili
 */
export async function getReviveCountAction(
  playerId: string,
  episodeId: string
): Promise<number> {
  return await getReviveCount(playerId, episodeId);
}

// ============================================
// VALIDATION & UTILITIES
// ============================================

/**
 * Valida se un effect type è corretto
 */
export async function validateEffectTypeAction(
  effectType: string
): Promise<{ valid: boolean; message?: string; parsed?: { prefix: string; specific: string } }> {
  try {
    const parsed = parseEffectType(effectType);
    return {
      valid: true,
      parsed: {
        prefix: parsed.prefix,
        specific: parsed.specific,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'Invalid effect type',
    };
  }
}

/**
 * Verifica se un effetto è hard-coded
 */
export async function isHardCodedEffectAction(effectType: string): Promise<boolean> {
  try {
    return isHardCodedEffect(effectType);
  } catch {
    return false;
  }
}

/**
 * Verifica se un effetto è dynamic
 */
export async function isDynamicEffectAction(effectType: string): Promise<boolean> {
  try {
    return isDynamicEffect(effectType);
  } catch {
    return false;
  }
}

// ============================================
// ADMIN HELPERS
// ============================================

/**
 * Ottiene summary completo effetti di un player (per admin/debug)
 */
export async function getPlayerEffectsSummaryAction(
  playerId: string,
  episodeId: string
): Promise<{
  total_effects: number;
  hard_coded_count: number;
  dynamic_count: number;
  multipliers: {
    xp: number;
    drop_rate: number;
    currency: number;
    speed: number;
  };
  protections: {
    shields: number;
    damage_reduction: number;
    revives: number;
  };
  effects: PlayerStatusEffect[];
}> {
  const effects = await getActiveEffects(playerId, episodeId);
  
  const hardCodedCount = effects.filter(e => {
    try {
      return isHardCodedEffect(e.status_type);
    } catch {
      return false;
    }
  }).length;
  
  const dynamicCount = effects.length - hardCodedCount;
  
  // Multipliers
  const xpBoost = await calculateMultiplier(playerId, episodeId, 'xp_boost');
  const dropBoost = await calculateMultiplier(playerId, episodeId, 'drop_rate');
  const currencyBoost = await calculateMultiplier(playerId, episodeId, 'currency_bonus');
  const speedBoost = await calculateMultiplier(playerId, episodeId, 'speed');
  
  // Protections
  const shieldsInfo = await getActiveShieldsAction(playerId, episodeId);
  const damageReduction = await calculateDamageReduction(playerId, episodeId);
  const revives = await getReviveCount(playerId, episodeId);
  
  return {
    total_effects: effects.length,
    hard_coded_count: hardCodedCount,
    dynamic_count: dynamicCount,
    multipliers: {
      xp: xpBoost,
      drop_rate: dropBoost,
      currency: currencyBoost,
      speed: speedBoost,
    },
    protections: {
      shields: shieldsInfo.totalAbsorb,
      damage_reduction: damageReduction,
      revives,
    },
    effects,
  };
}

/**
 * Rimuove TUTTI gli effetti di un player (admin/reset)
 */
export async function removeAllPlayerEffectsAction(
  playerId: string,
  episodeId: string
): Promise<{ success: boolean; removed: number }> {
  try {
    const effects = await getActiveEffects(playerId, episodeId);
    
    let removed = 0;
    for (const effect of effects) {
      const result = await removeEffect(playerId, episodeId, effect.status_type);
      if (result.success) removed++;
    }
    
    return { success: true, removed };
  } catch (error) {
    console.error('Error removing all effects:', error);
    return { success: false, removed: 0 };
  }
}