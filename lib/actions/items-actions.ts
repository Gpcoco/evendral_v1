'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ItemInsert, ItemUpdate } from '@/lib/types/database';
import { applyItemEffects } from './item-effects';



const ADVENTURE_ID = process.env.NEXT_PUBLIC_ADVENTURE_ID!;

export async function getItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('adventure_id', ADVENTURE_ID)
    .is('episode_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createItem(item: ItemInsert) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .insert({ ...item, adventure_id: ADVENTURE_ID, episode_id: null });

  if (error) throw error;
  revalidatePath('/admin/items');
}

export async function updateItem(id: string, item: ItemUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .update(item)
    .eq('item_id', id)
    .eq('adventure_id', ADVENTURE_ID);

  if (error) throw error;
  revalidatePath('/admin/items');
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('item_id', id)
    .eq('adventure_id', ADVENTURE_ID);

  if (error) throw error;
  revalidatePath('/admin/items');
}


/**
 * Dai un item a un player
 * AGGIORNATO con supporto effetti
 */
export async function giveItemToPlayer(
  playerId: string,
  episodeId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();

    // 1. Aggiungi item all'inventario
    const { error: inventoryError } = await supabase
      .from('player_episode_inventory')
      .upsert({
        player_id: playerId,
        episode_id: episodeId,
        item_id: itemId,
        quantity,
      }, {
        onConflict: 'player_id,item_id,episode_id',
      });

    if (inventoryError) throw inventoryError;

    // 2. 🎯 NUOVO: Applica effetti configurati per "receive"
    const effectResult = await applyItemEffects(
      playerId,
      episodeId,
      itemId,
      'receive' // Trigger "quando riceve item"
    );

    console.log('Item effects:', effectResult);

    return {
      success: true,
      message: effectResult.effects_applied > 0
        ? `Item dato + ${effectResult.effects_applied} effetti applicati`
        : 'Item dato',
    };
  } catch (error) {
    console.error('Error giving item:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Player usa un item consumabile
 * NUOVO con supporto effetti
 */
export async function useConsumableItem(
  playerId: string,
  episodeId: string,
  itemId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();

    // 1. Verifica che player abbia l'item
    const { data: inventory } = await supabase
      .from('player_episode_inventory')
      .select('quantity')
      .eq('player_id', playerId)
      .eq('episode_id', episodeId)
      .eq('item_id', itemId)
      .single();

    if (!inventory || inventory.quantity < 1) {
      return {
        success: false,
        message: 'Item non disponibile',
      };
    }

    // 2. Rimuovi 1 quantità (o elimina se era l'ultimo)
    if (inventory.quantity === 1) {
      await supabase
        .from('player_episode_inventory')
        .delete()
        .eq('player_id', playerId)
        .eq('episode_id', episodeId)
        .eq('item_id', itemId);
    } else {
      await supabase
        .from('player_episode_inventory')
        .update({ quantity: inventory.quantity - 1 })
        .eq('player_id', playerId)
        .eq('episode_id', episodeId)
        .eq('item_id', itemId);
    }

    // 3. 🎯 Applica effetti configurati per "use"
    const effectResult = await applyItemEffects(
      playerId,
      episodeId,
      itemId,
      'use' // Trigger "quando usa item"
    );

    return {
      success: true,
      message: effectResult.effects_applied > 0
        ? `Item usato + ${effectResult.effects_applied} effetti applicati`
        : 'Item usato',
    };
  } catch (error) {
    console.error('Error using item:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}