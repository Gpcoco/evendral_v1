import { getNodesByEpisode, createNode, deleteNode } from '@/lib/actions/nodes-actions';
import { getNodeLogic } from '@/lib/actions/node-logic-actions';
import { getProgressItems, getInventoryItems, getAchievements } from '@/lib/actions/dropdown-data-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NodeLogicDialog } from './_components/node-logic-dialog';
import { EditNodeDialog } from './_components/edit-node-dialog';

export default async function EpisodeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  
  const { data: episode } = await supabase
    .from('episodes')
    .select('*')
    .eq('episode_id', id)
    .single();
  
  if (!episode) redirect('/admin/episodes');
  
  const [nodes, progressItems, inventoryItems, achievements] = await Promise.all([
    getNodesByEpisode(id),
    getProgressItems(id),
    getInventoryItems(),
    getAchievements(),
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/episodes" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Episodes
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{episode.name}</h1>
      <p className="text-muted-foreground mb-8">Manage story nodes for this episode</p>

      <div className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Node</h2>
        <form action={createNode} className="space-y-4">
          <input type="hidden" name="episode_id" value={id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Node Name*</Label>
              <Input id="name" name="name" required placeholder="Chapter 1: The Beginning" />
            </div>
            <div>
              <Label htmlFor="node_category">Category</Label>
              <select id="node_category" name="node_category" className="w-full border rounded px-3 py-2">
                <option value="main_story">Main Story</option>
                <option value="side_quest">Side Quest</option>
                <option value="tutorial">Tutorial</option>
                <option value="ending">Ending</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="content_html">Content HTML*</Label>
            <textarea 
              id="content_html" 
              name="content_html" 
              required
              className="w-full border rounded px-3 py-2 min-h-32 font-mono text-sm"
              placeholder="<div><h2>Welcome!</h2><p>Your adventure begins...</p></div>"
            />
          </div>
          
          <Button type="submit">Create Node</Button>
        </form>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-muted">
          <h2 className="text-lg font-semibold">Nodes ({nodes.length})</h2>
        </div>
        
        {nodes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No nodes yet. Create your first node above.
          </div>
        ) : (
          <div className="divide-y">
            {nodes.map(async (node) => {
              const logic = await getNodeLogic(node.node_id);
              
              return (
                <div key={node.node_id} className="p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{node.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                          {node.node_category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(node.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <EditNodeDialog node={node} episodeId={id} />
                      <NodeLogicDialog 
                        nodeId={node.node_id}
                        nodeName={node.name}
                        episodeId={id}
                        conditions={logic.conditions}
                        targets={logic.targets}
                        effects={logic.effects}
                        progressItems={progressItems}
                        inventoryItems={inventoryItems}
                        achievements={achievements}
                      />
                      <form action={deleteNode.bind(null, node.node_id, id)}>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}