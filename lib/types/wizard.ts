// /lib/types/wizard.ts
// ===========================================
// WIZARD TYPES
// ===========================================

export type NodeCategory = 'main_story' | 'side_quest' | 'tutorial' | 'ending';

// Condition Types
export type ConditionType = 
  | 'completed_progress'
  | 'player_experience'
  | 'player_level'
  | 'has_inventory_item'
  | 'has_achievement'
  | 'has_status_effect'
  | 'gps_location';

// Target Types
export type TargetType = 
  | 'gps_location'
  | 'code_entry'
  | 'owned_item';

// Effect Types
export type EffectType = 
  | 'grant_progress_item'
  | 'grant_inventory_item'
  | 'modify_experience'
  | 'modify_level'
  | 'grant_achievement'
  | 'add_status_effect';

// Data Structures
export interface ConditionData {
  type: ConditionType;
  payload: Record<string, unknown>;
  tempId: string; // Per tracking UI prima del salvataggio DB
}

export interface TargetData {
  type: TargetType;
  payload: Record<string, unknown>;
  tempId: string; // Necessario per integrazione con HTML editor
}

export interface EffectData {
  type: EffectType;
  payload: Record<string, unknown>;
  tempId: string;
}

// Wizard State
export interface WizardState {
  // Basic info (compilato nello step 4)
  name: string;
  category: NodeCategory;
  hideProgressItemId: string | null; // AGGIUNTO: Nascondi nodo quando player ha questo progress item
  
  // Game logic (compilati negli step 1-3)
  conditions: ConditionData[];
  targets: TargetData[];
  effects: EffectData[];
  
  // Content (compilato nello step 4)
  contentHtml: string;
  
  // Navigation
  currentStep: number;
}

// Dropdown Data (caricati dal server)
export interface DropdownData {
  progressItems: Array<{progress_item_id: string, name: string}>;
  inventoryItems: Array<{item_id: string, name: string}>;
  achievements: Array<{achievement_id: string, name: string}>;
}

// Step Configuration
export interface WizardStep {
  id: number;
  name: string;
  description: string;
  icon: string;
}

// Existing Node Structure (from DB)
export interface ExistingNodeCondition {
  condition_id: string;
  type: string;
  payload: Record<string, unknown>;
}

export interface ExistingNodeTarget {
  target_id: string;
  type: string;
  payload: Record<string, unknown>;
}

export interface ExistingNodeEffect {
  effect_id: string;
  type: string;
  payload: Record<string, unknown>;
}

export interface ExistingNode {
  node_id: string;
  name: string;
  node_category: string;
  content_html: string;
  hide_progress_item_id: string | null; // AGGIUNTO
  conditions: ExistingNodeCondition[];
  targets: ExistingNodeTarget[];
  effects: ExistingNodeEffect[];
}