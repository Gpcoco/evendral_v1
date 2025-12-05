import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getEpisodeWithCheck } from '@/lib/actions/player-nodes-actions';
import { ExchangeView } from './_components/exchange-view';

export default async function ExchangePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');
  
  const player = await getPlayerByUserId(user.id);
  if (!player) redirect('/onboarding/player');

  const episode = await getEpisodeWithCheck(id);
  if (!episode) redirect('/player/profile');

  return (
    <ExchangeView 
      episodeId={id}
      episodeName={episode.name}
      playerId={player.player_id}
    />
  );
}