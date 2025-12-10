'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ExchangeStatus = 'active' | 'completed' | 'cancelled';

export interface ExchangeSession {
  session_id: string;
  episode_id: string;
  player_a_id: string;
  player_b_id: string;
  player_a_item_id: string | null;
  player_b_item_id: string | null;
  player_a_confirmed: boolean;
  player_b_confirmed: boolean;
  status: ExchangeStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Crea una nuova sessione di scambio tra due giocatori
 */
export async function createExchangeSession(
  episodeId: string,
  playerAId: string,
  playerBId: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    console.log('Creating exchange session between:', playerAId, 'and', playerBId); 
    // Verifica che entrambi i giocatori esistano
    const { data: players, error: playersError } = await supabase
      .from('player')
      .select('player_id')
      .in('player_id', [playerAId, playerBId]);

    if (playersError || !players || players.length !== 2) {
      return { success: false, error: 'Uno o entrambi i giocatori non esistono' };
    }

    // Crea la sessione
    const { data, error } = await supabase
      .from('exchange_sessions')
      .insert({
        episode_id: episodeId,
        player_a_id: playerAId,
        player_b_id: playerBId,
      })
      .select('session_id')
      .single();

    if (error) throw error;

    return { success: true, sessionId: data.session_id };
  } catch (error) {
    console.error('Error creating exchange session:', error);
    return { success: false, error: 'Errore durante la creazione della sessione' };
  }
}

/**
 * Ottiene una sessione di scambio per ID
 */
export async function getExchangeSession(sessionId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('exchange_sessions')
      .select(`
        *,
        player_a:player!player_a_id(
          player_id,
          display_name,
          avatar_url,
          level,
          experience_points
        ),
        player_b:player!player_b_id(
          player_id,
          display_name,
          avatar_url,
          level,
          experience_points
        ),
        player_a_item:items!player_a_item_id(
          item_id,
          name,
          description,
          icon_url,
          rarity
        ),
        player_b_item:items!player_b_item_id(
          item_id,
          name,
          description,
          icon_url,
          rarity
        )
      `)
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching exchange session:', error);
    return null;
  }
}

/**
 * Seleziona un oggetto da scambiare
 */
export async function selectItemForExchange(
  sessionId: string,
  playerId: string,
  itemId: string,
  episodeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verifica che l'item appartenga al giocatore in questo episodio
    const { data: item, error: itemError } = await supabase
      .from('player_episode_inventory')
      .select('item_id, player_id, quantity')
      .eq('player_id', playerId)
      .eq('item_id', itemId)
      .eq('episode_id', episodeId)
      .single();

    if (itemError || !item) {
      return { success: false, error: 'Oggetto non trovato nel tuo inventario' };
    }

    // Determina se il giocatore è A o B
    const { data: session } = await supabase
      .from('exchange_sessions')
      .select('player_a_id, player_b_id')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      return { success: false, error: 'Sessione non trovata' };
    }
    console.log('session:', session);
    const isPlayerA = session.player_a_id === playerId;
    const updateField = isPlayerA ? 'player_a_item_id' : 'player_b_item_id';

    // Aggiorna la sessione
    const { error } = await supabase
      .from('exchange_sessions')
      .update({ [updateField]: itemId })
      .eq('session_id', sessionId)
      .eq('status', 'active');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error selecting item:', error);
    return { success: false, error: 'Errore durante la selezione dell\'oggetto' };
  }
}

/**
 * Conferma lo scambio
 */
export async function confirmExchange(
  sessionId: string,
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Ottieni la sessione corrente
    const { data: session, error: sessionError } = await supabase
      .from('exchange_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .single();

    if (sessionError || !session) {
      return { success: false, error: 'Sessione non valida' };
    }

    // Verifica che entrambi abbiano selezionato un oggetto
    if (!session.player_a_item_id || !session.player_b_item_id) {
      return { success: false, error: 'Entrambi i giocatori devono selezionare un oggetto' };
    }

    // Determina se il giocatore è A o B
    const isPlayerA = session.player_a_id === playerId;
    const confirmField = isPlayerA ? 'player_a_confirmed' : 'player_b_confirmed';
  

    // Aggiorna la conferma del giocatore
    const { data: updatedSession, error: updateError } = await supabase
      .from('exchange_sessions')
      .update({ [confirmField]: true })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Se entrambi hanno confermato, esegui lo scambio
    const bothConfirmed = isPlayerA 
      ? updatedSession.player_b_confirmed 
      : updatedSession.player_a_confirmed;

    if (bothConfirmed) {
      return await executeExchange(sessionId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error confirming exchange:', error);
    return { success: false, error: 'Errore durante la conferma' };
  }
}

/**
 * Esegue lo scambio effettivo degli oggetti
 */
// In exchange-actions.ts, sostituisci la funzione executeExchange
async function executeExchange(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Ottieni i dettagli della sessione
    const { data: session, error: sessionError } = await supabase
      .from('exchange_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    console.log('session in executeExchange:', session);
    if (sessionError || !session) {
      return { success: false, error: 'Sessione non trovata' };
    }

    // RIMOSSO: La verifica buggy che causava il problema
    // La funzione RPC swap_inventory_items già gestisce gli errori con RAISE EXCEPTION

    // Esegui lo scambio usando la funzione database
    const { error: swapError } = await supabase.rpc('swap_inventory_items', {
      p_session_id: sessionId
    });
    console.log('swapError:', swapError);
    if (swapError) {
      // Se la funzione RPC fallisce, annulla la sessione
      await supabase
        .from('exchange_sessions')
        .update({ status: 'cancelled' })
        .eq('session_id', sessionId);
        
      throw swapError;
    }

    // Marca la sessione come completata
    const { error: completeError } = await supabase
      .from('exchange_sessions')
      .update({ status: 'completed' })
      .eq('session_id', sessionId);

    if (completeError) throw completeError;

    // Revalida i path
    revalidatePath(`/player/episodes/${session.episode_id}/inventory`);

    return { success: true };
  } catch (error) {
    console.error('Error executing exchange:', error);
    return { success: false, error: 'Errore durante l\'esecuzione dello scambio' };
  }
}

/**
 * Annulla una sessione di scambio
 */
export async function cancelExchangeSession(sessionId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('exchange_sessions')
      .update({ status: 'cancelled' })
      .eq('session_id', sessionId)
      .eq('status', 'active');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error cancelling exchange session:', error);
    return { success: false };
  }
}