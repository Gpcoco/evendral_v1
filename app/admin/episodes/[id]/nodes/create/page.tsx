import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProgressItems, getInventoryItems, getAchievements } from '@/lib/actions/dropdown-data-actions';
import { NodeWizard } from '../_components/node-wizard';

export default async function CreateNodePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: episodeId } = await params;
  
  const supabase = await createClient();
  
  // Verify episode exists
  const { data: episode, error } = await supabase
    .from('episodes')
    .select('episode_id, name')
    .eq('episode_id', episodeId)
    .single();
  
  if (error || !episode) {
    redirect('/admin/episodes');
  }

  // Load dropdown data
  const [progressItems, inventoryItems, achievements] = await Promise.all([
    getProgressItems(episodeId),
    getInventoryItems(),
    getAchievements(),
  ]);

  return (
    <NodeWizard
      episodeId={episodeId}
      dropdownData={{
        progressItems,
        inventoryItems,
        achievements,
      }}
      mode="create"
    />
  );
}