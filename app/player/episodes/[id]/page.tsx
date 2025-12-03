import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getUnlockedNodes, getEpisodeWithCheck } from '@/lib/actions/player-nodes-actions';
import { getPlayerEpisodeInventory } from '@/lib/actions/player-inventory-actions';
import { EpisodeLayout } from './_components/episode-layout';

export default async function PlayerEpisodePage({ 
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

  const nodes = await getUnlockedNodes(id, player.player_id);
  const inventory = await getPlayerEpisodeInventory(player.player_id, id);

  return (
    <EpisodeLayout
      episode={episode}
      player={player}
      nodes={nodes}
      inventory={inventory}
      episodeId={id}
    />
  );
}