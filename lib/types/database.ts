export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Item {
  item_id: string;
  adventure_id: string | null;
  episode_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  rarity: ItemRarity;
  icon_url: string | null;
  is_stackable: boolean;
  is_consumable: boolean;
  max_stack: number;
  base_value: number | null;
  custom_data: Record<string, string | number | boolean | null>;
  created_at: string;
}

export type ItemInsert = Omit<Item, 'item_id' | 'created_at'>;
export type ItemUpdate = Partial<ItemInsert>;


export interface Episode {
  episode_id: string;
  adventure_id: string;
  episode_number: number | null;
  name: string;
  slug: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  max_players: number | null;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type EpisodeInsert = Omit<Episode, 'episode_id' | 'created_at' | 'updated_at'>;
export type EpisodeUpdate = Partial<EpisodeInsert>;

export type NodeCategory = 'main_story' | 'side_quest' | 'tutorial' | 'ending';

export interface ContentNode {
  node_id: string;
  episode_id: string;
  name: string;
  node_category: NodeCategory;
  content_html: string;
  custom_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ContentNodeInsert = Omit<ContentNode, 'node_id' | 'created_at' | 'updated_at'>;


export interface Condition {
  condition_id: string;
  node_id: string;
  episode_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Target {
  target_id: string;
  node_id: string;
  episode_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Effect {
  effect_id: string;
  node_id: string;
  episode_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export type ConditionInsert = Omit<Condition, 'condition_id' | 'created_at'>;
export type TargetInsert = Omit<Target, 'target_id' | 'created_at'>;
export type EffectInsert = Omit<Effect, 'effect_id' | 'created_at'>;