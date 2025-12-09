import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProgressItems, getInventoryItems, getAchievements } from '@/lib/actions/dropdown-data-actions';
import { getNodeWithLogic } from '@/lib/actions/nodes-actions';
import { NodeWizard } from '../../_components/node-wizard';

export default async function EditNodePage({ 
  params 
}: { 
  params: Promise<{ id: string, nodeId: string }> 
}) {
  const { id: episodeId, nodeId } = await params;
  
  const supabase = await createClient();
  
  // Verify episode exists
  const { data: episode, error: episodeError } = await supabase
    .from('episodes')
    .select('episode_id, name')
    .eq('episode_id', episodeId)
    .single();
  
  if (episodeError || !episode) {
    redirect('/admin/episodes');
  }

  // Load node with full logic
  let existingNode;
  try {
    existingNode = await getNodeWithLogic(nodeId);
    
    // Verify node belongs to this episode
    if (existingNode.episode_id !== episodeId) {
      redirect(`/admin/episodes/${episodeId}`);
    }
  } catch {
    redirect(`/admin/episodes/${episodeId}`);
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
      mode="edit"
      existingNode={existingNode}
    />
  );
}