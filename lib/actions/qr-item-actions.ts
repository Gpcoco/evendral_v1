'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addItemFromQr(itemId: string, playerId: string, episodeId: string) {
  const supabase = await createClient();
  
  // Verifica che l'item esista
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('item_id', itemId)
    .single();
  
  if (itemError || !item) {
    return { success: false, message: 'Item non trovato' };
  }
  
  // Verifica che l'item sia valido per questo episodio o adventure
  const { data: episode } = await supabase
    .from('episodes')
    .select('adventure_id')
    .eq('episode_id', episodeId)
    .single();
  
  const isValidItem = 
    !item.episode_id && !item.adventure_id || // Item globale
    item.episode_id === episodeId || // Item specifico episodio
    item.adventure_id === episode?.adventure_id; // Item specifico adventure
  
  if (!isValidItem) {
    return { success: false, message: 'Item non valido per questo episodio' };
  }
  
  // Aggiungi o incrementa quantità
  const { data: existing } = await supabase
    .from('player_episode_inventory')
    .select('*')
    .eq('player_id', playerId)
    .eq('item_id', itemId)
    .eq('episode_id', episodeId)
    .single();
  
  if (existing && item.is_stackable) {
    // Incrementa quantità se stackable
    const { error } = await supabase
      .from('player_episode_inventory')
      .update({ quantity: existing.quantity + 1 })
      .eq('player_id', playerId)
      .eq('item_id', itemId)
      .eq('episode_id', episodeId);
    
    if (error) return { success: false, message: 'Errore aggiornamento inventario' };
  } else if (!existing) {
    // Crea nuovo record
    const { error } = await supabase
      .from('player_episode_inventory')
      .insert({
        player_id: playerId,
        item_id: itemId,
        episode_id: episodeId,
        quantity: 1,
      });
    
    if (error) return { success: false, message: 'Errore aggiunta item' };
  } else {
    return { success: false, message: 'Hai già questo item (non stackable)' };
  }
  
  revalidatePath(`/player/episodes/${episodeId}`);
  return { success: true, message: `${item.name} aggiunto!`, item };
}