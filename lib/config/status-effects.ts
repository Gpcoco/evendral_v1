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
  // Effetti Permanenti
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
  
  // Effetti Temporanei
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