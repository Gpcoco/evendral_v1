import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getEpisodeWithCheck } from '@/lib/actions/player-nodes-actions';
import { getActiveStatusEffects, getPlayerEpisodeStats } from '@/lib/actions/player-status-actions';
import { getPlayerEpisodeInventory } from '@/lib/actions/player-inventory-actions';
import { ProfileLayout } from './_components/profile-layout';

export default async function ProfilePage({ 
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

  // Crea record stats se non esiste
  let episodeStats = await getPlayerEpisodeStats(player.player_id, id);
  if (!episodeStats) {
    await supabase.from('player_episode_stats').insert({
      player_id: player.player_id,
      episode_id: id
    });
    episodeStats = await getPlayerEpisodeStats(player.player_id, id);
  }

  const [statusEffects, inventory] = await Promise.all([
    getActiveStatusEffects(player.player_id, id),
    getPlayerEpisodeInventory(player.player_id, id)
  ]);

  return (
    <ProfileLayout
      episodeId={id}
      episodeName={episode.name}
      player={player}
      statusEffects={statusEffects}
      episodeStats={episodeStats}
      inventoryCount={inventory.length}
    />
  );
}