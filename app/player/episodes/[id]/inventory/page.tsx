import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getPlayerEpisodeInventory } from '@/lib/actions/player-inventory-actions';
import { getEpisodeWithCheck } from '@/lib/actions/player-nodes-actions';
import { InventoryGrid } from './_components/inventory-grid';
import { InventoryLayout } from './_components/inventory-layout';

export default async function InventoryPage({ 
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

  const inventory = await getPlayerEpisodeInventory(player.player_id, id);

  return (
    <InventoryLayout
      episodeId={id}
      episodeName={episode.name}
      inventoryCount={inventory.length}
    >
      <InventoryGrid inventory={inventory} />
    </InventoryLayout>
  );
}