/**
 * Configurazione dei tipi di status effects
 * Usa questo file per definire tutti i possibili effetti del gioco
 */

export interface StatusEffectConfig {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: 'red' | 'green' | 'blue' | 'purple' | 'amber' | 'slate';
  isPermanent: boolean; // Se true, viene mostrato senza scadenza
}

export const STATUS_EFFECTS_CONFIG: Record<string, StatusEffectConfig> = {
  // ============================================
  // LEGACY EFFECTS (retrocompatibilità)
  // ============================================
  vampiro: {
    type: 'vampiro',
    name: 'Vampiro',
    description: 'Sei stato trasformato in un vampiro',
    icon: '🧛',
    color: 'red',
    isPermanent: true,
  },
  cittadino: {
    type: 'cittadino',
    name: 'Cittadino',
    description: 'Sei un normale cittadino',
    icon: '👤',
    color: 'slate',
    isPermanent: true,
  },
  bloccato: {
    type: 'bloccato',
    name: 'Bloccato',
    description: 'Non puoi raccogliere oggetti tramite QR code',
    icon: '🔒',
    color: 'red',
    isPermanent: false,
  },
  velocizzato: {
    type: 'velocizzato',
    name: 'Velocizzato',
    description: 'Ottieni XP doppio per 10 minuti',
    icon: '⚡',
    color: 'amber',
    isPermanent: false,
  },
  invisibile: {
    type: 'invisibile',
    name: 'Invisibile',
    description: 'Altri giocatori non vedono la tua posizione',
    icon: '👻',
    color: 'purple',
    isPermanent: false,
  },
  protetto: {
    type: 'protetto',
    name: 'Protetto',
    description: 'Immune agli effetti negativi',
    icon: '🛡️',
    color: 'blue',
    isPermanent: false,
  },

  // ============================================
  // IDENTITY EFFECTS
  // ============================================
  'identity:role_vampire': {
    type: 'identity:role_vampire',
    name: 'Vampiro',
    description: 'Creature della notte con poteri oscuri',
    icon: '🧛',
    color: 'red',
    isPermanent: true,
  },
  'identity:role_hunter': {
    type: 'identity:role_hunter',
    name: 'Cacciatore',
    description: 'Esperto nella caccia ai mostri',
    icon: '🏹',
    color: 'green',
    isPermanent: true,
  },
  'identity:role_citizen': {
    type: 'identity:role_citizen',
    name: 'Cittadino',
    description: 'Un normale cittadino',
    icon: '👤',
    color: 'slate',
    isPermanent: true,
  },
  'identity:faction_rebels': {
    type: 'identity:faction_rebels',
    name: 'Ribelli',
    description: 'Membro della fazione ribelle',
    icon: '⚔️',
    color: 'red',
    isPermanent: true,
  },
  'identity:faction_empire': {
    type: 'identity:faction_empire',
    name: 'Impero',
    description: 'Membro dell\'impero',
    icon: '👑',
    color: 'blue',
    isPermanent: true,
  },

  // ============================================
  // SCANNER EFFECTS
  // ============================================
  'scanner:blocked': {
    type: 'scanner:blocked',
    name: 'Scanner Bloccato',
    description: 'Non puoi scansionare QR code',
    icon: '🚫',
    color: 'red',
    isPermanent: false,
  },
  'scanner:cooldown_modifier': {
    type: 'scanner:cooldown_modifier',
    name: 'Cooldown Modificato',
    description: 'Velocità di scansione modificata',
    icon: '⏱️',
    color: 'amber',
    isPermanent: false,
  },
  'scanner:zone_forbidden': {
    type: 'scanner:zone_forbidden',
    name: 'Zona Proibita',
    description: 'Non puoi scansionare in quest\'area',
    icon: '🚷',
    color: 'red',
    isPermanent: false,
  },
  'scanner:loot_boost': {
    type: 'scanner:loot_boost',
    name: 'Loot Potenziato',
    description: 'Maggiore probabilità di drop rari',
    icon: '💎',
    color: 'purple',
    isPermanent: false,
  },

  // ============================================
  // MULTIPLIER EFFECTS
  // ============================================
  'multiplier:xp_boost': {
    type: 'multiplier:xp_boost',
    name: 'Boost XP',
    description: 'Guadagni XP extra',
    icon: '⚡',
    color: 'amber',
    isPermanent: false,
  },
  'multiplier:drop_rate': {
    type: 'multiplier:drop_rate',
    name: 'Fortuna',
    description: 'Aumenta la probabilità di drop',
    icon: '🍀',
    color: 'green',
    isPermanent: false,
  },
  'multiplier:currency_bonus': {
    type: 'multiplier:currency_bonus',
    name: 'Ricchezza',
    description: 'Guadagni valuta extra',
    icon: '💰',
    color: 'amber',
    isPermanent: false,
  },
  'multiplier:speed': {
    type: 'multiplier:speed',
    name: 'Velocità',
    description: 'Ti muovi più velocemente',
    icon: '💨',
    color: 'blue',
    isPermanent: false,
  },

  // ============================================
  // PROTECTION EFFECTS
  // ============================================
  'protection:shield': {
    type: 'protection:shield',
    name: 'Scudo',
    description: 'Assorbe danni in arrivo',
    icon: '🛡️',
    color: 'blue',
    isPermanent: false,
  },
  'protection:antivirus': {
    type: 'protection:antivirus',
    name: 'Antivirus',
    description: 'Immune a specifici effetti negativi',
    icon: '💊',
    color: 'green',
    isPermanent: false,
  },
  'protection:damage_reduction': {
    type: 'protection:damage_reduction',
    name: 'Resistenza',
    description: 'Riduci i danni subiti',
    icon: '🦾',
    color: 'purple',
    isPermanent: false,
  },
  'protection:revive': {
    type: 'protection:revive',
    name: 'Rinascita',
    description: 'Puoi rinascere quando muori',
    icon: '🔄',
    color: 'amber',
    isPermanent: false,
  },

  // ============================================
  // NETWORK EFFECTS
  // ============================================
  'network:invisible_map': {
    type: 'network:invisible_map',
    name: 'Invisibile',
    description: 'Non appari sulla mappa degli altri',
    icon: '👻',
    color: 'purple',
    isPermanent: false,
  },
  'network:visible_to_faction': {
    type: 'network:visible_to_faction',
    name: 'Visibilità Limitata',
    description: 'Solo la tua fazione ti vede',
    icon: '👁️',
    color: 'blue',
    isPermanent: false,
  },
  'network:contagion_active': {
    type: 'network:contagion_active',
    name: 'Contagioso',
    description: 'Puoi diffondere effetti ad altri',
    icon: '🦠',
    color: 'red',
    isPermanent: false,
  },
  'network:group_xp_share': {
    type: 'network:group_xp_share',
    name: 'Condivisione XP',
    description: 'Condividi XP con giocatori vicini',
    icon: '🤝',
    color: 'green',
    isPermanent: false,
  },
};

/**
 * Ottiene la configurazione di un effetto
 */
export function getEffectConfig(type: string): StatusEffectConfig | undefined {
  return STATUS_EFFECTS_CONFIG[type];
}

/**
 * Formatta il tempo rimanente in formato leggibile
 */
export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return 'Scaduto';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  
  return `${seconds}s`;
}