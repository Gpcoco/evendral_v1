// /lib/effects/types/index.ts

// ============================================
// PREFISSI EFFETTI (5 Core)
// ============================================

export const EFFECT_PREFIXES = {
  // Hard-coded (toccano sistemi critici)
  SCANNER: 'scanner',
  IDENTITY: 'identity',
  NETWORK: 'network',
  
  // Dynamic (solo JSON, sicuri)
  MULTIPLIER: 'multiplier',
  PROTECTION: 'protection',
} as const;

export type EffectPrefix = typeof EFFECT_PREFIXES[keyof typeof EFFECT_PREFIXES];

// ============================================
// TYPES SPECIFICI PER PREFISSO
// ============================================

// Scanner effects (hard-coded)
export type ScannerEffectType = 
  | 'scanner:blocked'              // Scanner completamente disabilitato
  | 'scanner:cooldown_modifier'     // Modifica cooldown (payload: multiplier)
  | 'scanner:zone_forbidden'        // Zona proibita (payload: coordinates)
  | 'scanner:loot_boost';          // Bonus drop (payload: multiplier)

// Identity effects (hard-coded)
export type IdentityEffectType =
  | 'identity:role_vampire'         // Ruolo vampiro
  | 'identity:role_hunter'          // Ruolo cacciatore
  | 'identity:role_citizen'         // Ruolo cittadino
  | 'identity:faction_rebels'       // Fazione ribelli
  | 'identity:faction_empire';      // Fazione impero

// Network effects (hard-coded)
export type NetworkEffectType =
  | 'network:invisible_map'         // Invisibile su mappa
  | 'network:visible_to_faction'    // Visibile solo alla faction (payload: faction_id)
  | 'network:contagion_active'      // Può contagiare altri (payload: effect_to_spread)
  | 'network:group_xp_share';       // Condivide XP con gruppo

// Multiplier effects (dynamic)
export type MultiplierEffectType =
  | 'multiplier:xp_boost'           // Boost XP (payload: multiplier)
  | 'multiplier:drop_rate'          // Boost drop rate (payload: multiplier)
  | 'multiplier:currency_bonus'     // Bonus currency (payload: multiplier)
  | 'multiplier:speed';             // Boost velocità (payload: multiplier)

// Protection effects (dynamic)
export type ProtectionEffectType =
  | 'protection:shield'             // Shield damage (payload: absorb_amount)
  | 'protection:antivirus'          // Immune a contagion (payload: immune_types[])
  | 'protection:damage_reduction'   // Riduzione danno (payload: reduction_percent)
  | 'protection:revive';            // Auto-revive (payload: times_remaining)

// Union type di tutti gli effetti tipizzati
export type EffectType = 
  | ScannerEffectType 
  | IdentityEffectType 
  | NetworkEffectType 
  | MultiplierEffectType 
  | ProtectionEffectType;

// ============================================
// PAYLOAD STRUCTURES
// ============================================

// Scanner payloads
export interface ScannerBlockedPayload {
  reason?: string;
  show_message?: string;
}

export interface ScannerCooldownPayload {
  multiplier: number; // 0.5 = metà tempo, 2.0 = doppio tempo
}

export interface ScannerZoneForbiddenPayload {
  lat: number;
  lng: number;
  radius_meters: number;
  message?: string;
}

export interface ScannerLootBoostPayload {
  multiplier: number; // 1.5 = +50% drop
  item_categories?: string[]; // Se vuoi limitare a certe categorie
}

// Identity payloads
export interface IdentityRolePayload {
  role_name: string;
  permissions?: string[];
  restrictions?: string[];
}

export interface IdentityFactionPayload {
  faction_id: string;
  faction_name: string;
}

// Network payloads
export interface NetworkVisibilityPayload {
  visible_to_factions?: string[];
  visible_to_roles?: string[];
}

export interface NetworkContagionPayload {
  effect_type_to_spread: EffectType;
  spread_radius_meters: number;
  spread_chance_percent: number;
  duration_minutes?: number;
}

export interface NetworkGroupXpPayload {
  share_percentage: number; // 50 = condividi 50% XP con gruppo
  max_distance_meters?: number;
}

// Multiplier payloads (tutti simili)
export interface MultiplierPayload {
  multiplier: number;
  applies_to?: string[]; // Opzionale: limita a cosa si applica
}

// Protection payloads
export interface ProtectionShieldPayload {
  absorb_amount: number;
  remaining_absorb?: number; // Stato runtime
}

export interface ProtectionAntivirusPayload {
  immune_to_types: EffectType[];
}

export interface ProtectionDamageReductionPayload {
  reduction_percent: number; // 25 = riduce danno del 25%
}

export interface ProtectionRevivePayload {
  times_remaining: number;
  auto_trigger: boolean;
}

// ============================================
// UNION TYPE PER PAYLOADS
// ============================================

export type EffectPayload = 
  | ScannerBlockedPayload
  | ScannerCooldownPayload
  | ScannerZoneForbiddenPayload
  | ScannerLootBoostPayload
  | IdentityRolePayload
  | IdentityFactionPayload
  | NetworkVisibilityPayload
  | NetworkContagionPayload
  | NetworkGroupXpPayload
  | MultiplierPayload
  | ProtectionShieldPayload
  | ProtectionAntivirusPayload
  | ProtectionDamageReductionPayload
  | ProtectionRevivePayload;

// Type helper per JSON values (permette flessibilità futura)
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// ============================================
// DATABASE TYPES
// ============================================

// Tabella effects (configurazione admin)
export interface Effect {
  effect_id: string;
  node_id: string;
  episode_id: string;
  type: string; // EffectType ma stringa nel DB
  payload: EffectPayload | Record<string, JsonValue>; // ✅ Fixed: no more any
  created_at: string;
}

// Tabella player_status_effects (stato runtime)
export interface PlayerStatusEffect {
  status_effect_id: string;
  player_id: string;
  episode_id: string;
  status_type: string; // EffectType ma stringa nel DB
  applied_at: string;
  expires_at: string | null;
  metadata: EffectPayload | Record<string, JsonValue>; // ✅ Fixed: no more any
}

// ============================================
// UTILITY TYPES
// ============================================

export interface EffectApplicationResult {
  success: boolean;
  message?: string;
  applied_effect?: PlayerStatusEffect;
}

export interface EffectCheckResult {
  has_effect: boolean;
  active_effects: PlayerStatusEffect[];
  metadata?: Record<string, JsonValue>; // ✅ Fixed: no more any
}

// Helper per parsing effect type
export interface ParsedEffectType {
  prefix: EffectPrefix;
  specific: string;
  full_type: string;
}

// ============================================
// ITEM EFFECTS (Nuova tabella)
// ============================================

export type ItemEffectTrigger = 'receive' | 'use' | 'equip' | 'consume';

export interface ItemEffect {
  item_effect_id: string;
  item_id: string;
  effect_type: string; // EffectType come string
  metadata: EffectPayload | Record<string, JsonValue>;
  duration_minutes: number | null;
  trigger_on: ItemEffectTrigger;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemEffectCreateInput {
  item_id: string;
  effect_type: string;
  metadata: EffectPayload | Record<string, JsonValue>;
  duration_minutes?: number | null;
  trigger_on?: ItemEffectTrigger;
}

export interface ItemEffectUpdateInput {
  effect_type?: string;
  metadata?: EffectPayload | Record<string, JsonValue>;
  duration_minutes?: number | null;
  trigger_on?: ItemEffectTrigger;
  is_active?: boolean;
}