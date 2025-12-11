// /lib/effects/engine/dynamic.ts

import {
  EFFECT_PREFIXES,
  MultiplierPayload,
  ProtectionShieldPayload,
  ProtectionAntivirusPayload,
  ProtectionDamageReductionPayload,
  ProtectionRevivePayload,
  EffectType,
} from '../types';
import { getEffectsByPrefix } from './core';

// ============================================
// MULTIPLIER EFFECTS (Dynamic)
// ============================================

/**
 * Calcola il multiplier totale per un tipo specifico
 * Combina tutti gli effetti multiplier attivi che si applicano
 * 
 * @example
 * Player ha: multiplier:xp_boost (2.0) + multiplier:xp_boost (1.5)
 * Risultato: 3.5x (somma)
 */
export async function calculateMultiplier(
  playerId: string,
  episodeId: string,
  multiplierType: 'xp_boost' | 'drop_rate' | 'currency_bonus' | 'speed',
  appliesTo?: string
): Promise<number> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.MULTIPLIER);
  
  let totalMultiplier = 1.0; // Base multiplier
  
  for (const effect of effects) {
    // Verifica che sia il tipo giusto
    if (!effect.status_type.includes(multiplierType)) continue;
    
    const payload = effect.metadata as MultiplierPayload;
    
    // Se appliesTo è specificato, controlla se questo effetto si applica
    if (appliesTo && payload.applies_to) {
      if (!payload.applies_to.includes(appliesTo)) continue;
    }
    
    // Somma i multipliers (non moltiplica, perché altrimenti esplode)
    // 1.5x + 2.0x = 3.5x (non 3.0x)
    totalMultiplier += (payload.multiplier - 1.0);
  }
  
  return totalMultiplier;
}

/**
 * Applica un multiplier a un valore
 * 
 * @example
 * applyMultiplier(100, 2.5) → 250
 */
export function applyMultiplierToValue(baseValue: number, multiplier: number): number {
  return Math.floor(baseValue * multiplier);
}

/**
 * Helper: Calcola XP con boost attivi
 */
export async function calculateXpWithBoost(
  playerId: string,
  episodeId: string,
  baseXp: number,
  source?: string
): Promise<number> {
  const multiplier = await calculateMultiplier(playerId, episodeId, 'xp_boost', source);
  return applyMultiplierToValue(baseXp, multiplier);
}

/**
 * Helper: Calcola drop rate con boost attivi
 */
export async function calculateDropRateWithBoost(
  playerId: string,
  episodeId: string,
  baseRate: number,
  itemCategory?: string
): Promise<number> {
  const multiplier = await calculateMultiplier(playerId, episodeId, 'drop_rate', itemCategory);
  return Math.min(1.0, baseRate * multiplier); // Cap a 100%
}

/**
 * Helper: Calcola currency con bonus attivi
 */
export async function calculateCurrencyWithBonus(
  playerId: string,
  episodeId: string,
  baseAmount: number
): Promise<number> {
  const multiplier = await calculateMultiplier(playerId, episodeId, 'currency_bonus');
  return applyMultiplierToValue(baseAmount, multiplier);
}

// ============================================
// PROTECTION EFFECTS (Dynamic)
// ============================================

/**
 * Ottiene tutti gli shield attivi di un player
 * Ritorna lista ordinata per absorb_amount (più forti prima)
 */
export async function getActiveShields(
  playerId: string,
  episodeId: string
): Promise<ProtectionShieldPayload[]> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.PROTECTION);
  
  const shields = effects
    .filter(e => e.status_type === 'protection:shield')
    .map(e => e.metadata as ProtectionShieldPayload)
    .sort((a, b) => (b.absorb_amount - a.absorb_amount)); // Più forti prima
  
  return shields;
}

/**
 * Applica damage agli shield del player
 * Ritorna damage rimanente dopo assorbimento
 * 
 * @example
 * Player ha shield: 50 absorb
 * Riceve 80 damage
 * Shield assorbe 50, ritorna 30 damage rimanente
 * 
 * NOTA: Questa funzione NON aggiorna il database
 * Devi chiamare updateShieldAbsorb() dopo per salvare lo stato
 */
export async function applyDamageToShields(
  playerId: string,
  episodeId: string,
  incomingDamage: number
): Promise<{
  remainingDamage: number;
  shieldsDestroyed: number;
  updatedShields: Array<{ effectId: string; newAbsorb: number }>;
}> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.PROTECTION);
  
  const shieldEffects = effects
    .filter(e => e.status_type === 'protection:shield')
    .sort((a, b) => {
      const payloadA = a.metadata as ProtectionShieldPayload;
      const payloadB = b.metadata as ProtectionShieldPayload;
      return (payloadB.absorb_amount - payloadA.absorb_amount);
    });
  
  let remainingDamage = incomingDamage;
  let shieldsDestroyed = 0;
  const updatedShields: Array<{ effectId: string; newAbsorb: number }> = [];
  
  for (const effect of shieldEffects) {
    if (remainingDamage <= 0) break;
    
    const shield = effect.metadata as ProtectionShieldPayload;
    const currentAbsorb = shield.remaining_absorb ?? shield.absorb_amount;
    
    if (currentAbsorb <= remainingDamage) {
      // Shield distrutto completamente
      remainingDamage -= currentAbsorb;
      shieldsDestroyed++;
      updatedShields.push({
        effectId: effect.status_effect_id,
        newAbsorb: 0,
      });
    } else {
      // Shield parzialmente danneggiato
      updatedShields.push({
        effectId: effect.status_effect_id,
        newAbsorb: currentAbsorb - remainingDamage,
      });
      remainingDamage = 0;
    }
  }
  
  return {
    remainingDamage,
    shieldsDestroyed,
    updatedShields,
  };
}

/**
 * Verifica se il player è immune a un effetto specifico (antivirus)
 */
export async function isImmuneToEffect(
  playerId: string,
  episodeId: string,
  effectType: EffectType
): Promise<boolean> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.PROTECTION);
  
  const antiviruses = effects.filter(e => e.status_type === 'protection:antivirus');
  
  for (const effect of antiviruses) {
    const payload = effect.metadata as ProtectionAntivirusPayload;
    if (payload.immune_to_types.includes(effectType)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calcola riduzione damage totale da tutti gli effetti attivi
 * 
 * @example
 * Player ha: damage_reduction (25%) + damage_reduction (10%)
 * Risultato: 35% riduzione totale
 */
export async function calculateDamageReduction(
  playerId: string,
  episodeId: string
): Promise<number> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.PROTECTION);
  
  const reductions = effects
    .filter(e => e.status_type === 'protection:damage_reduction')
    .map(e => e.metadata as ProtectionDamageReductionPayload);
  
  let totalReduction = 0;
  
  for (const reduction of reductions) {
    totalReduction += reduction.reduction_percent;
  }
  
  // Cap a 90% (altrimenti diventa invincibile)
  return Math.min(90, totalReduction);
}

/**
 * Applica riduzione damage a un valore
 * 
 * @example
 * applyDamageReduction(100, 35) → 65 (riduzione 35%)
 */
export function applyDamageReductionToValue(damage: number, reductionPercent: number): number {
  return Math.floor(damage * (1 - reductionPercent / 100));
}

/**
 * Verifica se il player ha revive disponibile
 * Ritorna il numero di revive rimanenti
 */
export async function getReviveCount(
  playerId: string,
  episodeId: string
): Promise<number> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.PROTECTION);
  
  const revives = effects.filter(e => e.status_type === 'protection:revive');
  
  let totalRevives = 0;
  
  for (const effect of revives) {
    const payload = effect.metadata as ProtectionRevivePayload;
    totalRevives += payload.times_remaining;
  }
  
  return totalRevives;
}

/**
 * Consuma un revive
 * Decrementa times_remaining del primo revive disponibile
 * 
 * NOTA: Questa funzione NON aggiorna il database
 * Devi chiamare updateReviveCount() dopo per salvare lo stato
 */
export async function consumeRevive(
  playerId: string,
  episodeId: string
): Promise<{ consumed: boolean; effectId?: string; newCount?: number }> {
  const effects = await getEffectsByPrefix(playerId, episodeId, EFFECT_PREFIXES.PROTECTION);
  
  const reviveEffect = effects.find(e => {
    if (e.status_type !== 'protection:revive') return false;
    const payload = e.metadata as ProtectionRevivePayload;
    return payload.times_remaining > 0;
  });
  
  if (!reviveEffect) {
    return { consumed: false };
  }
  
  const payload = reviveEffect.metadata as ProtectionRevivePayload;
  const newCount = payload.times_remaining - 1;
  
  return {
    consumed: true,
    effectId: reviveEffect.status_effect_id,
    newCount,
  };
}

// ============================================
// COMBINED HELPERS
// ============================================

/**
 * Helper completo: Calcola damage finale dopo tutti i protection effects
 * 
 * 1. Applica damage reduction
 * 2. Applica shields
 * 3. Ritorna damage che passa oltre le protezioni
 */
export async function calculateFinalDamage(
  playerId: string,
  episodeId: string,
  incomingDamage: number
): Promise<{
  finalDamage: number;
  damageReduced: number;
  damageAbsorbed: number;
  shieldsDestroyed: number;
}> {
  // Step 1: Damage reduction
  const reductionPercent = await calculateDamageReduction(playerId, episodeId);
  const damageAfterReduction = applyDamageReductionToValue(incomingDamage, reductionPercent);
  const damageReduced = incomingDamage - damageAfterReduction;
  
  // Step 2: Shields
  const shieldResult = await applyDamageToShields(playerId, episodeId, damageAfterReduction);
  const damageAbsorbed = damageAfterReduction - shieldResult.remainingDamage;
  
  return {
    finalDamage: shieldResult.remainingDamage,
    damageReduced,
    damageAbsorbed,
    shieldsDestroyed: shieldResult.shieldsDestroyed,
  };
}

/**
 * Debug helper: Stampa tutti gli effetti dynamic attivi
 */
export async function debugDynamicEffects(
  playerId: string,
  episodeId: string
): Promise<void> {
  console.log('\n=== DYNAMIC EFFECTS DEBUG ===');
  
  // Multipliers
  const xpBoost = await calculateMultiplier(playerId, episodeId, 'xp_boost');
  const dropBoost = await calculateMultiplier(playerId, episodeId, 'drop_rate');
  const currencyBoost = await calculateMultiplier(playerId, episodeId, 'currency_bonus');
  const speedBoost = await calculateMultiplier(playerId, episodeId, 'speed');
  
  console.log('Multipliers:');
  console.log(`  XP: ${xpBoost}x`);
  console.log(`  Drop Rate: ${dropBoost}x`);
  console.log(`  Currency: ${currencyBoost}x`);
  console.log(`  Speed: ${speedBoost}x`);
  
  // Protections
  const shields = await getActiveShields(playerId, episodeId);
  const damageReduction = await calculateDamageReduction(playerId, episodeId);
  const reviveCount = await getReviveCount(playerId, episodeId);
  
  console.log('\nProtections:');
  console.log(`  Active Shields: ${shields.length} (total absorb: ${shields.reduce((sum, s) => sum + s.absorb_amount, 0)})`);
  console.log(`  Damage Reduction: ${damageReduction}%`);
  console.log(`  Revives: ${reviveCount}`);
  
  console.log('=============================\n');
}