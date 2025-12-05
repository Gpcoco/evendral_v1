import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getExchangeSession } from '@/lib/actions/exchange-actions';
import { getPlayerEpisodeInventory } from '@/lib/actions/player-inventory-actions';
import { ExchangeSessionView } from './_components/exchange-session-view';

export default async function ExchangeSessionPage({ 
  params 
}: { 
  params: Promise<{ id: string; sessionId: string }> 
}) {
  const { id, sessionId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');
  
  const player = await getPlayerByUserId(user.id);
  if (!player) redirect('/onboarding/player');

  const session = await getExchangeSession(sessionId);
  if (!session || session.episode_id !== id) {
    redirect(`/player/episodes/${id}/inventory`);
  }

  // Verifica che il giocatore faccia parte della sessione
  const isParticipant = 
    session.player_a_id === player.player_id || 
    session.player_b_id === player.player_id;

  if (!isParticipant) {
    redirect(`/player/episodes/${id}/inventory`);
  }

  // Ottieni l'inventario del giocatore locale
  const inventory = await getPlayerEpisodeInventory(player.player_id, id);

  return (
    <ExchangeSessionView
      sessionId={sessionId}
      episodeId={id}
      localPlayerId={player.player_id}
      initialSession={session}
      inventory={inventory}
    />
  );
}