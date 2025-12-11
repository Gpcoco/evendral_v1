// /lib/actions/item-effects.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { applyEffectAction } from './effects';
import {
  ItemEffect,
  ItemEffectCreateInput,
  ItemEffectUpdateInput,
  ItemEffectTrigger,
} from '@/lib/effects/types';

// ============================================
// TYPES
// ============================================

type ItemEffectWithItemName = ItemEffect & {
  items: { name: string } | null;
};

// ============================================
// CRUD ITEM EFFECTS
// ============================================

/**
 * Crea una nuova configurazione effetto per un item
 */
export async function createItemEffect(
  data: ItemEffectCreateInput
): Promise<{ success: boolean; item_effect?: ItemEffect; message?: string }> {
  try {
    const supabase = await createClient();

    const { data: itemEffect, error } = await supabase
      .from('item_effects')
      .insert({
        item_id: data.item_id,
        effect_type: data.effect_type,
        metadata: data.metadata as Record<string, unknown>,
        duration_minutes: data.duration_minutes ?? null,
        trigger_on: data.trigger_on ?? 'receive',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      item_effect: itemEffect,
    };
  } catch (error) {
    console.error('Error creating item effect:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ottiene tutti gli effetti configurati per un item
 */
export async function getItemEffects(
  itemId: string
): Promise<ItemEffect[]> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('item_effects')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    return data ?? [];
  } catch (error) {
    console.error('Error getting item effects:', error);
    return [];
  }
}

/**
 * Ottiene tutti gli item effects (per admin)
 */
export async function getAllItemEffects(): Promise<Array<ItemEffect & { item_name: string }>> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('item_effects')
      .select(`
        *,
        items (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (!data) return [];

    // Flatten la struttura con tipo corretto
    return (data as ItemEffectWithItemName[]).map(effect => ({
      ...effect,
      item_name: effect.items?.name || 'Unknown Item',
    }));
  } catch (error) {
    console.error('Error getting all item effects:', error);
    return [];
  }
}

/**
 * Aggiorna un item effect
 */
export async function updateItemEffect(
  itemEffectId: string,
  updates: ItemEffectUpdateInput
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('item_effects')
      .update({
        ...updates,
        metadata: updates.metadata as Record<string, unknown> | undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('item_effect_id', itemEffectId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating item effect:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Elimina un item effect
 */
export async function deleteItemEffect(
  itemEffectId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('item_effects')
      .delete()
      .eq('item_effect_id', itemEffectId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting item effect:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// TRIGGER LOGIC
// ============================================

/**
 * Applica gli effetti configurati per un item quando viene triggato
 * DA CHIAMARE nel tuo codice quando player riceve/usa item
 */
export async function applyItemEffects(
  playerId: string,
  episodeId: string,
  itemId: string,
  trigger: ItemEffectTrigger
): Promise<{ success: boolean; effects_applied: number; messages: string[] }> {
  try {
    const supabase = await createClient();

    // Trova tutti gli effetti attivi per questo item e trigger
    const { data: itemEffects } = await supabase
      .from('item_effects')
      .select('*')
      .eq('item_id', itemId)
      .eq('trigger_on', trigger)
      .eq('is_active', true);

    if (!itemEffects || itemEffects.length === 0) {
      return {
        success: true,
        effects_applied: 0,
        messages: [],
      };
    }

    const messages: string[] = [];
    let appliedCount = 0;

    // Applica ogni effetto configurato
    for (const effect of itemEffects) {
      const result = await applyEffectAction(
        playerId,
        episodeId,
        effect.effect_type,
        effect.metadata,
        effect.duration_minutes ?? undefined
      );

      if (result.success) {
        appliedCount++;
        messages.push(`Applied ${effect.effect_type}`);
      } else {
        messages.push(`Failed to apply ${effect.effect_type}: ${result.message}`);
      }
    }

    return {
      success: true,
      effects_applied: appliedCount,
      messages,
    };
  } catch (error) {
    console.error('Error applying item effects:', error);
    return {
      success: false,
      effects_applied: 0,
      messages: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}